import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { tripsApi, budgetApi } from '../services/api'
import { Trip, Budget } from '../types'
import { ArrowLeft, DollarSign, Bed, Utensils, Car, Ticket, TrendingUp } from 'lucide-react'

export default function BudgetView() {
    const { id } = useParams<{ id: string }>()

    const { data: trip } = useQuery({
        queryKey: ['trip', id],
        queryFn: () => tripsApi.get(id!).then((res) => res.data.trip as Trip),
        enabled: !!id,
    })

    const { data: budgetData, isLoading } = useQuery({
        queryKey: ['budget', id],
        queryFn: () => budgetApi.get(id!).then((res) => res.data.budget as Budget),
        enabled: !!id,
    })

    if (isLoading || !trip || !budgetData) {
        return (
            <div className="animate-pulse space-y-6">
                <div className="h-6 bg-slate-100 rounded w-1/4" />
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map((i) => <div key={i} className="card h-24" />)}
                </div>
                <div className="card h-64" />
            </div>
        )
    }

    // Use professional design system colors
    const pieData = [
        { name: 'Stay', value: budgetData.stay, color: '#0F2A44' },      // Primary (Midnight Blue)
        { name: 'Activities', value: budgetData.activities, color: '#2FA4A9' }, // Accent (Teal)
        { name: 'Meals', value: budgetData.meals, color: '#F59E0B' },    // Warning (Amber)
        { name: 'Transport', value: budgetData.transport, color: '#3B5B8A' }, // Secondary (Slate Blue)
    ]

    const categoryData = Object.entries(budgetData.categoryBreakdown).map(([name, value]) => ({
        name,
        value,
    }))

    const statCards = [
        { label: 'Total Budget', value: `$${budgetData.total}`, icon: DollarSign, bgColor: 'bg-primary', textColor: 'text-white' },
        { label: 'Stay', value: `$${budgetData.stay}`, icon: Bed, bgColor: 'bg-secondary', textColor: 'text-white' },
        { label: 'Meals', value: `$${budgetData.meals}`, icon: Utensils, bgColor: 'bg-warning', textColor: 'text-white' },
        { label: 'Per Day', value: `$${budgetData.perDay}`, icon: TrendingUp, bgColor: 'bg-accent', textColor: 'text-white' },
    ]

    return (
        <div className="animate-fade-in">
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
                <Link to={`/trips/${id}`} className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div>
                    <h1 className="text-xl font-semibold text-slate-800">{trip.name}</h1>
                    <p className="text-slate-500 text-sm">{budgetData.tripDays} day trip</p>
                </div>
            </div>

            {/* Hero Total */}
            <div className="card p-6 mb-6 bg-gradient-to-r from-slate-800 to-slate-700 text-white">
                <p className="text-slate-300 text-sm mb-1">Total Estimated Budget</p>
                <p className="text-4xl font-bold">${budgetData.total.toLocaleString()}</p>
                <p className="text-slate-400 text-sm mt-2">${budgetData.perDay}/day average</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="card p-4">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center mb-2">
                        <Bed className="w-4 h-4 text-slate-600" />
                    </div>
                    <p className="text-slate-500 text-xs">Accommodation</p>
                    <p className="text-lg font-semibold text-slate-800">${budgetData.stay}</p>
                </div>
                <div className="card p-4">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center mb-2">
                        <Utensils className="w-4 h-4 text-slate-600" />
                    </div>
                    <p className="text-slate-500 text-xs">Meals</p>
                    <p className="text-lg font-semibold text-slate-800">${budgetData.meals}</p>
                </div>
                <div className="card p-4">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center mb-2">
                        <Ticket className="w-4 h-4 text-slate-600" />
                    </div>
                    <p className="text-slate-500 text-xs">Activities</p>
                    <p className="text-lg font-semibold text-slate-800">${budgetData.activities}</p>
                </div>
                <div className="card p-4">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center mb-2">
                        <Car className="w-4 h-4 text-slate-600" />
                    </div>
                    <p className="text-slate-500 text-xs">Transport</p>
                    <p className="text-lg font-semibold text-slate-800">${budgetData.transport}</p>
                </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Pie Chart */}
                <div className="card p-6">
                    <h3 className="text-base font-medium text-slate-700 mb-4">Budget Breakdown</h3>
                    <div className="h-56">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={50}
                                    outerRadius={70}
                                    paddingAngle={3}
                                    dataKey="value"
                                >
                                    {pieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#FFFFFF',
                                        border: '1px solid #E2E8F0',
                                        borderRadius: '8px',
                                        fontSize: '12px',
                                    }}
                                    formatter={(value: number) => [`$${value}`, '']}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="flex flex-wrap justify-center gap-3 mt-4">
                        {pieData.map((item) => (
                            <div key={item.name} className="flex items-center gap-1.5">
                                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                                <span className="text-xs text-slate-500">{item.name}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Bar Chart */}
                <div className="card p-6">
                    <h3 className="text-base font-medium text-slate-700 mb-4">Activity Costs</h3>
                    <div className="h-56">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={categoryData} layout="vertical">
                                <XAxis type="number" stroke="#94A3B8" tickFormatter={(v) => `$${v}`} fontSize={11} />
                                <YAxis type="category" dataKey="name" stroke="#94A3B8" width={70} fontSize={11} />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#FFFFFF',
                                        border: '1px solid #E2E8F0',
                                        borderRadius: '8px',
                                        fontSize: '12px',
                                    }}
                                    formatter={(value: number) => [`$${value}`, 'Cost']}
                                />
                                <Bar dataKey="value" fill="#64748B" radius={[0, 4, 4, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    )
}


