import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import { tripsApi } from '../services/api'
import { Trip } from '../types'
import { ArrowLeft, MapPin } from 'lucide-react'

// City tint colors matching design system (translucent)
const CITY_TINTS = [
    'rgba(59, 91, 138, 0.15)',  // Slate Blue
    'rgba(47, 164, 169, 0.15)', // Teal
    'rgba(15, 42, 68, 0.12)',   // Midnight Blue
    'rgba(245, 158, 11, 0.12)', // Amber
    'rgba(34, 197, 94, 0.12)',  // Green
]

const CITY_TEXT_COLORS = [
    '#3B5B8A', // Slate Blue
    '#2FA4A9', // Teal
    '#0F2A44', // Midnight Blue
    '#d97706', // Amber
    '#16a34a', // Green
]

export default function CalendarView() {
    const { id } = useParams<{ id: string }>()

    const { data: trip, isLoading } = useQuery({
        queryKey: ['trip', id],
        queryFn: () => tripsApi.get(id!).then((res) => res.data.trip as Trip),
        enabled: !!id,
    })

    if (isLoading) {
        return (
            <div className="animate-pulse space-y-6">
                <div className="h-6 bg-slate-100 rounded w-1/4" />
                <div className="card h-96" />
            </div>
        )
    }

    if (!trip) {
        return <div className="text-center text-slate-500 py-12">Trip not found</div>
    }

    // Build calendar events from activities and stops
    const events = [
        // City stay backgrounds - using city-based translucent tinting
        ...trip.stops.map((stop, index) => ({
            id: `stop-${stop.id}`,
            title: stop.city.name,
            start: stop.startDate.split('T')[0],
            end: new Date(new Date(stop.endDate).getTime() + 86400000).toISOString().split('T')[0],
            display: 'background',
            color: CITY_TINTS[index % CITY_TINTS.length],
        })),
        // Activities
        ...trip.activities.map((activity) => ({
            id: activity.id,
            title: activity.activity.name,
            start: activity.date.split('T')[0],
            backgroundColor: getCategoryColor(activity.activity.category),
            borderColor: 'transparent',
            extendedProps: {
                category: activity.activity.category,
                cost: activity.activity.avgCost,
                duration: activity.activity.durationHours,
            },
        })),
    ]

    function getCategoryColor(category: string) {
        const colors: Record<string, string> = {
            Sightseeing: '#3B5B8A', // Secondary (Slate Blue)
            Food: '#F59E0B',        // Warning (Amber)
            Adventure: '#2FA4A9',   // Accent (Teal)
            Culture: '#0F2A44',     // Primary (Midnight Blue)
            Nightlife: '#64748B',   // Text Secondary
        }
        return colors[category] || '#3B5B8A'
    }

    return (
        <div className="animate-fade-in">
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
                <Link to={`/trips/${id}`} className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div>
                    <h1 className="text-xl font-semibold text-slate-800">{trip.name}</h1>
                    <p className="text-slate-500 text-sm">Calendar View</p>
                </div>
            </div>

            {/* Legend */}
            <div className="card p-4 mb-6">
                <div className="flex flex-wrap gap-6">
                    <div className="flex items-center gap-2 text-sm">
                        <MapPin className="w-4 h-4 text-slate-400" />
                        <span className="text-slate-600 font-medium">Cities:</span>
                        {trip.stops.map((stop, index) => (
                            <span
                                key={stop.id}
                                className="px-2 py-0.5 rounded text-xs font-medium"
                                style={{
                                    backgroundColor: CITY_TINTS[index % CITY_TINTS.length],
                                    color: CITY_TEXT_COLORS[index % CITY_TEXT_COLORS.length],
                                }}
                            >
                                {stop.city.name}
                            </span>
                        ))}
                    </div>
                    <div className="flex items-center gap-3 text-sm text-slate-500">
                        <span className="font-medium text-slate-600">Activities:</span>
                        {['Sightseeing', 'Food', 'Culture', 'Adventure'].map(cat => (
                            <span key={cat} className="flex items-center gap-1">
                                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: getCategoryColor(cat) }} />
                                {cat}
                            </span>
                        ))}
                    </div>
                </div>
            </div>

            {/* Calendar */}
            <div className="card p-4">
                <FullCalendar
                    plugins={[dayGridPlugin]}
                    initialView="dayGridMonth"
                    initialDate={trip.startDate.split('T')[0]}
                    events={events}
                    headerToolbar={{
                        left: 'prev,next today',
                        center: 'title',
                        right: 'dayGridMonth,dayGridWeek',
                    }}
                    height="auto"
                    eventContent={(eventInfo) => {
                        if (eventInfo.event.display === 'background') return null
                        return (
                            <div className="px-1 py-0.5 text-xs truncate text-white">
                                {eventInfo.event.title}
                            </div>
                        )
                    }}
                />
            </div>
        </div>
    )
}
