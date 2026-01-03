import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { tripsApi, citiesApi, stopsApi, activitiesApi } from '../services/api'
import { Trip, City, Activity } from '../types'
import {
    ArrowLeft, MapPin, Plus, Trash2, Calendar, DollarSign,
    Search, Clock, X, Share2, Check, ChevronDown, ChevronUp
} from 'lucide-react'

export default function TripBuilder() {
    const { id } = useParams<{ id: string }>()
    const queryClient = useQueryClient()
    const [showCitySearch, setShowCitySearch] = useState(false)
    const [showActivityModal, setShowActivityModal] = useState<{ cityId: string; date: string } | null>(null)
    const [cityQuery, setCityQuery] = useState('')
    const [expandedStop, setExpandedStop] = useState<string | null>(null)

    const { data: trip, isLoading } = useQuery({
        queryKey: ['trip', id],
        queryFn: () => tripsApi.get(id!).then((res) => res.data.trip as Trip),
        enabled: !!id,
    })

    const { data: cities } = useQuery({
        queryKey: ['cities', cityQuery],
        queryFn: () => citiesApi.search(cityQuery).then((res) => res.data.cities as City[]),
    })

    const { data: activities } = useQuery({
        queryKey: ['activities', showActivityModal?.cityId],
        queryFn: () => citiesApi.getActivities(showActivityModal!.cityId).then((res) => res.data.activities as Activity[]),
        enabled: !!showActivityModal?.cityId,
    })

    const addStopMutation = useMutation({
        mutationFn: ({ cityId, startDate, endDate }: { cityId: string; startDate: string; endDate: string }) =>
            tripsApi.addStop(id!, { cityId, startDate, endDate }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['trip', id] })
            setShowCitySearch(false)
            setCityQuery('')
        },
    })

    const deleteStopMutation = useMutation({
        mutationFn: stopsApi.delete,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['trip', id] }),
    })

    const addActivityMutation = useMutation({
        mutationFn: ({ activityId, date }: { activityId: string; date: string }) =>
            tripsApi.addActivity(id!, { activityId, date }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['trip', id] })
            setShowActivityModal(null)
        },
    })

    const deleteActivityMutation = useMutation({
        mutationFn: activitiesApi.delete,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['trip', id] }),
    })

    const publishMutation = useMutation({
        mutationFn: () => tripsApi.publish(id!),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['trip', id] }),
    })

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
    }

    const getDatesBetween = (start: string, end: string) => {
        const dates: string[] = []
        const current = new Date(start)
        const endDate = new Date(end)
        while (current <= endDate) {
            dates.push(current.toISOString().split('T')[0])
            current.setDate(current.getDate() + 1)
        }
        return dates
    }

    const getActivitiesForDate = (date: string) => {
        return trip?.activities.filter((a) => a.date.split('T')[0] === date) || []
    }

    if (isLoading) {
        return (
            <div className="animate-pulse space-y-6">
                <div className="h-8 bg-gray-100 rounded w-1/3" />
                <div className="card h-64" />
            </div>
        )
    }

    if (!trip) {
        return <div className="text-center text-text-secondary py-12">Trip not found</div>
    }

    return (
        <div className="animate-fade-in">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <div className="flex items-center gap-4">
                    <Link to="/" className="icon-btn">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-text-primary">{trip.name}</h1>
                        <p className="text-text-secondary text-sm">
                            {formatDate(trip.startDate)} - {formatDate(trip.endDate)}
                        </p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Link to={`/trips/${id}/calendar`} className="btn-ghost flex items-center gap-2 px-4 py-2">
                        <Calendar className="w-4 h-4" />
                        Calendar
                    </Link>
                    <Link to={`/trips/${id}/budget`} className="btn-ghost flex items-center gap-2 px-4 py-2">
                        <DollarSign className="w-4 h-4" />
                        Budget
                    </Link>
                    <button
                        onClick={() => publishMutation.mutate()}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${trip.isPublic
                                ? 'bg-success/10 text-success'
                                : 'btn-accent'
                            }`}
                    >
                        {trip.isPublic ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
                        {trip.isPublic ? 'Published' : 'Publish'}
                    </button>
                </div>
            </div>

            {/* City Stops */}
            <div className="mb-8">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold text-text-primary">Cities</h2>
                    <button
                        onClick={() => setShowCitySearch(true)}
                        className="btn-accent flex items-center gap-2 px-3 py-1.5 text-sm"
                    >
                        <Plus className="w-4 h-4" />
                        Add City
                    </button>
                </div>

                {trip.stops.length === 0 ? (
                    <div className="card p-8 text-center">
                        <MapPin className="w-12 h-12 text-text-muted mx-auto mb-3" />
                        <p className="text-text-secondary">No cities added yet. Start by adding your first destination!</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {trip.stops.map((stop, index) => (
                            <div key={stop.id} className="card overflow-hidden">
                                {/* Stop Header */}
                                <div
                                    className="p-4 cursor-pointer hover:bg-gray-50 transition-all"
                                    onClick={() => setExpandedStop(expandedStop === stop.id ? null : stop.id)}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center text-lg font-bold text-secondary">
                                                {index + 1}
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-text-primary">{stop.city.name}</h3>
                                                <p className="text-sm text-text-secondary">
                                                    {stop.city.country} • {formatDate(stop.startDate)} - {formatDate(stop.endDate)}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    if (confirm('Remove this city?')) deleteStopMutation.mutate(stop.id)
                                                }}
                                                className="icon-btn icon-btn-danger"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                            {expandedStop === stop.id ? (
                                                <ChevronUp className="w-5 h-5 text-text-muted" />
                                            ) : (
                                                <ChevronDown className="w-5 h-5 text-text-muted" />
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Expanded Day-wise View */}
                                {expandedStop === stop.id && (
                                    <div className="border-t border-gray-100 p-4 space-y-3">
                                        {getDatesBetween(stop.startDate.split('T')[0], stop.endDate.split('T')[0]).map((date) => {
                                            const dayActivities = getActivitiesForDate(date)
                                            return (
                                                <div key={date} className="flex gap-4">
                                                    <div className="w-24 flex-shrink-0">
                                                        <div className="text-sm font-medium text-secondary">{formatDate(date)}</div>
                                                    </div>
                                                    <div className="flex-1 space-y-2">
                                                        {dayActivities.length === 0 ? (
                                                            <button
                                                                onClick={() => setShowActivityModal({ cityId: stop.cityId, date })}
                                                                className="w-full py-3 px-4 rounded-lg border border-dashed border-gray-200 text-text-muted hover:border-accent hover:text-accent transition-all text-sm flex items-center justify-center gap-2"
                                                            >
                                                                <Plus className="w-4 h-4" />
                                                                Add activity
                                                            </button>
                                                        ) : (
                                                            <>
                                                                {dayActivities.map((da) => (
                                                                    <div
                                                                        key={da.id}
                                                                        className="flex items-center justify-between py-2 px-3 rounded-lg bg-gray-50 group"
                                                                    >
                                                                        <div className="flex items-center gap-3">
                                                                            <div className="badge badge-secondary">
                                                                                {da.activity.category}
                                                                            </div>
                                                                            <span className="text-text-primary">{da.activity.name}</span>
                                                                            <span className="text-text-muted text-sm flex items-center gap-1">
                                                                                <Clock className="w-3 h-3" />
                                                                                {da.activity.durationHours}h
                                                                            </span>
                                                                            <span className="text-success text-sm">${da.activity.avgCost}</span>
                                                                        </div>
                                                                        <button
                                                                            onClick={() => deleteActivityMutation.mutate(da.id)}
                                                                            className="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-danger/10 text-text-muted hover:text-danger transition-all"
                                                                        >
                                                                            <X className="w-4 h-4" />
                                                                        </button>
                                                                    </div>
                                                                ))}
                                                                <button
                                                                    onClick={() => setShowActivityModal({ cityId: stop.cityId, date })}
                                                                    className="text-sm text-accent hover:text-accent-dark flex items-center gap-1"
                                                                >
                                                                    <Plus className="w-3 h-3" />
                                                                    Add more
                                                                </button>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* City Search Modal */}
            {showCitySearch && (
                <div className="fixed inset-0 modal-overlay flex items-center justify-center z-50 p-4">
                    <div className="card p-6 w-full max-w-lg animate-slide-up shadow-xl">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-text-primary">Add City</h2>
                            <button onClick={() => setShowCitySearch(false)} className="icon-btn">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="relative mb-4">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                            <input
                                type="text"
                                value={cityQuery}
                                onChange={(e) => setCityQuery(e.target.value)}
                                className="input-field pl-11"
                                placeholder="Search cities..."
                                autoFocus
                            />
                        </div>

                        <div className="max-h-64 overflow-y-auto space-y-2">
                            {cities?.map((city) => (
                                <button
                                    key={city.id}
                                    onClick={() => {
                                        const startDate = trip.stops.length > 0
                                            ? new Date(new Date(trip.stops[trip.stops.length - 1].endDate).getTime() + 86400000).toISOString().split('T')[0]
                                            : trip.startDate.split('T')[0]
                                        const endDate = new Date(new Date(startDate).getTime() + 2 * 86400000).toISOString().split('T')[0]
                                        addStopMutation.mutate({ cityId: city.id, startDate, endDate })
                                    }}
                                    className="w-full flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 transition-all text-left"
                                >
                                    <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center">
                                        <MapPin className="w-6 h-6 text-secondary" />
                                    </div>
                                    <div>
                                        <div className="font-medium text-text-primary">{city.name}</div>
                                        <div className="text-sm text-text-secondary">{city.country}</div>
                                    </div>
                                    <div className="ml-auto text-sm text-text-muted">
                                        Cost: {(city.costIndex * 100).toFixed(0)}%
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Activity Modal */}
            {showActivityModal && (
                <div className="fixed inset-0 modal-overlay flex items-center justify-center z-50 p-4">
                    <div className="card p-6 w-full max-w-lg animate-slide-up shadow-xl">
                        <div className="flex justify-between items-center mb-4">
                            <div>
                                <h2 className="text-xl font-bold text-text-primary">Add Activity</h2>
                                <p className="text-sm text-text-secondary">{formatDate(showActivityModal.date)}</p>
                            </div>
                            <button onClick={() => setShowActivityModal(null)} className="icon-btn">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="max-h-80 overflow-y-auto space-y-2">
                            {activities?.map((activity) => (
                                <button
                                    key={activity.id}
                                    onClick={() => addActivityMutation.mutate({ activityId: activity.id, date: showActivityModal.date })}
                                    className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-all text-left"
                                >
                                    <div>
                                        <div className="font-medium text-text-primary">{activity.name}</div>
                                        <div className="flex items-center gap-3 text-sm text-text-secondary">
                                            <span className="badge badge-secondary">
                                                {activity.category}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                {activity.durationHours}h
                                            </span>
                                        </div>
                                    </div>
                                    <div className="text-success font-medium">${activity.avgCost}</div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
