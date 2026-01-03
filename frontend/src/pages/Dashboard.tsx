import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { tripsApi } from '../services/api'
import { Trip } from '../types'
import { Plus, MapPin, Calendar, Trash2, DollarSign } from 'lucide-react'

export default function Dashboard() {
    const navigate = useNavigate()
    const queryClient = useQueryClient()
    const [showCreateModal, setShowCreateModal] = useState(false)
    const [newTrip, setNewTrip] = useState({ name: '', description: '', startDate: '', endDate: '' })

    const { data, isLoading } = useQuery({
        queryKey: ['trips'],
        queryFn: () => tripsApi.list().then((res) => res.data.trips as Trip[]),
    })

    const createMutation = useMutation({
        mutationFn: tripsApi.create,
        onSuccess: (res) => {
            queryClient.invalidateQueries({ queryKey: ['trips'] })
            setShowCreateModal(false)
            setNewTrip({ name: '', description: '', startDate: '', endDate: '' })
            navigate(`/trips/${res.data.trip.id}`)
        },
    })

    const deleteMutation = useMutation({
        mutationFn: tripsApi.delete,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['trips'] })
        },
    })

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }

    const getDurationDays = (start: string, end: string) => {
        const diff = new Date(end).getTime() - new Date(start).getTime()
        return Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1
    }

    return (
        <div className="animate-fade-in">
            {/* Header - Clean and simple */}
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-semibold text-slate-800">My Trips</h1>
                    <p className="text-slate-500 mt-1">Plan and manage your adventures</p>
                </div>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="btn-primary flex items-center gap-2"
                >
                    <Plus className="w-4 h-4" />
                    Create Trip
                </button>
            </div>

            {/* Trips Grid */}
            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="card p-6 animate-pulse">
                            <div className="h-4 bg-slate-100 rounded w-3/4 mb-3" />
                            <div className="h-3 bg-slate-50 rounded w-1/2 mb-4" />
                            <div className="h-8 bg-slate-50 rounded" />
                        </div>
                    ))}
                </div>
            ) : data?.length === 0 ? (
                <div className="card p-12 text-center max-w-md mx-auto">
                    <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
                        <MapPin className="w-8 h-8 text-slate-400" />
                    </div>
                    <h3 className="text-lg font-medium text-slate-800 mb-2">No trips yet</h3>
                    <p className="text-slate-500 mb-6">Create your first trip to start planning</p>
                    <button onClick={() => setShowCreateModal(true)} className="btn-primary">
                        Create Trip
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {data?.map((trip) => (
                        <div
                            key={trip.id}
                            className="card p-5 cursor-pointer hover:shadow-card-hover transition-shadow duration-200"
                            onClick={() => navigate(`/trips/${trip.id}`)}
                        >
                            {/* Trip Header */}
                            <div className="mb-4">
                                <h3 className="text-lg font-semibold text-slate-800 mb-1 line-clamp-1">
                                    {trip.name}
                                </h3>
                                <p className="text-sm text-slate-500">
                                    {formatDate(trip.startDate)} – {formatDate(trip.endDate)} · {getDurationDays(trip.startDate, trip.endDate)} days
                                </p>
                            </div>

                            {/* Cities */}
                            <div className="mb-4">
                                {trip.stops && trip.stops.length > 0 ? (
                                    <div className="flex flex-wrap gap-1.5">
                                        {trip.stops.slice(0, 3).map((stop) => (
                                            <span
                                                key={stop.id}
                                                className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-xs font-medium"
                                            >
                                                {stop.city.name}
                                            </span>
                                        ))}
                                        {trip.stops.length > 3 && (
                                            <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-500 text-xs">
                                                +{trip.stops.length - 3}
                                            </span>
                                        )}
                                    </div>
                                ) : (
                                    <span className="text-xs text-slate-400">No cities added</span>
                                )}
                            </div>

                            {/* Actions */}
                            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                                <div className="flex gap-1">
                                    <Link
                                        to={`/trips/${trip.id}/calendar`}
                                        onClick={(e) => e.stopPropagation()}
                                        className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors"
                                        title="Calendar"
                                    >
                                        <Calendar className="w-4 h-4" />
                                    </Link>
                                    <Link
                                        to={`/trips/${trip.id}/budget`}
                                        onClick={(e) => e.stopPropagation()}
                                        className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors"
                                        title="Budget"
                                    >
                                        <DollarSign className="w-4 h-4" />
                                    </Link>
                                </div>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        if (confirm('Delete this trip?')) {
                                            deleteMutation.mutate(trip.id)
                                        }
                                    }}
                                    className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Create Modal - Simplified */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="card p-6 w-full max-w-md animate-slide-up">
                        <h2 className="text-xl font-semibold text-slate-800 mb-6">Create New Trip</h2>

                        <form
                            onSubmit={(e) => {
                                e.preventDefault()
                                createMutation.mutate(newTrip)
                            }}
                            className="space-y-4"
                        >
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">Trip Name</label>
                                <input
                                    type="text"
                                    value={newTrip.name}
                                    onChange={(e) => setNewTrip({ ...newTrip, name: e.target.value })}
                                    className="input-field"
                                    placeholder="e.g. Summer in Europe"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">Description</label>
                                <textarea
                                    value={newTrip.description}
                                    onChange={(e) => setNewTrip({ ...newTrip, description: e.target.value })}
                                    className="input-field resize-none"
                                    placeholder="Optional description"
                                    rows={2}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Start</label>
                                    <input
                                        type="date"
                                        value={newTrip.startDate}
                                        onChange={(e) => setNewTrip({ ...newTrip, startDate: e.target.value })}
                                        className="input-field"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1.5">End</label>
                                    <input
                                        type="date"
                                        value={newTrip.endDate}
                                        onChange={(e) => setNewTrip({ ...newTrip, endDate: e.target.value })}
                                        className="input-field"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowCreateModal(false)}
                                    className="flex-1 btn-secondary"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={createMutation.isPending}
                                    className="flex-1 btn-primary"
                                >
                                    {createMutation.isPending ? 'Creating...' : 'Create'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
