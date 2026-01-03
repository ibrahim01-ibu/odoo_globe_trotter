import { Router } from 'express';
import { prisma } from '../index.js';

const router = Router();

// GET /public/:id - View public trip snapshot
router.get('/:id', async (req, res) => {
    try {
        const publicTrip = await prisma.publicTrip.findUnique({
            where: { tripId: req.params.id },
        });

        if (!publicTrip) {
            // Fallback to live data if no snapshot exists but trip is public
            const trip = await prisma.trip.findFirst({
                where: { id: req.params.id, isPublic: true },
                include: {
                    stops: { include: { city: true }, orderBy: { stopOrder: 'asc' } },
                    activities: { include: { activity: { include: { city: true } } }, orderBy: { date: 'asc' } },
                },
            });

            if (!trip) {
                return res.status(404).json({ error: 'Public trip not found' });
            }

            return res.json({ trip, isSnapshot: false });
        }

        res.json({ trip: JSON.parse(publicTrip.snapshotJson), isSnapshot: true });
    } catch (error) {
        console.error('Get public trip error:', error);
        res.status(500).json({ error: 'Failed to fetch public trip' });
    }
});

export default router;
