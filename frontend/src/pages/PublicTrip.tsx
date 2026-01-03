import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import { publicApi, tripsApi } from '../services/api'
import { Trip } from '../types'
import { Globe, MapPin, Calendar, Clock, DollarSign, Copy, Check } from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'

export default function PublicTrip() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const { isAuthenticated } = useAuth()
    const [copied, setCopied] = useState(false)

    const { data, isLoading, error } = useQuery({
        queryKey: ['public-trip', id],
        queryFn: () => publicApi.getTrip(id!).then((res) => res.data.trip as Trip),
        enabled: !!id,
    })

    const copyMutation = useMutation({
        mutationFn: () => tripsApi.copy(id!),
        onSuccess: (res) => {
            navigate(`/trips/${res.data.trip.id}`)
        },
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
        return data?.activities?.filter((a) => a.date.split('T')[0] === date) || []
    }

    const copyUrl = () => {
        navigator.clipboard.writeText(window.location.href)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    if (isLoading) {
        return (
            <div className="min-h-screen bg-bg flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        )
    }

    if (error || !data) {
        return (
            <div className="min-h-screen bg-bg flex items-center justify-center">
                <div className="card p-8 text-center shadow-lg">
                    <Globe className="w-16 h-16 text-text-muted mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-text-primary mb-2">Trip Not Found</h2>
                    <p className="text-text-secondary">This trip may be private or doesn't exist.</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-bg p-4 md:p-8">
            <div className="max-w-4xl mx-auto animate-fade-in">
                {/* Header */}
                <div className="card p-6 mb-6 shadow-lg">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center">
                                <Globe className="w-7 h-7 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-text-primary">{data.name}</h1>
                                <p className="text-text-secondary">
                                    {formatDate(data.startDate)} - {formatDate(data.endDate)}
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={copyUrl}
                                className="btn-secondary flex items-center gap-2 px-4 py-2"
                            >
                                {copied ? <Check className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4" />}
                                {copied ? 'Copied!' : 'Share'}
                            </button>
                            {isAuthenticated && (
                                <button
                                    onClick={() => copyMutation.mutate()}
                                    disabled={copyMutation.isPending}
                                    className="btn-primary"
                                >
                                    {copyMutation.isPending ? 'Copying...' : 'Copy to My Trips'}
                                </button>
                            )}
                        </div>
                    </div>
                    {data.description && (
                        <p className="text-text-secondary mt-4 border-t border-gray-100 pt-4">{data.description}</p>
                    )}
                </div>

                {/* Itinerary */}
                <div className="space-y-6">
                    {data.stops?.map((stop, index) => (
                        <div key={stop.id} className="card p-6">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center text-lg font-bold text-secondary">
                                    {index + 1}
                                </div>
                                <div>
                                    <h2 className="text-xl font-semibold text-text-primary">{stop.city.name}</h2>
                                    <p className="text-text-secondary text-sm">
                                        {stop.city.country} • {formatDate(stop.startDate)} - {formatDate(stop.endDate)}
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                {getDatesBetween(stop.startDate.split('T')[0], stop.endDate.split('T')[0]).map((date) => {
                                    const dayActivities = getActivitiesForDate(date)
                                    return (
                                        <div key={date} className="border-l-2 border-secondary/30 pl-4">
                                            <div className="text-sm font-medium text-secondary mb-2">{formatDate(date)}</div>
                                            {dayActivities.length === 0 ? (
                                                <p className="text-text-muted text-sm">Free day</p>
                                            ) : (
                                                <div className="space-y-2">
                                                    {dayActivities.map((da) => (
                                                        <div
                                                            key={da.id}
                                                            className="flex items-center justify-between py-2 px-3 rounded-lg bg-gray-50"
                                                        >
                                                            <div className="flex items-center gap-3">
                                                                <span className="badge badge-secondary">
                                                                    {da.activity.category}
                                                                </span>
                                                                <span className="text-text-primary">{da.activity.name}</span>
                                                            </div>
                                                            <div className="flex items-center gap-4 text-sm text-text-secondary">
                                                                <span className="flex items-center gap-1">
                                                                    <Clock className="w-3 h-3" />
                                                                    {da.activity.durationHours}h
                                                                </span>
                                                                <span className="text-success">${da.activity.avgCost}</span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Footer */}
                <div className="text-center py-8">
                    <p className="text-text-muted text-sm">
                        Planned with <span className="text-primary font-semibold">GlobeTrotter</span>
                    </p>
                </div>
            </div>
        </div>
    )
}
