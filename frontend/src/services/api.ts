import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios'

const API_BASE = 'http://localhost:3001'

const api = axios.create({
    baseURL: API_BASE,
    headers: {
        'Content-Type': 'application/json',
    },
})

// Token storage keys
const ACCESS_TOKEN_KEY = 'globetrotter_access_token'
const REFRESH_TOKEN_KEY = 'globetrotter_refresh_token'
const USER_KEY = 'globetrotter_user'

// Token management
export const tokenManager = {
    getAccessToken: () => localStorage.getItem(ACCESS_TOKEN_KEY),
    getRefreshToken: () => localStorage.getItem(REFRESH_TOKEN_KEY),
    getUser: () => {
        const user = localStorage.getItem(USER_KEY)
        return user ? JSON.parse(user) : null
    },

    setTokens: (accessToken: string, refreshToken: string, user?: { id: string; email: string }) => {
        localStorage.setItem(ACCESS_TOKEN_KEY, accessToken)
        localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken)
        if (user) {
            localStorage.setItem(USER_KEY, JSON.stringify(user))
        }
    },

    clearTokens: () => {
        localStorage.removeItem(ACCESS_TOKEN_KEY)
        localStorage.removeItem(REFRESH_TOKEN_KEY)
        localStorage.removeItem(USER_KEY)
    },
}

// Flag to prevent multiple refresh attempts
let isRefreshing = false
let failedQueue: { resolve: (token: string) => void; reject: (error: Error) => void }[] = []

const processQueue = (error: Error | null, token: string | null = null) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error)
        } else {
            prom.resolve(token!)
        }
    })
    failedQueue = []
}

// Add auth token to requests
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    const token = tokenManager.getAccessToken()
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})

// Handle token refresh on 401
api.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }

        // Check if error is due to expired token
        const isTokenExpired =
            error.response?.status === 401 &&
            (error.response?.data as any)?.code === 'TOKEN_EXPIRED'

        if (isTokenExpired && !originalRequest._retry) {
            if (isRefreshing) {
                // Queue this request until refresh completes
                return new Promise((resolve, reject) => {
                    failedQueue.push({
                        resolve: (token: string) => {
                            originalRequest.headers.Authorization = `Bearer ${token}`
                            resolve(api(originalRequest))
                        },
                        reject: (err: Error) => {
                            reject(err)
                        },
                    })
                })
            }

            originalRequest._retry = true
            isRefreshing = true

            try {
                const refreshToken = tokenManager.getRefreshToken()
                if (!refreshToken) {
                    throw new Error('No refresh token')
                }

                const response = await axios.post(`${API_BASE}/auth/refresh`, { refreshToken })
                const { accessToken, refreshToken: newRefreshToken } = response.data

                tokenManager.setTokens(accessToken, newRefreshToken)
                processQueue(null, accessToken)

                originalRequest.headers.Authorization = `Bearer ${accessToken}`
                return api(originalRequest)
            } catch (refreshError) {
                processQueue(refreshError as Error, null)
                tokenManager.clearTokens()
                window.location.href = '/login'
                return Promise.reject(refreshError)
            } finally {
                isRefreshing = false
            }
        }

        // Non-recoverable 401 - clear tokens and redirect
        if (error.response?.status === 401 && !isTokenExpired) {
            tokenManager.clearTokens()
            window.location.href = '/login'
        }

        return Promise.reject(error)
    }
)

// Auth API
export const authApi = {
    signup: (email: string, password: string) =>
        api.post('/auth/signup', { email, password }),

    login: (email: string, password: string) =>
        api.post('/auth/login', { email, password }),

    refresh: (refreshToken: string) =>
        api.post('/auth/refresh', { refreshToken }),

    logout: () => {
        const refreshToken = tokenManager.getRefreshToken()
        return api.post('/auth/logout', { refreshToken })
    },

    logoutAll: () => api.post('/auth/logout-all'),

    me: () => api.get('/auth/me'),

    forgotPassword: (email: string) =>
        api.post('/auth/forgot-password', { email }),

    resetPassword: (token: string, newPassword: string) =>
        api.post('/auth/reset-password', { token, newPassword }),

    changePassword: (currentPassword: string, newPassword: string) =>
        api.post('/auth/change-password', { currentPassword, newPassword }),

    getSessions: () => api.get('/auth/sessions'),

    revokeSession: (sessionId: string) =>
        api.delete(`/auth/sessions/${sessionId}`),
}

// Trips API
export const tripsApi = {
    list: () => api.get('/trips'),
    get: (id: string) => api.get(`/trips/${id}`),
    create: (data: { name: string; description?: string; startDate: string; endDate: string }) =>
        api.post('/trips', data),
    update: (id: string, data: Partial<{ name: string; description: string; startDate: string; endDate: string; isPublic: boolean }>) =>
        api.put(`/trips/${id}`, data),
    delete: (id: string) => api.delete(`/trips/${id}`),
    addStop: (tripId: string, data: { cityId: string; startDate: string; endDate: string }) =>
        api.post(`/trips/${tripId}/stops`, data),
    addActivity: (tripId: string, data: { activityId: string; date: string; timeSlot?: string }) =>
        api.post(`/trips/${tripId}/activities`, data),
    publish: (id: string) => api.post(`/trips/${id}/publish`),
    copy: (id: string) => api.post(`/trips/${id}/copy`),
}

// Stops API
export const stopsApi = {
    update: (id: string, data: { startDate?: string; endDate?: string; stopOrder?: number }) =>
        api.put(`/stops/${id}`, data),
    delete: (id: string) => api.delete(`/stops/${id}`),
}

// Cities API
export const citiesApi = {
    search: (query?: string) => api.get('/cities', { params: { q: query } }),
    getActivities: (cityId: string) => api.get(`/cities/${cityId}/activities`),
}

// Activities API
export const activitiesApi = {
    delete: (id: string) => api.delete(`/activities/${id}`),
}

// Budget API
export const budgetApi = {
    get: (tripId: string) => api.get(`/budget/${tripId}`),
}

// Public API
export const publicApi = {
    getTrip: (id: string) => api.get(`/public/${id}`),
}

// Profile API
export const profileApi = {
    get: () => api.get('/profile'),
    update: (data: { name?: string; email?: string }) => api.put('/profile', data),
    delete: (password: string) => api.delete('/profile', { data: { password } }),
}

export default api
