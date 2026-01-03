import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import authRoutes from './routes/auth.js';
import tripRoutes from './routes/trips.js';
import stopRoutes from './routes/stops.js';
import cityRoutes from './routes/cities.js';
import activityRoutes from './routes/activities.js';
import budgetRoutes from './routes/budget.js';
import publicRoutes from './routes/public.js';
import profileRoutes from './routes/profile.js';

export const prisma = new PrismaClient();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/auth', authRoutes);
app.use('/trips', tripRoutes);
app.use('/stops', stopRoutes);
app.use('/cities', cityRoutes);
app.use('/activities', activityRoutes);
app.use('/budget', budgetRoutes);
app.use('/public', publicRoutes);
app.use('/profile', profileRoutes);

// Error handler
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
    console.log(`🚀 GlobeTrotter API running on http://localhost:${PORT}`);
});
