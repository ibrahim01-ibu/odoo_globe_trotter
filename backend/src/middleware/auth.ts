import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../index.js';

const JWT_SECRET = process.env.JWT_SECRET || 'globetrotter-secret-key';

export interface AuthRequest extends Request {
    userId?: string;
}

export async function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];

    try {
        // Check if token is blacklisted
        const blacklisted = await prisma.tokenBlacklist.findUnique({
            where: { token }
        });

        if (blacklisted) {
            return res.status(401).json({ error: 'Token has been revoked' });
        }

        const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; type?: string };

        // Ensure it's an access token, not a refresh token
        if (decoded.type && decoded.type !== 'access') {
            return res.status(401).json({ error: 'Invalid token type' });
        }

        req.userId = decoded.userId;
        next();
    } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            return res.status(401).json({ error: 'Token expired', code: 'TOKEN_EXPIRED' });
        }
        return res.status(401).json({ error: 'Invalid token' });
    }
}

// Optional: Non-blocking auth middleware (for routes that work with or without auth)
export async function optionalAuthMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return next();
    }

    const token = authHeader.split(' ')[1];

    try {
        const blacklisted = await prisma.tokenBlacklist.findUnique({ where: { token } });
        if (blacklisted) {
            return next();
        }

        const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
        req.userId = decoded.userId;
    } catch {
        // Ignore token errors for optional auth
    }

    next();
}
