import { Router } from 'express';
import { prisma } from '../index.js';

const router = Router();

// GET /cities - Search cities
router.get('/', async (req, res) => {
    try {
        const { q, limit = '20' } = req.query;

        const cities = await prisma.city.findMany({
            where: q
                ? {
                    OR: [
                        { name: { contains: String(q) } },
                        { country: { contains: String(q) } },
                    ],
                }
                : undefined,
            orderBy: { popularityScore: 'desc' },
            take: parseInt(String(limit)),
        });

        res.json({ cities });
    } catch (error) {
        console.error('Search cities error:', error);
        res.status(500).json({ error: 'Failed to search cities' });
    }
});

// GET /cities/:id - Get city details
router.get('/:id', async (req, res) => {
    try {
        const city = await prisma.city.findUnique({
            where: { id: req.params.id },
        });

        if (!city) {
            return res.status(404).json({ error: 'City not found' });
        }

        res.json({ city });
    } catch (error) {
        console.error('Get city error:', error);
        res.status(500).json({ error: 'Failed to fetch city' });
    }
});

// GET /cities/:id/activities - Get activities for city
router.get('/:id/activities', async (req, res) => {
    try {
        const { category, minCost, maxCost } = req.query;

        const activities = await prisma.activity.findMany({
            where: {
                cityId: req.params.id,
                ...(category && { category: String(category) }),
                ...(minCost && { avgCost: { gte: parseFloat(String(minCost)) } }),
                ...(maxCost && { avgCost: { lte: parseFloat(String(maxCost)) } }),
            },
            orderBy: { avgCost: 'asc' },
        });

        res.json({ activities });
    } catch (error) {
        console.error('Get activities error:', error);
        res.status(500).json({ error: 'Failed to fetch activities' });
    }
});

export default router;
