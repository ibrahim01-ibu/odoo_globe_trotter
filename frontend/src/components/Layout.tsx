import { Outlet, Link, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Globe, LogOut, Home } from 'lucide-react'

export default function Layout() {
    const { user, logout } = useAuth()
    const location = useLocation()

    return (
        <div className="min-h-screen bg-bg">
            {/* Navbar - Midnight Blue */}
            <nav className="navbar">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        {/* Logo */}
                        <Link to="/" className="flex items-center gap-3 group">
                            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors">
                                <Globe className="w-6 h-6 text-white" />
                            </div>
                            <span className="text-xl font-bold text-white">GlobeTrotter</span>
                        </Link>

                        {/* Nav Links */}
                        <div className="flex items-center gap-6">
                            <Link
                                to="/"
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${location.pathname === '/'
                                        ? 'nav-active'
                                        : 'text-white/70 hover:text-white hover:bg-white/10'
                                    }`}
                            >
                                <Home className="w-4 h-4" />
                                <span className="hidden sm:inline">Dashboard</span>
                            </Link>

                            {/* User Menu */}
                            <div className="flex items-center gap-4">
                                <span className="text-sm text-white/70 hidden sm:block">{user?.email}</span>
                                <button
                                    onClick={logout}
                                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-white/70 hover:text-red-300 hover:bg-red-500/20 transition-all"
                                >
                                    <LogOut className="w-4 h-4" />
                                    <span className="hidden sm:inline">Logout</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <Outlet />
            </main>
        </div>
    )
}
