import { Router, Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import rateLimit from 'express-rate-limit';
import { prisma } from '../index.js';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'globetrotter-secret-key';
const REFRESH_SECRET = process.env.REFRESH_SECRET || 'globetrotter-refresh-secret';

// Token expiry settings
const ACCESS_TOKEN_EXPIRY = '15m';  // Short-lived access token
const REFRESH_TOKEN_EXPIRY_DAYS = 30;

// Rate limiting - prevent brute force attacks
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // 10 attempts per window
    message: { error: 'Too many attempts, please try again after 15 minutes' },
    standardHeaders: true,
    legacyHeaders: false,
});

const passwordResetLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3, // 3 attempts per hour
    message: { error: 'Too many password reset requests, please try again later' },
});

// Helper: Generate tokens
function generateAccessToken(userId: string): string {
    return jwt.sign({ userId, type: 'access' }, JWT_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRY });
}

function generateRefreshToken(): string {
    return crypto.randomBytes(64).toString('hex');
}

// Helper: Cleanup expired tokens (called periodically)
async function cleanupExpiredTokens() {
    const now = new Date();
    await prisma.refreshToken.deleteMany({ where: { expiresAt: { lt: now } } });
    await prisma.passwordReset.deleteMany({ where: { expiresAt: { lt: now } } });
    await prisma.tokenBlacklist.deleteMany({ where: { expiresAt: { lt: now } } });
}

// Run cleanup every hour
setInterval(cleanupExpiredTokens, 60 * 60 * 1000);

// POST /auth/signup
router.post('/signup', authLimiter, async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password required' });
        }

        if (password.length < 6) {
            return res.status(400).json({ error: 'Password must be at least 6 characters' });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ error: 'Invalid email format' });
        }

        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ error: 'Email already registered' });
        }

        const passwordHash = await bcrypt.hash(password, 12); // Increased rounds for security
        const user = await prisma.user.create({
            data: { email, passwordHash },
        });

        // Generate tokens
        const accessToken = generateAccessToken(user.id);
        const refreshToken = generateRefreshToken();

        // Store refresh token
        const expiresAt = new Date(Date.now() + REFRESH_TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000);
        await prisma.refreshToken.create({
            data: {
                userId: user.id,
                token: refreshToken,
                expiresAt,
            },
        });

        res.status(201).json({
            user: { id: user.id, email: user.email },
            accessToken,
            refreshToken,
            expiresIn: 900, // 15 minutes in seconds
        });
    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ error: 'Failed to create account' });
    }
});

// POST /auth/login
router.post('/login', authLimiter, async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password required' });
        }

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const validPassword = await bcrypt.compare(password, user.passwordHash);
        if (!validPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Generate tokens
        const accessToken = generateAccessToken(user.id);
        const refreshToken = generateRefreshToken();

        // Store refresh token
        const expiresAt = new Date(Date.now() + REFRESH_TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000);
        await prisma.refreshToken.create({
            data: {
                userId: user.id,
                token: refreshToken,
                expiresAt,
            },
        });

        res.json({
            user: { id: user.id, email: user.email },
            accessToken,
            refreshToken,
            expiresIn: 900,
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Failed to login' });
    }
});

// POST /auth/refresh - Get new access token using refresh token
router.post('/refresh', async (req: Request, res: Response) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(400).json({ error: 'Refresh token required' });
        }

        // Find and validate refresh token
        const storedToken = await prisma.refreshToken.findUnique({
            where: { token: refreshToken },
            include: { user: true },
        });

        if (!storedToken) {
            return res.status(401).json({ error: 'Invalid refresh token' });
        }

        if (storedToken.expiresAt < new Date()) {
            await prisma.refreshToken.delete({ where: { id: storedToken.id } });
            return res.status(401).json({ error: 'Refresh token expired' });
        }

        // Generate new access token
        const accessToken = generateAccessToken(storedToken.userId);

        // Optional: Rotate refresh token for extra security
        const newRefreshToken = generateRefreshToken();
        const expiresAt = new Date(Date.now() + REFRESH_TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000);

        // Delete old, create new
        await prisma.refreshToken.delete({ where: { id: storedToken.id } });
        await prisma.refreshToken.create({
            data: {
                userId: storedToken.userId,
                token: newRefreshToken,
                expiresAt,
            },
        });

        res.json({
            accessToken,
            refreshToken: newRefreshToken,
            expiresIn: 900,
        });
    } catch (error) {
        console.error('Refresh error:', error);
        res.status(500).json({ error: 'Failed to refresh token' });
    }
});

// POST /auth/logout - Invalidate tokens
router.post('/logout', async (req: Request, res: Response) => {
    try {
        const { refreshToken } = req.body;
        const authHeader = req.headers.authorization;

        // Revoke refresh token if provided
        if (refreshToken) {
            await prisma.refreshToken.deleteMany({ where: { token: refreshToken } });
        }

        // Blacklist access token if provided
        if (authHeader?.startsWith('Bearer ')) {
            const accessToken = authHeader.split(' ')[1];
            try {
                const decoded = jwt.verify(accessToken, JWT_SECRET) as { exp: number };
                const expiresAt = new Date(decoded.exp * 1000);

                await prisma.tokenBlacklist.create({
                    data: { token: accessToken, expiresAt },
                });
            } catch {
                // Token already expired or invalid, no need to blacklist
            }
        }

        res.json({ success: true, message: 'Logged out successfully' });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({ error: 'Failed to logout' });
    }
});

