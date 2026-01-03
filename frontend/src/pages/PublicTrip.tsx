import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import { publicApi, tripsApi } from '../services/api'
import { Trip } from '../types'
import { Globe, Calendar, Clock, Copy, Check } from 'lucide-react'
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
            <div className="min-h-screen flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 rounded-full border-4 border-slate-200 border-t-slate-500 animate-spin"></div>
                    <p className="text-slate-500">Loading trip...</p>
                </div>
            </div>
        )
    }

    if (error || !data) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <div className="card p-12 text-center shadow-2xl max-w-lg w-full bg-white/80 backdrop-blur-xl">
                    <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Globe className="w-10 h-10 text-slate-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800 mb-3">Trip Not Found</h2>
                    <p className="text-slate-500 text-lg">This journey may be private or no longer exists.</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-slate-50 p-4 md:p-8">
            <div className="max-w-4xl mx-auto animate-fade-in space-y-6">
                {/* Header */}
                <div className="card p-6">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center">
                                <Globe className="w-6 h-6 text-slate-600" />
                            </div>
                            <div>
                                <h1 className="text-xl font-semibold text-slate-800">{data.name}</h1>
                                <p className="text-slate-500 text-sm">
                                    {formatDate(data.startDate)} – {formatDate(data.endDate)}
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-2 w-full md:w-auto">
                            <button
                                onClick={copyUrl}
                                className="btn-secondary flex-1 md:flex-none flex items-center justify-center gap-2"
                            >
                                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                {copied ? 'Copied' : 'Share'}
                            </button>
                            {isAuthenticated && (
                                <button
                                    onClick={() => copyMutation.mutate()}
                                    disabled={copyMutation.isPending}
                                    className="btn-primary flex-1 md:flex-none"
                                >
                                    {copyMutation.isPending ? 'Copying...' : 'Clone'}
                                </button>
                            )}
                        </div>
                    </div>
                    {data.description && (
                        <p className="mt-4 pt-4 border-t border-slate-100 text-slate-600">{data.description}</p>
                    )}
                </div>

                {/* Itinerary */}
                <div className="space-y-4">
                    {data.stops?.map((stop, index) => (
                        <div key={stop.id} className="card overflow-hidden">
                            {/* Stop Header */}
                            <div className="p-4 bg-slate-50 border-b border-slate-100">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-slate-200 text-slate-600 flex items-center justify-center text-sm font-semibold">
                                        {index + 1}
                                    </div>
                                    <div>
                                        <h2 className="font-medium text-slate-800">
                                            {stop.city.name}
                                            <span className="text-slate-400 font-normal ml-1">({stop.city.country})</span>
                                        </h2>
                                        <p className="text-sm text-slate-500">
                                            {formatDate(stop.startDate)} – {formatDate(stop.endDate)}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 space-y-4">
                                {getDatesBetween(stop.startDate.split('T')[0], stop.endDate.split('T')[0]).map((date) => {
                                    const dayActivities = getActivitiesForDate(date)
                                    return (
                                        <div key={date}>
                                            <p className="text-sm font-medium text-slate-600 mb-2">{formatDate(date)}</p>
                                            {dayActivities.length === 0 ? (
                                                <div className="p-3 rounded-lg bg-slate-50 text-slate-400 text-sm">
                                                    Free day
                                                </div>
                                            ) : (
                                                <div className="space-y-2">
                                                    {dayActivities.map((da) => (
                                                        <div
                                                            key={da.id}
                                                            className="flex items-center justify-between p-3 rounded-lg bg-slate-50"
                                                        >
                                                            <div className="flex items-center gap-3">
                                                                <span className="px-2 py-0.5 rounded bg-slate-200 text-slate-600 text-xs font-medium">
                                                                    {da.activity.category}
                                                                </span>
                                                                <span className="text-slate-700">{da.activity.name}</span>
                                                            </div>
                                                            <div className="flex items-center gap-4 text-sm text-slate-500">
                                                                <span className="flex items-center gap-1">
                                                                    <Clock className="w-3 h-3" />
                                                                    {da.activity.durationHours}h
                                                                </span>
                                                                <span className="font-medium text-slate-700">${da.activity.avgCost}</span>
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
                    <p className="text-slate-400 text-sm">
                        Planned with <span className="font-semibold text-slate-500">GlobeTrotter</span>
                    </p>
                </div>
            </div>
        </div>
    )
}
