import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('🌍 Seeding GlobeTrotter database...');

    // Create demo user
    const demoPassword = await bcrypt.hash('demo123', 10);
    const demoUser = await prisma.user.upsert({
        where: { email: 'demo@globetrotter.app' },
        update: {},
        create: {
            email: 'demo@globetrotter.app',
            passwordHash: demoPassword,
        },
    });
    console.log('✅ Demo user created');

    // Create cities
    const cities = await Promise.all([
        prisma.city.create({
            data: { name: 'Paris', country: 'France', costIndex: 1.4, popularityScore: 95, imageUrl: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=400' },
        }),
        prisma.city.create({
            data: { name: 'Rome', country: 'Italy', costIndex: 1.2, popularityScore: 92, imageUrl: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=400' },
        }),
        prisma.city.create({
            data: { name: 'Barcelona', country: 'Spain', costIndex: 1.1, popularityScore: 90, imageUrl: 'https://images.unsplash.com/photo-1583422409516-2895a77efded?w=400' },
        }),
        prisma.city.create({
            data: { name: 'London', country: 'United Kingdom', costIndex: 1.6, popularityScore: 94, imageUrl: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=400' },
        }),
        prisma.city.create({
            data: { name: 'Amsterdam', country: 'Netherlands', costIndex: 1.3, popularityScore: 88, imageUrl: 'https://images.unsplash.com/photo-1534351590666-13e3e96b5017?w=400' },
        }),
        prisma.city.create({
            data: { name: 'Tokyo', country: 'Japan', costIndex: 1.5, popularityScore: 93, imageUrl: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400' },
        }),
        prisma.city.create({
            data: { name: 'New York', country: 'United States', costIndex: 1.7, popularityScore: 96, imageUrl: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=400' },
        }),
        prisma.city.create({
            data: { name: 'Sydney', country: 'Australia', costIndex: 1.4, popularityScore: 87, imageUrl: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=400' },
        }),
        prisma.city.create({
            data: { name: 'Dubai', country: 'United Arab Emirates', costIndex: 1.5, popularityScore: 85, imageUrl: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=400' },
        }),
        prisma.city.create({
            data: { name: 'Bangkok', country: 'Thailand', costIndex: 0.6, popularityScore: 89, imageUrl: 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=400' },
        }),
        prisma.city.create({
            data: { name: 'Singapore', country: 'Singapore', costIndex: 1.4, popularityScore: 86, imageUrl: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=400' },
        }),
        prisma.city.create({
            data: { name: 'Prague', country: 'Czech Republic', costIndex: 0.8, popularityScore: 84, imageUrl: 'https://images.unsplash.com/photo-1541849546-216549ae216d?w=400' },
        }),
        prisma.city.create({
            data: { name: 'Vienna', country: 'Austria', costIndex: 1.2, popularityScore: 83, imageUrl: 'https://images.unsplash.com/photo-1516550893923-42d28e5677af?w=400' },
        }),
        prisma.city.create({
            data: { name: 'Lisbon', country: 'Portugal', costIndex: 0.9, popularityScore: 82, imageUrl: 'https://images.unsplash.com/photo-1585208798174-6cedd86e019a?w=400' },
        }),
        prisma.city.create({
            data: { name: 'Istanbul', country: 'Turkey', costIndex: 0.7, popularityScore: 88, imageUrl: 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=400' },
        }),
    ]);
    console.log(`✅ ${cities.length} cities created`);

    // Create activities for each city
    const categories = ['Sightseeing', 'Food', 'Adventure', 'Culture', 'Nightlife'];

    const activityTemplates = [
        { name: 'City Walking Tour', category: 'Sightseeing', durationHours: 3, avgCost: 25 },
        { name: 'Museum Visit', category: 'Culture', durationHours: 2.5, avgCost: 20 },
        { name: 'Local Food Tour', category: 'Food', durationHours: 3, avgCost: 60 },
        { name: 'Historical Landmark', category: 'Sightseeing', durationHours: 1.5, avgCost: 15 },
        { name: 'Fine Dining Experience', category: 'Food', durationHours: 2, avgCost: 100 },
        { name: 'Sunset Cruise', category: 'Adventure', durationHours: 2, avgCost: 75 },
        { name: 'Art Gallery', category: 'Culture', durationHours: 2, avgCost: 18 },
        { name: 'Rooftop Bar', category: 'Nightlife', durationHours: 2, avgCost: 50 },
        { name: 'Bike Tour', category: 'Adventure', durationHours: 3, avgCost: 40 },
        { name: 'Cooking Class', category: 'Food', durationHours: 3, avgCost: 80 },
    ];

    // City-specific activities
    const cityActivities: Record<string, { name: string; category: string; durationHours: number; avgCost: number; description: string }[]> = {
        'Paris': [
            { name: 'Eiffel Tower Visit', category: 'Sightseeing', durationHours: 2, avgCost: 28, description: 'Iconic iron tower with panoramic city views' },
            { name: 'Louvre Museum', category: 'Culture', durationHours: 4, avgCost: 17, description: 'World\'s largest art museum, home to Mona Lisa' },
            { name: 'Seine River Cruise', category: 'Adventure', durationHours: 1.5, avgCost: 15, description: 'Scenic boat tour along the Seine' },
            { name: 'Montmartre Walk', category: 'Sightseeing', durationHours: 2, avgCost: 0, description: 'Explore the artistic hilltop neighborhood' },
            { name: 'French Pastry Tasting', category: 'Food', durationHours: 2, avgCost: 45, description: 'Sample croissants, macarons, and more' },
        ],
        'Rome': [
            { name: 'Colosseum Tour', category: 'Sightseeing', durationHours: 2.5, avgCost: 25, description: 'Ancient Roman amphitheater' },
            { name: 'Vatican Museums', category: 'Culture', durationHours: 4, avgCost: 20, description: 'Sistine Chapel and Renaissance masterpieces' },
            { name: 'Trastevere Food Walk', category: 'Food', durationHours: 3, avgCost: 55, description: 'Authentic Roman cuisine in charming streets' },
            { name: 'Trevi Fountain', category: 'Sightseeing', durationHours: 0.5, avgCost: 0, description: 'Baroque fountain, toss a coin for luck' },
            { name: 'Pasta Making Class', category: 'Food', durationHours: 3, avgCost: 70, description: 'Learn to make fresh Italian pasta' },
        ],
        'Barcelona': [
            { name: 'Sagrada Familia', category: 'Sightseeing', durationHours: 2, avgCost: 26, description: 'Gaudí\'s unfinished masterpiece basilica' },
            { name: 'Park Güell', category: 'Sightseeing', durationHours: 2, avgCost: 10, description: 'Colorful mosaic park by Gaudí' },
            { name: 'La Boqueria Market', category: 'Food', durationHours: 1.5, avgCost: 30, description: 'Famous food market on Las Ramblas' },
            { name: 'Gothic Quarter Walk', category: 'Culture', durationHours: 2, avgCost: 0, description: 'Medieval streets and hidden plazas' },
            { name: 'Flamenco Show', category: 'Nightlife', durationHours: 1.5, avgCost: 45, description: 'Traditional Spanish dance performance' },
        ],
        'Tokyo': [
            { name: 'Senso-ji Temple', category: 'Culture', durationHours: 1.5, avgCost: 0, description: 'Ancient Buddhist temple in Asakusa' },
            { name: 'Shibuya Crossing', category: 'Sightseeing', durationHours: 1, avgCost: 0, description: 'World\'s busiest pedestrian crossing' },
            { name: 'Tsukiji Fish Market', category: 'Food', durationHours: 2, avgCost: 50, description: 'Fresh sushi and seafood' },
            { name: 'Robot Restaurant', category: 'Nightlife', durationHours: 2, avgCost: 80, description: 'Wild robot and laser show' },
            { name: 'Traditional Tea Ceremony', category: 'Culture', durationHours: 1, avgCost: 35, description: 'Authentic Japanese tea experience' },
        ],
        'London': [
            { name: 'Tower of London', category: 'Sightseeing', durationHours: 3, avgCost: 30, description: 'Historic castle and Crown Jewels' },
            { name: 'British Museum', category: 'Culture', durationHours: 3, avgCost: 0, description: 'World history and artifacts' },
            { name: 'Borough Market', category: 'Food', durationHours: 2, avgCost: 40, description: 'Gourmet food market' },
            { name: 'West End Show', category: 'Nightlife', durationHours: 3, avgCost: 90, description: 'World-class theater performance' },
            { name: 'Thames River Walk', category: 'Sightseeing', durationHours: 2, avgCost: 0, description: 'Scenic walk along the river' },
        ],
    };

    let activityCount = 0;
    for (const city of cities) {
        // Add generic activities adjusted by city cost
        for (const template of activityTemplates) {
            await prisma.activity.create({
                data: {
                    cityId: city.id,
                    name: template.name,
                    category: template.category,
                    durationHours: template.durationHours,
                    avgCost: Math.round(template.avgCost * city.costIndex),
                },
            });
            activityCount++;
        }

        // Add city-specific activities
        const specific = cityActivities[city.name];
        if (specific) {
            for (const activity of specific) {
                await prisma.activity.create({
                    data: {
                        cityId: city.id,
                        name: activity.name,
                        category: activity.category,
                        description: activity.description,
                        durationHours: activity.durationHours,
                        avgCost: Math.round(activity.avgCost * city.costIndex),
                    },
                });
                activityCount++;
            }
        }
    }
    console.log(`✅ ${activityCount} activities created`);

    // Create demo trip
    const paris = cities.find(c => c.name === 'Paris')!;
    const rome = cities.find(c => c.name === 'Rome')!;
    const barcelona = cities.find(c => c.name === 'Barcelona')!;

    const demoTrip = await prisma.trip.create({
        data: {
            userId: demoUser.id,
            name: 'European Adventure',
            description: 'A 10-day journey through the best of Europe',
            startDate: new Date('2026-03-01'),
            endDate: new Date('2026-03-10'),
            isPublic: true,
            stops: {
                create: [
                    { cityId: paris.id, startDate: new Date('2026-03-01'), endDate: new Date('2026-03-03'), stopOrder: 1 },
                    { cityId: rome.id, startDate: new Date('2026-03-04'), endDate: new Date('2026-03-06'), stopOrder: 2 },
                    { cityId: barcelona.id, startDate: new Date('2026-03-07'), endDate: new Date('2026-03-10'), stopOrder: 3 },
                ],
            },
        },
    });

    // Add some activities to the demo trip
    const parisActivities = await prisma.activity.findMany({ where: { cityId: paris.id }, take: 3 });
    const romeActivities = await prisma.activity.findMany({ where: { cityId: rome.id }, take: 3 });

    await prisma.dayActivity.createMany({
        data: [
            { tripId: demoTrip.id, activityId: parisActivities[0].id, date: new Date('2026-03-01'), timeSlot: '10:00' },
            { tripId: demoTrip.id, activityId: parisActivities[1].id, date: new Date('2026-03-02'), timeSlot: '14:00' },
            { tripId: demoTrip.id, activityId: romeActivities[0].id, date: new Date('2026-03-04'), timeSlot: '09:00' },
            { tripId: demoTrip.id, activityId: romeActivities[1].id, date: new Date('2026-03-05'), timeSlot: '11:00' },
        ],
    });
    console.log('✅ Demo trip with activities created');

    console.log('🎉 Database seeded successfully!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
