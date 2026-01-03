import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { authApi, tokenManager } from '../services/api'

interface User {
    id: string
    email: string
}

interface AuthContextType {
    user: User | null
    isAuthenticated: boolean
    isLoading: boolean
    login: (email: string, password: string) => Promise<void>
    signup: (email: string, password: string) => Promise<void>
    logout: () => Promise<void>
    logoutAll: () => Promise<void>
    changePassword: (currentPassword: string, newPassword: string) => Promise<void>
    forgotPassword: (email: string) => Promise<{ demoToken?: string }>
    resetPassword: (token: string, newPassword: string) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const accessToken = tokenManager.getAccessToken()
        const savedUser = tokenManager.getUser()

        if (accessToken && savedUser) {
            setUser(savedUser)
            // Verify token is still valid
            authApi.me()
                .then((res) => setUser(res.data.user))
                .catch(() => {
                    // Token invalid, try refresh
                    const refreshToken = tokenManager.getRefreshToken()
                    if (refreshToken) {
                        authApi.refresh(refreshToken)
                            .then((res) => {
                                tokenManager.setTokens(res.data.accessToken, res.data.refreshToken)
                                return authApi.me()
                            })
                            .then((res) => setUser(res.data.user))
                            .catch(() => {
                                tokenManager.clearTokens()
                                setUser(null)
                            })
                    } else {
                        tokenManager.clearTokens()
                        setUser(null)
                    }
                })
                .finally(() => setIsLoading(false))
        } else {
            setIsLoading(false)
        }
    }, [])

    const login = async (email: string, password: string) => {
        const res = await authApi.login(email, password)
        tokenManager.setTokens(res.data.accessToken, res.data.refreshToken, res.data.user)
        setUser(res.data.user)
    }

    const signup = async (email: string, password: string) => {
        const res = await authApi.signup(email, password)
        tokenManager.setTokens(res.data.accessToken, res.data.refreshToken, res.data.user)
        setUser(res.data.user)
    }

    const logout = async () => {
        try {
            await authApi.logout()
        } catch {
            // Ignore errors, clear tokens anyway
        }
        tokenManager.clearTokens()
        setUser(null)
    }

    const logoutAll = async () => {
        try {
            await authApi.logoutAll()
        } catch {
            // Ignore errors
        }
        tokenManager.clearTokens()
        setUser(null)
    }

    const changePassword = async (currentPassword: string, newPassword: string) => {
        await authApi.changePassword(currentPassword, newPassword)
    }

    const forgotPassword = async (email: string) => {
        const res = await authApi.forgotPassword(email)
        return { demoToken: res.data._demoToken }
    }

    const resetPassword = async (token: string, newPassword: string) => {
        await authApi.resetPassword(token, newPassword)
    }

    return (
        <AuthContext.Provider value={{
            user,
            isAuthenticated: !!user,
            isLoading,
            login,
            signup,
            logout,
            logoutAll,
            changePassword,
            forgotPassword,
            resetPassword,
        }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider')
    }
    return context
}
