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
        <div className="min-h-screen flex items-center justify-center p-4 bg-bg">
            <div className="card p-8 w-full max-w-md animate-fade-in shadow-lg">
                {/* Logo */}
                <div className="flex flex-col items-center mb-8">
                    <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center mb-4 shadow-lg">
                        <Globe className="w-9 h-9 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-text-primary">GlobeTrotter</h1>
                    <p className="text-text-secondary mt-2">Plan your perfect adventure</p>
                </div>

                {/* Demo button */}
                <button
                    onClick={fillDemo}
                    className="w-full mb-6 py-3 px-4 rounded-lg bg-accent/10 border border-accent/30 text-accent font-medium flex items-center justify-center gap-2 hover:bg-accent/20 transition-all group"
                >
                    <Sparkles className="w-4 h-4" />
                    Try Demo Account
                </button>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                        <div className="p-3 rounded-lg bg-danger/10 border border-danger/30 text-danger text-sm">
                            {error}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-text-primary mb-2">Email</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="input-field pl-11"
                                placeholder="you@example.com"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-text-primary mb-2">Password</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="input-field pl-11"
                                placeholder="••••••••"
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="btn-primary w-full flex items-center justify-center gap-2"
                    >
                        {isLoading ? (
                            <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-white" />
                        ) : (
                            <>
                                Sign In
                                <ArrowRight className="w-4 h-4" />
                            </>
                        )}
                    </button>
                </form>

                <p className="text-center text-text-secondary mt-6">
                    Don't have an account?{' '}
                    <Link to="/signup" className="text-secondary hover:text-secondary-dark font-medium">
                        Sign up
                    </Link>
                </p>
            </div>
        </div>
    )
}
