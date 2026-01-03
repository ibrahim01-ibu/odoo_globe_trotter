export interface User {
    id: string
    email: string
    createdAt?: string
}

export interface City {
    id: string
    name: string
    country: string
    costIndex: number
    popularityScore: number
    imageUrl?: string
}

export interface TripStop {
    id: string
    tripId: string
    cityId: string
    startDate: string
    endDate: string
    stopOrder: number
    city: City
}

export interface Activity {
    id: string
    cityId: string
    name: string
    category: string
    description?: string
    durationHours: number
    avgCost: number
    imageUrl?: string
    city?: City
}

export interface DayActivity {
    id: string
    tripId: string
    activityId: string
    date: string
    timeSlot?: string
    activity: Activity
}

export interface Trip {
    id: string
    userId: string
    name: string
    description?: string
    startDate: string
    endDate: string
    isPublic: boolean
    createdAt: string
    stops: TripStop[]
    activities: DayActivity[]
    _count?: { activities: number }
}

export interface Budget {
    stay: number
    activities: number
    meals: number
    transport: number
    total: number
    perDay: number
    tripDays: number
    dailyBreakdown: Record<string, { activities: number; meals: number }>
    categoryBreakdown: Record<string, number>
}
