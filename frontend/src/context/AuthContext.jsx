import { createContext, useContext, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import CONFIG from '../utils/config'
import API from '../utils/api'
import { showToast } from '../utils/toast'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [token, setToken] = useState(null)
    const [loading, setLoading] = useState(true)

    // Load saved auth on mount
    useEffect(() => {
        const savedToken = localStorage.getItem(CONFIG.STORAGE.TOKEN)
        const savedUser = localStorage.getItem(CONFIG.STORAGE.USER)
        if (savedToken && savedUser) {
            setToken(savedToken)
            setUser(JSON.parse(savedUser))
        }
        setLoading(false)
    }, [])

    const login = async (email, password) => {
        const response = await API.post('/auth/login', { email, password })
        if (response.success) {
            const { user: u, token: t } = response.data
            setUser(u)
            setToken(t)
            localStorage.setItem(CONFIG.STORAGE.USER, JSON.stringify(u))
            localStorage.setItem(CONFIG.STORAGE.TOKEN, t)
            showToast('Login successful!', 'success')
            return true
        }
        throw new Error(response.message || 'Login failed')
    }

    const loginAsGuest = () => {
        const guestUser = { id: 'guest', username: 'Guest', email: 'guest@example.com' }
        setUser(guestUser)
        setToken('guest-token')
        localStorage.setItem(CONFIG.STORAGE.USER, JSON.stringify(guestUser))
        localStorage.setItem(CONFIG.STORAGE.TOKEN, 'guest-token')
        showToast('Continuing as guest', 'info')
    }

    const logout = () => {
        setUser(null)
        setToken(null)
        localStorage.removeItem(CONFIG.STORAGE.USER)
        localStorage.removeItem(CONFIG.STORAGE.TOKEN)
        showToast('Logged out', 'info')
    }

    const isLoggedIn = !!token

    return (
        <AuthContext.Provider value={{ user, token, isLoggedIn, loading, login, loginAsGuest, logout }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const ctx = useContext(AuthContext)
    if (!ctx) throw new Error('useAuth must be used within AuthProvider')
    return ctx
}
