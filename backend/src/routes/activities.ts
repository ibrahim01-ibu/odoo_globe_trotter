import { Router } from 'express';
import { prisma } from '../index.js';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';

const router = Router();

// DELETE /activities/:id - Remove activity from day
router.delete('/:id', authMiddleware, async (req: AuthRequest, res) => {
    try {
        const dayActivity = await prisma.dayActivity.findUnique({
            where: { id: req.params.id },
            include: { trip: true },
        });

        if (!dayActivity || dayActivity.trip.userId !== req.userId) {
            return res.status(404).json({ error: 'Activity not found' });
        }

        await prisma.dayActivity.delete({ where: { id: req.params.id } });

        res.json({ success: true });
    } catch (error) {
        console.error('Delete activity error:', error);
        res.status(500).json({ error: 'Failed to delete activity' });
    }
});

export default router;
