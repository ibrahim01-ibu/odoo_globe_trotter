import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { profileApi, authApi, tokenManager } from '../services/api'
import {
    User,
    Mail,
    Lock,
    Trash2,
    Save,
    AlertTriangle,
    Shield,
    Monitor,
    X,
    Check,
    Loader2,
    Globe,
    Wallet
} from 'lucide-react'
import { COUNTRIES, getCurrencyForCountry } from '../utils/currency'

interface Session {
    id: string
    createdAt: string
    expiresAt: string
}

interface ProfileData {
    id: string
    email: string
    name: string | null
    homeCountry: string
    currency: string
    createdAt: string
    updatedAt: string
    tripCount: number
}

export default function Profile() {
    const { user, changePassword } = useAuth()
    const navigate = useNavigate()

    // Profile state
    const [profile, setProfile] = useState<ProfileData | null>(null)
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [homeCountry, setHomeCountry] = useState('')
    const [currency, setCurrency] = useState('')
    const [isLoadingProfile, setIsLoadingProfile] = useState(true)
    const [isUpdating, setIsUpdating] = useState(false)
    const [profileMessage, setProfileMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

    // Password state
    const [currentPassword, setCurrentPassword] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [isChangingPassword, setIsChangingPassword] = useState(false)
    const [passwordMessage, setPasswordMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

    // Sessions state
    const [sessions, setSessions] = useState<Session[]>([])
    const [isLoadingSessions, setIsLoadingSessions] = useState(true)

    // Delete account state
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [deletePassword, setDeletePassword] = useState('')
    const [isDeleting, setIsDeleting] = useState(false)
    const [deleteError, setDeleteError] = useState('')

    // Load profile data
    useEffect(() => {
        loadProfile()
        loadSessions()
    }, [])

    const loadProfile = async () => {
        try {
            const res = await profileApi.get()
            setProfile(res.data.user)
            setName(res.data.user.name || '')
            setEmail(res.data.user.email)
            setHomeCountry(res.data.user.homeCountry || '')
            setCurrency(res.data.user.currency || '')
        } catch (error) {
            console.error('Failed to load profile:', error)
        } finally {
            setIsLoadingProfile(false)
        }
    }

    const loadSessions = async () => {
        try {
            const res = await authApi.getSessions()
            setSessions(res.data.sessions)
        } catch (error) {
            console.error('Failed to load sessions:', error)
        } finally {
            setIsLoadingSessions(false)
        }
    }

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsUpdating(true)
        setProfileMessage(null)

        try {
            const res = await profileApi.update({
                name: name.trim() || undefined,
                email,
                homeCountry,
                currency
            })
            setProfile(res.data.user)
            setProfileMessage({ type: 'success', text: 'Profile updated successfully!' })

            // Update local storage if email changed
            if (res.data.user.email !== user?.email) {
                const currentUser = tokenManager.getUser()
                if (currentUser) {
                    tokenManager.setTokens(
                        tokenManager.getAccessToken()!,
                        tokenManager.getRefreshToken()!,
                        { ...currentUser, email: res.data.user.email }
                    )
                }
            }
        } catch (error: any) {
            setProfileMessage({
                type: 'error',
                text: error.response?.data?.error || 'Failed to update profile'
            })
        } finally {
            setIsUpdating(false)
        }
    }

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault()
        setPasswordMessage(null)

        if (newPassword !== confirmPassword) {
            setPasswordMessage({ type: 'error', text: 'Passwords do not match' })
            return
        }

        if (newPassword.length < 6) {
            setPasswordMessage({ type: 'error', text: 'Password must be at least 6 characters' })
            return
        }

        setIsChangingPassword(true)

        try {
            await changePassword(currentPassword, newPassword)
            setPasswordMessage({ type: 'success', text: 'Password changed successfully!' })
            setCurrentPassword('')
            setNewPassword('')
            setConfirmPassword('')
        } catch (error: any) {
            setPasswordMessage({
                type: 'error',
                text: error.response?.data?.error || 'Failed to change password'
            })
        } finally {
            setIsChangingPassword(false)
        }
    }

    const handleRevokeSession = async (sessionId: string) => {
        try {
            await authApi.revokeSession(sessionId)
            setSessions(sessions.filter(s => s.id !== sessionId))
        } catch (error) {
            console.error('Failed to revoke session:', error)
        }
    }

    const handleDeleteAccount = async () => {
        if (!deletePassword) {
            setDeleteError('Password is required')
            return
        }

        setIsDeleting(true)
        setDeleteError('')

        try {
            await profileApi.delete(deletePassword)
            tokenManager.clearTokens()
            navigate('/login')
        } catch (error: any) {
            setDeleteError(error.response?.data?.error || 'Failed to delete account')
        } finally {
            setIsDeleting(false)
        }
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const countryCode = e.target.value
        setHomeCountry(countryCode)
        const defaultCurrency = getCurrencyForCountry(countryCode)
        if (defaultCurrency) {
            setCurrency(defaultCurrency)
        }
    }

    if (isLoadingProfile) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
            {/* Header */}
            <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center shadow-lg">
                    <User className="w-8 h-8 text-white" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-text-primary">Profile Settings</h1>
                    <p className="text-text-secondary">Manage your account and preferences</p>
                </div>
            </div>

            {/* Profile Info Card */}
            <div className="card p-6">
                <div className="flex items-center gap-3 mb-6">
                    <User className="w-5 h-5 text-secondary" />
                    <h2 className="text-xl font-semibold text-text-primary">Profile Information</h2>
                </div>

                <form onSubmit={handleUpdateProfile} className="space-y-4">
                    {profileMessage && (
                        <div className={`p-3 rounded-lg flex items-center gap-2 ${profileMessage.type === 'success'
                            ? 'bg-success/10 border border-success/30 text-success'
                            : 'bg-danger/10 border border-danger/30 text-danger'
                            }`}>
                            {profileMessage.type === 'success' ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                            {profileMessage.text}
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-text-primary mb-2">Name</label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="input-field pl-11"
                                    placeholder="Your name (optional)"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-text-primary mb-2">Email</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="input-field pl-11"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-text-primary mb-2">Home Country</label>
                            <div className="relative">
                                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                                <select
                                    value={homeCountry}
                                    onChange={handleCountryChange}
                                    className="input-field pl-11 appearance-none"
                                >
                                    <option value="">Select...</option>
                                    {COUNTRIES.map(c => (
                                        <option key={c.code} value={c.code}>{c.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-text-primary mb-2">Currency</label>
                            <div className="relative">
                                <Wallet className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                                <input
                                    type="text"
                                    value={currency}
                                    onChange={(e) => setCurrency(e.target.value)}
                                    className="input-field pl-11"
                                    placeholder="USD"
                                    maxLength={3}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                        <p className="text-sm text-text-secondary">
                            Member since {profile ? formatDate(profile.createdAt) : ''}
                            {profile && ` • ${profile.tripCount} trip${profile.tripCount !== 1 ? 's' : ''}`}
                        </p>
                        <button
                            type="submit"
                            disabled={isUpdating}
                            className="btn-primary flex items-center gap-2"
                        >
                            {isUpdating ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <Save className="w-4 h-4" />
                            )}
                            Save Changes
                        </button>
                    </div>
                </form>
            </div>

            {/* Change Password Card */}
            <div className="card p-6">
                <div className="flex items-center gap-3 mb-6">
                    <Lock className="w-5 h-5 text-secondary" />
                    <h2 className="text-xl font-semibold text-text-primary">Change Password</h2>
                </div>

                <form onSubmit={handleChangePassword} className="space-y-4">
                    {passwordMessage && (
                        <div className={`p-3 rounded-lg flex items-center gap-2 ${passwordMessage.type === 'success'
                            ? 'bg-success/10 border border-success/30 text-success'
                            : 'bg-danger/10 border border-danger/30 text-danger'
                            }`}>
                            {passwordMessage.type === 'success' ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                            {passwordMessage.text}
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-text-primary mb-2">Current Password</label>
                            <input
                                type="password"
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                className="input-field"
                                placeholder="••••••••"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-text-primary mb-2">New Password</label>
                            <input
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="input-field"
                                placeholder="••••••••"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-text-primary mb-2">Confirm Password</label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="input-field"
                                placeholder="••••••••"
                                required
                            />
                        </div>
                    </div>

                    <div className="flex justify-end pt-2">
                        <button
                            type="submit"
                            disabled={isChangingPassword}
                            className="btn-secondary flex items-center gap-2"
                        >
                            {isChangingPassword ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <Lock className="w-4 h-4" />
                            )}
                            Update Password
                        </button>
                    </div>
                </form>
            </div>

            {/* Active Sessions Card */}
            <div className="card p-6">
                <div className="flex items-center gap-3 mb-6">
                    <Shield className="w-5 h-5 text-secondary" />
                    <h2 className="text-xl font-semibold text-text-primary">Active Sessions</h2>
                </div>

                {isLoadingSessions ? (
                    <div className="flex justify-center py-8">
                        <Loader2 className="w-6 h-6 animate-spin text-secondary" />
                    </div>
                ) : sessions.length === 0 ? (
                    <p className="text-text-secondary text-center py-4">No active sessions</p>
                ) : (
                    <div className="space-y-3">
                        {sessions.map((session, index) => (
                            <div
                                key={session.id}
                                className="flex items-center justify-between p-4 rounded-lg bg-bg border border-slate-200"
                            >
                                <div className="flex items-center gap-3">
                                    <Monitor className="w-5 h-5 text-text-muted" />
                                    <div>
                                        <p className="text-sm font-medium text-text-primary">
                                            Session {index === 0 ? '(Current)' : ''}
                                        </p>
                                        <p className="text-xs text-text-secondary">
                                            Created: {formatDate(session.createdAt)}
                                        </p>
                                    </div>
                                </div>
                                {index !== 0 && (
                                    <button
                                        onClick={() => handleRevokeSession(session.id)}
                                        className="text-sm text-danger hover:text-danger/80 transition-colors"
                                    >
                                        Revoke
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Danger Zone Card */}
            <div className="card p-6 border-danger/30">
                <div className="flex items-center gap-3 mb-4">
                    <AlertTriangle className="w-5 h-5 text-danger" />
                    <h2 className="text-xl font-semibold text-danger">Danger Zone</h2>
                </div>

                <p className="text-text-secondary mb-4">
                    Once you delete your account, there is no going back. All your trips and data will be permanently deleted.
                </p>

                <button
                    onClick={() => setShowDeleteModal(true)}
                    className="px-4 py-2 rounded-lg bg-danger/10 border border-danger/30 text-danger font-medium hover:bg-danger/20 transition-all flex items-center gap-2"
                >
                    <Trash2 className="w-4 h-4" />
                    Delete Account
                </button>
            </div>

            {/* Delete Account Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 animate-fade-in">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 rounded-full bg-danger/10 flex items-center justify-center">
                                <AlertTriangle className="w-6 h-6 text-danger" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-text-primary">Delete Account</h3>
                                <p className="text-sm text-text-secondary">This action cannot be undone</p>
                            </div>
                        </div>

                        <p className="text-text-secondary mb-4">
                            Please enter your password to confirm account deletion. All your trips and data will be permanently removed.
                        </p>

                        {deleteError && (
                            <div className="p-3 rounded-lg bg-danger/10 border border-danger/30 text-danger text-sm mb-4">
                                {deleteError}
                            </div>
                        )}

                        <input
                            type="password"
                            value={deletePassword}
                            onChange={(e) => setDeletePassword(e.target.value)}
                            placeholder="Enter your password"
                            className="input-field mb-4"
                        />

                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setShowDeleteModal(false)
                                    setDeletePassword('')
                                    setDeleteError('')
                                }}
                                className="flex-1 px-4 py-2 rounded-lg border border-slate-200 text-text-primary font-medium hover:bg-slate-50 transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteAccount}
                                disabled={isDeleting}
                                className="flex-1 px-4 py-2 rounded-lg bg-danger text-white font-medium hover:bg-danger/90 transition-all flex items-center justify-center gap-2"
                            >
                                {isDeleting ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <Trash2 className="w-4 h-4" />
                                )}
                                Delete Forever
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