// POST /auth/logout-all - Invalidate all user sessions
router.post('/logout-all', async (req: Request, res: Response) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader?.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'No token provided' });
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };

        // Delete all refresh tokens for this user
        await prisma.refreshToken.deleteMany({ where: { userId: decoded.userId } });

        res.json({ success: true, message: 'All sessions logged out' });
    } catch (error) {
        console.error('Logout-all error:', error);
        res.status(500).json({ error: 'Failed to logout all sessions' });
    }
});

// POST /auth/forgot-password - Request password reset
router.post('/forgot-password', passwordResetLimiter, async (req: Request, res: Response) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ error: 'Email required' });
        }

        const user = await prisma.user.findUnique({ where: { email } });

        // Always return success to prevent email enumeration
        if (!user) {
            return res.json({ success: true, message: 'If the email exists, a reset link has been sent' });
        }

        // Generate reset token
        const resetToken = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

        // Invalidate any existing reset tokens
        await prisma.passwordReset.updateMany({
            where: { userId: user.id, used: false },
            data: { used: true },
        });

        // Create new reset token
        await prisma.passwordReset.create({
            data: {
                userId: user.id,
                token: resetToken,
                expiresAt,
            },
        });

        // In production, send email here
        // For demo, we'll return the token (remove in production!)
        console.log(`Password reset token for ${email}: ${resetToken}`);

        res.json({
            success: true,
            message: 'If the email exists, a reset link has been sent',
            // DEMO ONLY - remove in production
            _demoToken: resetToken,
        });
    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({ error: 'Failed to process request' });
    }
});

// POST /auth/reset-password - Reset password with token
router.post('/reset-password', authLimiter, async (req: Request, res: Response) => {
    try {
        const { token, newPassword } = req.body;

        if (!token || !newPassword) {
            return res.status(400).json({ error: 'Token and new password required' });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ error: 'Password must be at least 6 characters' });
        }

        // Find and validate reset token
        const resetRecord = await prisma.passwordReset.findUnique({
            where: { token },
            include: { user: true },
        });

        if (!resetRecord) {
            return res.status(400).json({ error: 'Invalid or expired reset token' });
        }

        if (resetRecord.used) {
            return res.status(400).json({ error: 'Reset token already used' });
        }

        if (resetRecord.expiresAt < new Date()) {
            return res.status(400).json({ error: 'Reset token expired' });
        }

        // Update password
        const passwordHash = await bcrypt.hash(newPassword, 12);
        await prisma.user.update({
            where: { id: resetRecord.userId },
            data: { passwordHash },
        });

        // Mark token as used
        await prisma.passwordReset.update({
            where: { id: resetRecord.id },
            data: { used: true },
        });

        // Invalidate all existing refresh tokens (force re-login)
        await prisma.refreshToken.deleteMany({ where: { userId: resetRecord.userId } });

        res.json({ success: true, message: 'Password reset successfully' });
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ error: 'Failed to reset password' });
    }
});

// POST /auth/change-password - Change password (authenticated)
router.post('/change-password', async (req: Request, res: Response) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader?.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'No token provided' });
        }

        const token = authHeader.split(' ')[1];

        // Check if token is blacklisted
        const blacklisted = await prisma.tokenBlacklist.findUnique({ where: { token } });
        if (blacklisted) {
            return res.status(401).json({ error: 'Token has been revoked' });
        }

        const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ error: 'Current and new password required' });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ error: 'New password must be at least 6 characters' });
        }

        const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Verify current password
        const validPassword = await bcrypt.compare(currentPassword, user.passwordHash);
        if (!validPassword) {
            return res.status(401).json({ error: 'Current password is incorrect' });
        }

        // Update password
        const passwordHash = await bcrypt.hash(newPassword, 12);
        await prisma.user.update({
            where: { id: user.id },
            data: { passwordHash },
        });

        res.json({ success: true, message: 'Password changed successfully' });
    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({ error: 'Failed to change password' });
    }
});

// GET /auth/me - Get current user
router.get('/me', async (req: Request, res: Response) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader?.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'No token provided' });
        }

        const token = authHeader.split(' ')[1];

        // Check if token is blacklisted
        const blacklisted = await prisma.tokenBlacklist.findUnique({ where: { token } });
        if (blacklisted) {
            return res.status(401).json({ error: 'Token has been revoked' });
        }

        const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };

        const user = await prisma.user.findUnique({
            where: { id: decoded.userId },
            select: { id: true, email: true, createdAt: true },
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({ user });
    } catch (error) {
        res.status(401).json({ error: 'Invalid token' });
    }
});

// GET /auth/sessions - List active sessions
router.get('/sessions', async (req: Request, res: Response) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader?.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'No token provided' });
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };

        const sessions = await prisma.refreshToken.findMany({
            where: { userId: decoded.userId },
            select: { id: true, createdAt: true, expiresAt: true },
            orderBy: { createdAt: 'desc' },
        });

        res.json({
            sessions: sessions.map(s => ({
                id: s.id,
                createdAt: s.createdAt,
                expiresAt: s.expiresAt,
            })),
            count: sessions.length,
        });
    } catch (error) {
        res.status(401).json({ error: 'Invalid token' });
    }
});

// DELETE /auth/sessions/:id - Revoke specific session
router.delete('/sessions/:id', async (req: Request, res: Response) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader?.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'No token provided' });
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };

        const session = await prisma.refreshToken.findUnique({
            where: { id: req.params.id },
        });

        if (!session || session.userId !== decoded.userId) {
            return res.status(404).json({ error: 'Session not found' });
        }

        await prisma.refreshToken.delete({ where: { id: req.params.id } });

        res.json({ success: true, message: 'Session revoked' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to revoke session' });
    }
});

export default router;
