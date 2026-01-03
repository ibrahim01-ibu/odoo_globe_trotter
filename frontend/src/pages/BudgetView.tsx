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
                <div className="h-8 bg-gray-100 rounded w-1/3" />
                <div className="grid grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map((i) => <div key={i} className="card h-24" />)}
                </div>
                <div className="card h-64" />
            </div>
        )
    }

    // Use professional design system colors
    const currencyFormatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: budgetData.currency || 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    })

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
        { label: 'Total Budget', value: currencyFormatter.format(budgetData.total), icon: DollarSign, bgColor: 'bg-primary', textColor: 'text-white' },
        { label: 'Stay', value: currencyFormatter.format(budgetData.stay), icon: Bed, bgColor: 'bg-secondary', textColor: 'text-white' },
        { label: 'Meals', value: currencyFormatter.format(budgetData.meals), icon: Utensils, bgColor: 'bg-warning', textColor: 'text-white' },
        { label: 'Per Day', value: currencyFormatter.format(budgetData.perDay), icon: TrendingUp, bgColor: 'bg-accent', textColor: 'text-white' },
    ]

    return (
        <div className="animate-fade-in">
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
                <Link to={`/trips/${id}`} className="icon-btn">
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-text-primary">{trip.name} - Budget</h1>
                    <p className="text-text-secondary text-sm">{budgetData.tripDays} days trip</p>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {statCards.map((stat) => (
                    <div key={stat.label} className="card p-4">
                        <div className={`w-10 h-10 rounded-xl ${stat.bgColor} flex items-center justify-center mb-3`}>
                            <stat.icon className={`w-5 h-5 ${stat.textColor}`} />
                        </div>
                        <p className="text-text-secondary text-sm">{stat.label}</p>
                        <p className="text-2xl font-bold text-text-primary">{stat.value}</p>
                    </div>
                ))}
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Pie Chart */}
                <div className="card p-6">
                    <h3 className="text-lg font-semibold text-text-primary mb-4">Budget Breakdown</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                    labelLine={false}
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
                                        color: '#1E293B',
                                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
                                    }}
                                    formatter={(value: number) => [currencyFormatter.format(value), '']}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Legend */}
                    <div className="flex flex-wrap justify-center gap-4 mt-4">
                        {pieData.map((item) => (
                            <div key={item.name} className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                                <span className="text-sm text-text-secondary">{item.name}: {currencyFormatter.format(item.value)}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Bar Chart - Activities by Category */}
                <div className="card p-6">
                    <h3 className="text-lg font-semibold text-text-primary mb-4">Activity Costs by Category</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={categoryData} layout="vertical">
                                <XAxis type="number" stroke="#64748B" tickFormatter={(v) => currencyFormatter.format(v)} />
                                <YAxis type="category" dataKey="name" stroke="#64748B" width={80} />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#FFFFFF',
                                        border: '1px solid #E2E8F0',
                                        borderRadius: '8px',
                                        color: '#1E293B',
                                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
                                    }}
                                    formatter={(value: number) => [currencyFormatter.format(value), 'Cost']}
                                />
                                <Bar dataKey="value" fill="#3B5B8A" radius={[0, 4, 4, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Additional Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <div className="card p-4 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                        <Ticket className="w-6 h-6 text-accent" />
                    </div>
                    <div>
                        <p className="text-sm text-text-secondary">Activities</p>
                        <p className="text-xl font-bold text-text-primary">{currencyFormatter.format(budgetData.activities)}</p>
                    </div>
                </div>
                <div className="card p-4 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center">
                        <Car className="w-6 h-6 text-secondary" />
                    </div>
                    <div>
                        <p className="text-sm text-text-secondary">Transport</p>
                        <p className="text-xl font-bold text-text-primary">{currencyFormatter.format(budgetData.transport)}</p>
                    </div>
                </div>
                <div className="card p-4 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                        <DollarSign className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                        <p className="text-sm text-text-secondary">Total Activities</p>
                        <p className="text-xl font-bold text-text-primary">{trip.activities.length}</p>
                    </div>
                </div>
            </div>
        </div>
    )
}
