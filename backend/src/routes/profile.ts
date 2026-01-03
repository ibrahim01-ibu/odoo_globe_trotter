import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../index.js';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// GET /profile - Get current user profile
router.get('/', async (req: AuthRequest, res: Response) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.userId },
            select: {
                id: true,
                email: true,
                name: true,
                homeCountry: true,
                currency: true,
                createdAt: true,
                updatedAt: true,
                _count: {
                    select: { trips: true }
                }
            },
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                homeCountry: user.homeCountry,
                currency: user.currency,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
                tripCount: user._count.trips,
            }
        });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ error: 'Failed to get profile' });
    }
});

// PUT /profile - Update user profile
router.put('/', async (req: AuthRequest, res: Response) => {
    try {
        const { name, email, homeCountry, currency } = req.body;

        // Get current user
        const currentUser = await prisma.user.findUnique({
            where: { id: req.userId },
        });

        if (!currentUser) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Build update data
        const updateData: any = {};

        // Update name if provided
        if (name !== undefined) {
            updateData.name = name.trim() || null;
        }

        if (homeCountry) updateData.homeCountry = homeCountry;
        if (currency) updateData.currency = currency;

        // Update email if provided
        if (email && email !== currentUser.email) {
            // Validate email format
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                return res.status(400).json({ error: 'Invalid email format' });
            }

            // Check if email is already in use
            const existingUser = await prisma.user.findUnique({
                where: { email },
            });
            if (existingUser) {
                return res.status(400).json({ error: 'Email already in use' });
            }

            updateData.email = email;
        }

        // Perform update
        const updatedUser = await prisma.user.update({
            where: { id: req.userId },
            data: updateData,
            select: {
                id: true,
                email: true,
                name: true,
                createdAt: true,
                updatedAt: true,
            },
        });

        res.json({
            success: true,
            message: 'Profile updated successfully',
            user: updatedUser,
        });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ error: 'Failed to update profile' });
    }
});

// DELETE /profile - Delete user account
router.delete('/', async (req: AuthRequest, res: Response) => {
    try {
        const { password } = req.body;

        // Require password confirmation for account deletion
        if (!password) {
            return res.status(400).json({ error: 'Password required to delete account' });
        }

        // Get user with password hash
        const user = await prisma.user.findUnique({
            where: { id: req.userId },
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Verify password
        const validPassword = await bcrypt.compare(password, user.passwordHash);
        if (!validPassword) {
            return res.status(401).json({ error: 'Incorrect password' });
        }

        // Delete user - cascade will handle related records
        // (trips, refresh tokens, password resets are configured with onDelete: Cascade)
        await prisma.user.delete({
            where: { id: req.userId },
        });

        res.json({
            success: true,
            message: 'Account deleted successfully',
        });
    } catch (error) {
        console.error('Delete account error:', error);
        res.status(500).json({ error: 'Failed to delete account' });
    }
});

export default router;
