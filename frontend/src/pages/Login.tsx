import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Globe, Mail, Lock, ArrowRight, Sparkles } from 'lucide-react'

export default function Login() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const { login } = useAuth()
    const navigate = useNavigate()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setIsLoading(true)

        try {
            await login(email, password)
            navigate('/')
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to login')
        } finally {
            setIsLoading(false)
        }
    }

    const fillDemo = () => {
        setEmail('demo@globetrotter.app')
        setPassword('demo123')
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="card max-w-md w-full p-8 bg-white/80 backdrop-blur-xl shadow-2xl animate-fade-in relative overflow-hidden">
                {/* Decorative blob */}
                <div className="absolute -top-20 -right-20 w-40 h-40 bg-teal-100 rounded-full blur-3xl opacity-50 pointer-events-none"></div>
                <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-blue-100 rounded-full blur-3xl opacity-50 pointer-events-none"></div>

                {/* Logo */}
                <div className="flex flex-col items-center mb-8 relative">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center mb-4 shadow-lg shadow-teal-200">
                        <Globe className="w-9 h-9 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-teal-600 to-cyan-600 font-display">
                        GlobeTrotter
                    </h1>
                    <p className="text-slate-500 mt-2 font-medium">Plan your perfect adventure</p>
                </div>

                {/* Demo button */}
                <button
                    onClick={fillDemo}
                    className="w-full mb-8 py-3 px-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 font-medium flex items-center justify-center gap-2 hover:bg-amber-100 transition-all group shadow-sm hover:shadow-md"
                >
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    Try Demo Account
                </button>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-5 relative">
                    {error && (
                        <div className="p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
                            {error}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email</label>
                        <div className="relative group">
                            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-teal-500 transition-colors" />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="input-field pl-11 py-3"
                                placeholder="you@example.com"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Password</label>
                        <div className="relative group">
                            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-teal-500 transition-colors" />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="input-field pl-11 py-3"
                                placeholder="••••••••"
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="btn-primary w-full flex items-center justify-center gap-2 py-3.5 text-base shadow-lg shadow-teal-200/50 mt-2"
                    >
                        {isLoading ? (
                            <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-white" />
                        ) : (
                            <>
                                Sign In
                                <ArrowRight className="w-5 h-5" />
                            </>
                        )}
                    </button>
                </form>

                <p className="text-center text-slate-500 mt-8">
                    Don't have an account?{' '}
                    <Link to="/signup" className="text-teal-600 hover:text-teal-700 font-semibold hover:underline">
                        Sign up
                    </Link>
                </p>
            </div>
        </div>
    )
}
