import { Router } from 'express';
import { prisma } from '../index.js';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';

const router = Router();

// GET /trips - List user's trips
router.get('/', authMiddleware, async (req: AuthRequest, res) => {
    try {
        const trips = await prisma.trip.findMany({
            where: { userId: req.userId },
            include: {
                stops: {
                    include: { city: true },
                    orderBy: { stopOrder: 'asc' },
                },
                _count: { select: { activities: true } },
            },
            orderBy: { createdAt: 'desc' },
        });

        res.json({ trips });
    } catch (error) {
        console.error('Get trips error:', error);
        res.status(500).json({ error: 'Failed to fetch trips' });
    }
});

// POST /trips - Create new trip
router.post('/', authMiddleware, async (req: AuthRequest, res) => {
    try {
        const { name, description, startDate, endDate } = req.body;

        if (!name || !startDate || !endDate) {
            return res.status(400).json({ error: 'Name, start date, and end date required' });
        }

        const trip = await prisma.trip.create({
            data: {
                userId: req.userId!,
                name,
                description,
                startDate: new Date(startDate),
                endDate: new Date(endDate),
            },
            include: {
                stops: { include: { city: true } },
            },
        });

        res.status(201).json({ trip });
    } catch (error) {
        console.error('Create trip error:', error);
        res.status(500).json({ error: 'Failed to create trip' });
    }
});

// GET /trips/:id - Get trip with all details
router.get('/:id', authMiddleware, async (req: AuthRequest, res) => {
    try {
        const trip = await prisma.trip.findFirst({
            where: { id: req.params.id, userId: req.userId },
            include: {
                stops: {
                    include: { city: true },
                    orderBy: { stopOrder: 'asc' },
                },
                activities: {
                    include: { activity: { include: { city: true } } },
                    orderBy: { date: 'asc' },
                },
            },
        });

        if (!trip) {
            return res.status(404).json({ error: 'Trip not found' });
        }

        res.json({ trip });
    } catch (error) {
        console.error('Get trip error:', error);
        res.status(500).json({ error: 'Failed to fetch trip' });
    }
});

// PUT /trips/:id - Update trip
router.put('/:id', authMiddleware, async (req: AuthRequest, res) => {
    try {
        const { name, description, startDate, endDate, isPublic } = req.body;

        const existing = await prisma.trip.findFirst({
            where: { id: req.params.id, userId: req.userId },
        });

        if (!existing) {
            return res.status(404).json({ error: 'Trip not found' });
        }

        const trip = await prisma.trip.update({
            where: { id: req.params.id },
            data: {
                ...(name && { name }),
                ...(description !== undefined && { description }),
                ...(startDate && { startDate: new Date(startDate) }),
                ...(endDate && { endDate: new Date(endDate) }),
                ...(isPublic !== undefined && { isPublic }),
            },
            include: {
                stops: { include: { city: true }, orderBy: { stopOrder: 'asc' } },
                activities: { include: { activity: true }, orderBy: { date: 'asc' } },
            },
        });

        res.json({ trip });
    } catch (error) {
        console.error('Update trip error:', error);
        res.status(500).json({ error: 'Failed to update trip' });
    }
});

// DELETE /trips/:id - Delete trip
router.delete('/:id', authMiddleware, async (req: AuthRequest, res) => {
    try {
        const existing = await prisma.trip.findFirst({
            where: { id: req.params.id, userId: req.userId },
        });

        if (!existing) {
            return res.status(404).json({ error: 'Trip not found' });
        }

        await prisma.trip.delete({ where: { id: req.params.id } });

        res.json({ success: true });
    } catch (error) {
        console.error('Delete trip error:', error);
        res.status(500).json({ error: 'Failed to delete trip' });
    }
});

// POST /trips/:id/stops - Add city stop
router.post('/:id/stops', authMiddleware, async (req: AuthRequest, res) => {
    try {
        const { cityId, startDate, endDate } = req.body;

        const trip = await prisma.trip.findFirst({
            where: { id: req.params.id, userId: req.userId },
            include: { stops: true },
        });

        if (!trip) {
            return res.status(404).json({ error: 'Trip not found' });
        }

        const stopOrder = trip.stops.length + 1;

        const stop = await prisma.tripStop.create({
            data: {
                tripId: req.params.id,
                cityId,
                startDate: new Date(startDate),
                endDate: new Date(endDate),
                stopOrder,
            },
            include: { city: true },
        });

        res.status(201).json({ stop });
    } catch (error) {
        console.error('Add stop error:', error);
        res.status(500).json({ error: 'Failed to add stop' });
    }
});

