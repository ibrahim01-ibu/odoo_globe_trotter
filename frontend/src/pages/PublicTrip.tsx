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
                    <div className="w-16 h-16 rounded-full border-4 border-teal-100 border-t-teal-500 animate-spin"></div>
                    <p className="text-teal-600 font-medium animate-pulse">Loading adventure...</p>
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
        <div className="min-h-screen p-4 md:p-8">
            <div className="max-w-5xl mx-auto animate-fade-in space-y-8">
                {/* Header */}
                <div className="card p-8 shadow-xl bg-white/90 backdrop-blur-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-teal-50 rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative">
                        <div className="flex items-center gap-6">
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center shadow-lg shadow-teal-200">
                                <Globe className="w-8 h-8 text-white" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-slate-800 mb-2">{data.name}</h1>
                                <div className="flex items-center gap-3 text-slate-500 font-medium">
                                    <Calendar className="w-4 h-4 text-teal-500" />
                                    <span>
                                        {formatDate(data.startDate)} - {formatDate(data.endDate)}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-3 w-full md:w-auto">
                            <button
                                onClick={copyUrl}
                                className="btn-secondary flex-1 md:flex-none flex items-center justify-center gap-2"
                            >
                                {copied ? <Check className="w-4 h-4 text-teal-600" /> : <Copy className="w-4 h-4" />}
                                {copied ? 'Copied' : 'Share'}
                            </button>
                            {isAuthenticated && (
                                <button
                                    onClick={() => copyMutation.mutate()}
                                    disabled={copyMutation.isPending}
                                    className="btn-primary flex-1 md:flex-none"
                                >
                                    {copyMutation.isPending ? 'Copying...' : 'Clone Trip'}
                                </button>
                            )}
                        </div>
                    </div>
                    {data.description && (
                        <div className="mt-6 pt-6 border-t border-slate-100/50">
                            <p className="text-slate-600 leading-relaxed text-lg">{data.description}</p>
                        </div>
                    )}
                </div>

                {/* Itinerary */}
                <div className="space-y-8">
                    {data.stops?.map((stop, index) => (
                        <div key={stop.id} className="card p-0 overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
                            {/* Stop Header */}
                            <div className="bg-gradient-to-r from-slate-50 to-white p-6 border-b border-slate-100 flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center text-lg font-bold shadow-sm">
                                    {index + 1}
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                                        {stop.city.name}
                                        <span className="text-sm font-normal text-slate-400">({stop.city.country})</span>
                                    </h2>
                                    <div className="flex items-center gap-3 text-sm text-slate-500 mt-1">
                                        <Calendar className="w-4 h-4" />
                                        {formatDate(stop.startDate)} - {formatDate(stop.endDate)}
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 space-y-6 bg-white/50">
                                {getDatesBetween(stop.startDate.split('T')[0], stop.endDate.split('T')[0]).map((date) => {
                                    const dayActivities = getActivitiesForDate(date)
                                    return (
                                        <div key={date} className="relative pl-6 border-l-2 border-teal-100 last:border-0 hover:border-teal-300 transition-colors duration-300">
                                            <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-white border-4 border-teal-100"></div>

                                            <div className="text-base font-semibold text-slate-700 mb-3 flex items-center gap-2">
                                                {formatDate(date)}
                                            </div>

                                            {dayActivities.length === 0 ? (
                                                <div className="p-4 rounded-lg bg-slate-50 border border-slate-100 border-dashed text-slate-400 text-sm italic">
                                                    Free day for exploration
                                                </div>
                                            ) : (
                                                <div className="space-y-3">
                                                    {dayActivities.map((da) => (
                                                        <div
                                                            key={da.id}
                                                            className="group flex items-center justify-between p-4 rounded-xl bg-white border border-slate-100 hover:border-teal-200 hover:shadow-md transition-all duration-300"
                                                        >
                                                            <div className="flex items-center gap-4">
                                                                <span className="px-2.5 py-1 rounded-md bg-teal-50 text-teal-700 text-xs font-bold uppercase tracking-wide">
                                                                    {da.activity.category}
                                                                </span>
                                                                <span className="text-slate-800 font-medium group-hover:text-teal-700 transition-colors">
                                                                    {da.activity.name}
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center gap-6 text-sm">
                                                                <span className="flex items-center gap-1.5 text-slate-500 bg-slate-50 px-2 py-1 rounded-md">
                                                                    <Clock className="w-3.5 h-3.5" />
                                                                    {da.activity.durationHours}h
                                                                </span>
                                                                <span className="font-semibold text-teal-600 bg-teal-50 px-2 py-1 rounded-md">
                                                                    ${da.activity.avgCost}
                                                                </span>
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
                <div className="text-center py-12">
                    <p className="text-slate-400 text-sm flex items-center justify-center gap-2">
                        Planned with
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-500 to-cyan-500 font-bold text-base">GlobeTrotter</span>
                    </p>
                </div>
            </div>
        </div>
    )
}
