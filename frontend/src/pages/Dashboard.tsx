import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { tripsApi } from '../services/api'
import { Trip } from '../types'
import { Plus, MapPin, Calendar, Trash2, Eye, DollarSign } from 'lucide-react'

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
        return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    }

    const getDurationDays = (start: string, end: string) => {
        const diff = new Date(end).getTime() - new Date(start).getTime()
        return Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1
    }

    return (
        <div className="animate-fade-in">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-teal-600 to-cyan-600 font-display">
                        My Adventures
                    </h1>
                    <p className="text-secondary mt-2 text-lg">Where will you go next?</p>
                </div>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="btn-primary flex items-center gap-2 group"
                >
                    <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
                    Start New Journey
                </button>
            </div>

            {/* Trips Grid */}
            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="card h-64 animate-pulse">
                            <div className="h-32 bg-gray-100 rounded-t-xl" />
                            <div className="p-4 space-y-3">
                                <div className="h-4 bg-gray-100 rounded w-3/4" />
                                <div className="h-3 bg-gray-50 rounded w-1/2" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : data?.length === 0 ? (
                <div className="card p-12 text-center">
                    <div className="w-20 h-20 rounded-full bg-secondary/10 flex items-center justify-center mx-auto mb-4">
                        <MapPin className="w-10 h-10 text-secondary" />
                    </div>
                    <h3 className="text-xl font-semibold text-text-primary mb-2">No trips yet</h3>
                    <p className="text-text-secondary mb-6">Create your first trip to start planning your adventure</p>
                    <button onClick={() => setShowCreateModal(true)} className="btn-primary">
                        Create Your First Trip
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {data?.map((trip) => (
                        <div
                            key={trip.id}
                            className="card card-hover group cursor-pointer relative bg-white pb-2"
                            onClick={() => navigate(`/trips/${trip.id}`)}
                        >
                            {/* Trip Image / Placeholder */}
                            <div className="h-40 bg-gradient-to-br from-teal-50 to-blue-50 relative overflow-hidden rounded-t-2xl">
                                <div className="absolute inset-0 flex items-center justify-center text-6xl opacity-20 transform group-hover:scale-110 transition-transform duration-700">
                                    ✈️
                                </div>

                                {/* Status Badge */}
                                <div className="absolute top-4 right-4 bg-white/80 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold text-teal-700 shadow-sm border border-teal-100 flex items-center gap-1">
                                    {trip.isPublic ? <Eye className="w-3 h-3" /> : null}
                                    {trip.isPublic ? 'Public' : 'Private'}
                                </div>

                                {/* Duration Badge */}
                                <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium text-white shadow-sm flex items-center gap-1.5">
                                    <Calendar className="w-3 h-3" />
                                    {getDurationDays(trip.startDate, trip.endDate)} Days
                                </div>
                            </div>

                            {/* Trip Content */}
                            <div className="p-5">
                                <h3 className="text-xl font-bold text-slate-800 mb-1 group-hover:text-primary transition-colors line-clamp-1">
                                    {trip.name}
                                </h3>
                                <p className="text-sm text-slate-500 mb-4 line-clamp-2 min-h-[2.5rem]">
                                    {trip.description || "No description provided."}
                                </p>

                                {/* Stats Row */}
                                <div className="flex items-center gap-4 text-xs font-medium text-slate-500 mb-4 bg-slate-50 p-3 rounded-lg border border-slate-100">
                                    <div className="flex items-center gap-1.5">
                                        <MapPin className="w-3.5 h-3.5 text-teal-600" />
                                        <span>{trip.stops?.length || 0} Stops</span>
                                    </div>
                                    <div className="w-[1px] h-3 bg-slate-200"></div>
                                    <div className="flex items-center gap-1.5">
                                        <Calendar className="w-3.5 h-3.5 text-blue-500" />
                                        <span>{new Date(trip.startDate).getFullYear()}</span>
                                    </div>
                                </div>

                                {/* Cities Pills */}
                                {trip.stops && trip.stops.length > 0 ? (
                                    <div className="flex flex-wrap gap-1.5 mb-1">
                                        {trip.stops.slice(0, 3).map((stop) => (
                                            <span
                                                key={stop.id}
                                                className="px-2.5 py-1 rounded-md bg-teal-50 text-teal-700 text-xs font-medium border border-teal-100/50"
                                            >
                                                {stop.city.name}
                                            </span>
                                        ))}
                                        {trip.stops.length > 3 && (
                                            <span className="px-2 py-1 rounded-md bg-slate-50 text-slate-500 text-xs font-medium border border-slate-100">
                                                +{trip.stops.length - 3}
                                            </span>
                                        )}
                                    </div>
                                ) : (
                                    <div className="text-xs text-slate-400 italic mb-1 pt-1">No cities added yet</div>
                                )}
                            </div>

                            {/* Actions */}
                            <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between items-center px-5 pb-3">
                                <div className="flex gap-2">
                                    <Link
                                        to={`/trips/${trip.id}/calendar`}
                                        onClick={(e) => e.stopPropagation()}
                                        className="icon-btn"
                                        title="Calendar View"
                                    >
                                        <Calendar className="w-4 h-4" />
                                    </Link>
                                    <Link
                                        to={`/trips/${trip.id}/budget`}
                                        onClick={(e) => e.stopPropagation()}
                                        className="icon-btn hover:text-accent hover:bg-accent/10"
                                        title="Budget View"
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
                                    className="icon-btn icon-btn-danger"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Create Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 modal-overlay flex items-center justify-center z-50 p-4">
                    <div className="card p-6 w-full max-w-md animate-slide-up">
                        <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-teal-600 to-cyan-600 font-display mb-6">
                            Create New Trip
                        </h2>

                        <form
                            onSubmit={(e) => {
                                e.preventDefault()
                                createMutation.mutate(newTrip)
                            }}
                            className="space-y-4"
                        >
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Trip Name</label>
                                <input
                                    type="text"
                                    value={newTrip.name}
                                    onChange={(e) => setNewTrip({ ...newTrip, name: e.target.value })}
                                    className="input-field"
                                    placeholder="European Adventure"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Description (optional)</label>
                                <textarea
                                    value={newTrip.description}
                                    onChange={(e) => setNewTrip({ ...newTrip, description: e.target.value })}
                                    className="input-field resize-none"
                                    placeholder="A journey through the best of Europe..."
                                    rows={2}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Start Date</label>
                                    <input
                                        type="date"
                                        value={newTrip.startDate}
                                        onChange={(e) => setNewTrip({ ...newTrip, startDate: e.target.value })}
                                        className="input-field"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">End Date</label>
                                    <input
                                        type="date"
                                        value={newTrip.endDate}
                                        onChange={(e) => setNewTrip({ ...newTrip, endDate: e.target.value })}
                                        className="input-field"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4">
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
                                    {createMutation.isPending ? 'Creating...' : 'Create Trip'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