// POST /trips/:id/activities - Add activity to day
router.post('/:id/activities', authMiddleware, async (req: AuthRequest, res) => {
    try {
        const { activityId, date, timeSlot } = req.body;

        const trip = await prisma.trip.findFirst({
            where: { id: req.params.id, userId: req.userId },
            include: { stops: true },
        });

        if (!trip) {
            return res.status(404).json({ error: 'Trip not found' });
        }

        // Validate date is within trip range
        const activityDate = new Date(date);
        if (activityDate < trip.startDate || activityDate > trip.endDate) {
            return res.status(400).json({ error: 'Date must be within trip range' });
        }

        // Validate date is within a stop range
        const validStop = trip.stops.find(
            (stop) => activityDate >= stop.startDate && activityDate <= stop.endDate
        );

        if (!validStop) {
            return res.status(400).json({ error: 'Date must be within a city stop range' });
        }

        const dayActivity = await prisma.dayActivity.create({
            data: {
                tripId: req.params.id,
                activityId,
                date: activityDate,
                timeSlot,
            },
            include: { activity: { include: { city: true } } },
        });

        res.status(201).json({ dayActivity });
    } catch (error) {
        console.error('Add activity error:', error);
        res.status(500).json({ error: 'Failed to add activity' });
    }
});

// POST /trips/:id/copy - Copy public trip to user's account
router.post('/:id/copy', authMiddleware, async (req: AuthRequest, res) => {
    try {
        const sourceTrip = await prisma.trip.findFirst({
            where: { id: req.params.id, isPublic: true },
            include: {
                stops: true,
                activities: true,
            },
        });

        if (!sourceTrip) {
            return res.status(404).json({ error: 'Public trip not found' });
        }

        // Create new trip for current user
        const newTrip = await prisma.trip.create({
            data: {
                userId: req.userId!,
                name: `${sourceTrip.name} (Copy)`,
                description: sourceTrip.description,
                startDate: sourceTrip.startDate,
                endDate: sourceTrip.endDate,
                stops: {
                    create: sourceTrip.stops.map((stop) => ({
                        cityId: stop.cityId,
                        startDate: stop.startDate,
                        endDate: stop.endDate,
                        stopOrder: stop.stopOrder,
                    })),
                },
                activities: {
                    create: sourceTrip.activities.map((act) => ({
                        activityId: act.activityId,
                        date: act.date,
                        timeSlot: act.timeSlot,
                    })),
                },
            },
            include: {
                stops: { include: { city: true } },
                activities: { include: { activity: true } },
            },
        });

        res.status(201).json({ trip: newTrip });
    } catch (error) {
        console.error('Copy trip error:', error);
        res.status(500).json({ error: 'Failed to copy trip' });
    }
});

// POST /trips/:id/publish - Generate public snapshot
router.post('/:id/publish', authMiddleware, async (req: AuthRequest, res) => {
    try {
        const trip = await prisma.trip.findFirst({
            where: { id: req.params.id, userId: req.userId },
            include: {
                stops: { include: { city: true }, orderBy: { stopOrder: 'asc' } },
                activities: { include: { activity: { include: { city: true } } }, orderBy: { date: 'asc' } },
            },
        });

        if (!trip) {
            return res.status(404).json({ error: 'Trip not found' });
        }

        // Update trip to public
        await prisma.trip.update({
            where: { id: req.params.id },
            data: { isPublic: true },
        });

        // Create or update snapshot
        const snapshotJson = JSON.stringify({
            id: trip.id,
            name: trip.name,
            description: trip.description,
            startDate: trip.startDate,
            endDate: trip.endDate,
            stops: trip.stops,
            activities: trip.activities,
        });

        await prisma.publicTrip.upsert({
            where: { tripId: trip.id },
            update: { snapshotJson, createdAt: new Date() },
            create: { tripId: trip.id, snapshotJson },
        });

        res.json({ success: true, publicUrl: `/public/${trip.id}` });
    } catch (error) {
        console.error('Publish error:', error);
        res.status(500).json({ error: 'Failed to publish trip' });
    }
});

export default router;
