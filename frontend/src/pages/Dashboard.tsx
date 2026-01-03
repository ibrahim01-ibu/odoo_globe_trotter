import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { tripsApi } from '../services/api'
import { Trip } from '../types'
import { Plus, MapPin, Calendar, Trash2, Eye, DollarSign, ChevronRight } from 'lucide-react'

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
                    <h1 className="text-3xl font-bold text-text-primary">My Trips</h1>
                    <p className="text-text-secondary mt-1">Plan and manage your adventures</p>
                </div>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="btn-primary flex items-center gap-2"
                >
                    <Plus className="w-5 h-5" />
                    New Trip
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {data?.map((trip) => (
                        <div
                            key={trip.id}
                            className="card card-hover overflow-hidden group cursor-pointer"
                            onClick={() => navigate(`/trips/${trip.id}`)}
                        >
                            {/* Trip Header */}
                            <div className="h-32 bg-gradient-to-br from-secondary/20 to-accent/20 relative overflow-hidden">
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="text-6xl opacity-30">✈️</div>
                                </div>
                                {trip.isPublic && (
                                    <div className="absolute top-3 right-3 badge badge-success flex items-center gap-1">
                                        <Eye className="w-3 h-3" />
                                        Public
                                    </div>
                                )}
                            </div>

                            {/* Trip Content */}
                            <div className="p-4">
                                <h3 className="text-lg font-semibold text-text-primary mb-2 group-hover:text-secondary transition-colors flex items-center gap-2">
                                    {trip.name}
                                    <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </h3>

                                <div className="space-y-2 text-sm text-text-secondary">
                                    <div className="flex items-center gap-2">
                                        <Calendar className="w-4 h-4" />
                                        <span>{formatDate(trip.startDate)} - {formatDate(trip.endDate)}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <MapPin className="w-4 h-4" />
                                        <span>{trip.stops?.length || 0} cities • {getDurationDays(trip.startDate, trip.endDate)} days</span>
                                    </div>
                                </div>

                                {/* Cities Preview */}
                                {trip.stops && trip.stops.length > 0 && (
                                    <div className="mt-3 flex flex-wrap gap-1">
                                        {trip.stops.slice(0, 3).map((stop) => (
                                            <span
                                                key={stop.id}
                                                className="badge badge-secondary"
                                            >
                                                {stop.city.name}
                                            </span>
                                        ))}
                                        {trip.stops.length > 3 && (
                                            <span className="badge bg-gray-100 text-text-muted">
                                                +{trip.stops.length - 3} more
                                            </span>
                                        )}
                                    </div>
                                )}

                                {/* Actions */}
                                <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between items-center">
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
                        </div>
                    ))}
                </div>
            )}

            {/* Create Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 modal-overlay flex items-center justify-center z-50 p-4">
                    <div className="card p-6 w-full max-w-md animate-slide-up">
                        <h2 className="text-2xl font-bold text-text-primary mb-6">Create New Trip</h2>

                        <form
                            onSubmit={(e) => {
                                e.preventDefault()
                                createMutation.mutate(newTrip)
                            }}
                            className="space-y-4"
                        >
                            <div>
                                <label className="block text-sm font-medium text-text-primary mb-2">Trip Name</label>
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
                                <label className="block text-sm font-medium text-text-primary mb-2">Description (optional)</label>
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
                                    <label className="block text-sm font-medium text-text-primary mb-2">Start Date</label>
                                    <input
                                        type="date"
                                        value={newTrip.startDate}
                                        onChange={(e) => setNewTrip({ ...newTrip, startDate: e.target.value })}
                                        className="input-field"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-text-primary mb-2">End Date</label>
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
