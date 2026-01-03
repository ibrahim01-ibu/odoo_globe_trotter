import { Outlet, Link, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Globe, LogOut, Home } from 'lucide-react'

export default function Layout() {
    const { user, logout } = useAuth()
    const location = useLocation()

    return (
        <div className="min-h-screen bg-bg-main font-sans">
            {/* Navbar - Floating Glass */}
            <nav className="navbar">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        {/* Logo */}
                        <Link to="/" className="flex items-center gap-2 group">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-white shadow-lg group-hover:scale-105 transition-transform duration-300">
                                <Globe className="w-6 h-6" />
                            </div>
                            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-dark to-primary">
                                GlobeTrotter
                            </span>
                        </Link>

                        {/* Nav Links */}
                        <div className="flex items-center gap-1 bg-white/50 p-1.5 rounded-full border border-white/20 shadow-sm backdrop-blur-md">
                            <Link
                                to="/"
                                className={`flex items-center gap-2 px-6 py-2 rounded-full transition-all duration-300 ${location.pathname === '/'
                                    ? 'bg-primary text-white shadow-md'
                                    : 'text-secondary hover:text-primary hover:bg-white/50'
                                    }`}
                            >
                                <Home className="w-4 h-4" />
                                <span className="font-medium text-sm">Dashboard</span>
                            </Link>

                            {/* Add more links here later, pill shaped */}
                        </div>

                        {/* User Menu */}
                        <div className="flex items-center gap-4">
                            <div className="hidden sm:flex flex-col items-end">
                                <span className="text-sm font-semibold text-slate-700">{user?.email?.split('@')[0]}</span>
                                <span className="text-xs text-slate-500">Traveler</span>
                            </div>
                            <div className="h-8 w-[1px] bg-slate-200 mx-2"></div>
                            <button
                                onClick={logout}
                                className="p-2 rounded-full text-slate-400 hover:text-danger hover:bg-red-50 transition-all"
                                title="Logout"
                            >
                                <LogOut className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
                <Outlet />
            </main>
        </div>
    )
}
