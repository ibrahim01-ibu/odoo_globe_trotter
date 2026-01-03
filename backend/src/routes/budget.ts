import { Router } from 'express';
import { prisma } from '../index.js';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';

const router = Router();

const MEAL_COST_PER_DAY = 30;
const TRANSPORT_COST_PER_STOP = 100;
const BASE_STAY_COST = 80;

function daysBetween(start: Date, end: Date): number {
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

// GET /budget/:tripId - Calculate budget summary
router.get('/:tripId', authMiddleware, async (req: AuthRequest, res) => {
    try {
        const trip = await prisma.trip.findFirst({
            where: { id: req.params.tripId, userId: req.userId },
            include: {
                stops: { include: { city: true } },
                activities: { include: { activity: true } },
            },
        });

        if (!trip) {
            return res.status(404).json({ error: 'Trip not found' });
        }

        // Stay: nights × city cost index × base rate
        let stayCost = 0;
        for (const stop of trip.stops) {
            const nights = daysBetween(stop.startDate, stop.endDate);
            stayCost += nights * stop.city.costIndex * BASE_STAY_COST;
        }

        // Activities: sum of avgCost
        const activityCost = trip.activities.reduce(
            (sum, a) => sum + a.activity.avgCost,
            0
        );

        // Meals: trip duration × per-day rate
        const tripDays = daysBetween(trip.startDate, trip.endDate) + 1;
        const mealCost = tripDays * MEAL_COST_PER_DAY;

        // Transport: estimated from stop count
        const transportCost = Math.max(0, trip.stops.length - 1) * TRANSPORT_COST_PER_STOP;

        // Per-day breakdown
        const dailyBreakdown: Record<string, { activities: number; meals: number }> = {};

        for (const activity of trip.activities) {
            const dateKey = activity.date.toISOString().split('T')[0];
            if (!dailyBreakdown[dateKey]) {
                dailyBreakdown[dateKey] = { activities: 0, meals: MEAL_COST_PER_DAY };
            }
            dailyBreakdown[dateKey].activities += activity.activity.avgCost;
        }

        // Category breakdown for charts
        const categoryBreakdown: Record<string, number> = {};
        for (const activity of trip.activities) {
            const cat = activity.activity.category;
            categoryBreakdown[cat] = (categoryBreakdown[cat] || 0) + activity.activity.avgCost;
        }

        const total = stayCost + activityCost + mealCost + transportCost;

        res.json({
            budget: {
                stay: Math.round(stayCost),
                activities: Math.round(activityCost),
                meals: Math.round(mealCost),
                transport: Math.round(transportCost),
                total: Math.round(total),
                perDay: Math.round(total / tripDays),
                tripDays,
                dailyBreakdown,
                categoryBreakdown,
            },
        });
    } catch (error) {
        console.error('Budget calculation error:', error);
        res.status(500).json({ error: 'Failed to calculate budget' });
    }
});

export default router;
