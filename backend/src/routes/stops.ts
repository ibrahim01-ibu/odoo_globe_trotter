import { Router } from 'express';
import { prisma } from '../index.js';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';

const router = Router();

// PUT /stops/:id - Update stop
router.put('/:id', authMiddleware, async (req: AuthRequest, res) => {
    try {
        const { startDate, endDate, stopOrder } = req.body;

        const stop = await prisma.tripStop.findUnique({
            where: { id: req.params.id },
            include: { trip: true },
        });

        if (!stop || stop.trip.userId !== req.userId) {
            return res.status(404).json({ error: 'Stop not found' });
        }

        const updated = await prisma.tripStop.update({
            where: { id: req.params.id },
            data: {
                ...(startDate && { startDate: new Date(startDate) }),
                ...(endDate && { endDate: new Date(endDate) }),
                ...(stopOrder !== undefined && { stopOrder }),
            },
            include: { city: true },
        });

        res.json({ stop: updated });
    } catch (error) {
        console.error('Update stop error:', error);
        res.status(500).json({ error: 'Failed to update stop' });
    }
});

// DELETE /stops/:id - Delete stop
router.delete('/:id', authMiddleware, async (req: AuthRequest, res) => {
    try {
        const stop = await prisma.tripStop.findUnique({
            where: { id: req.params.id },
            include: { trip: true },
        });

        if (!stop || stop.trip.userId !== req.userId) {
            return res.status(404).json({ error: 'Stop not found' });
        }

        await prisma.tripStop.delete({ where: { id: req.params.id } });

        // Reorder remaining stops
        const remainingStops = await prisma.tripStop.findMany({
            where: { tripId: stop.tripId },
            orderBy: { stopOrder: 'asc' },
        });

        await Promise.all(
            remainingStops.map((s, index) =>
                prisma.tripStop.update({
                    where: { id: s.id },
                    data: { stopOrder: index + 1 },
                })
            )
        );

        res.json({ success: true });
    } catch (error) {
        console.error('Delete stop error:', error);
        res.status(500).json({ error: 'Failed to delete stop' });
    }
});

export default router;
