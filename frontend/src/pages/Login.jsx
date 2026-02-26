import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LogIn, Eye, EyeOff, UserCheck } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { showToast } from '../utils/toast'
import './Login.css'

export default function Login() {
    const navigate = useNavigate()
    const { login, loginAsGuest } = useAuth()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPw, setShowPw] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!email || !password) {
            setError('กรุณากรอกอีเมลและรหัสผ่าน')
            return
        }
        setLoading(true)
        setError('')
        try {
            await login(email, password)
            navigate('/')
        } catch (err) {
            setError(err.message || 'อีเมลหรือรหัสผ่านไม่ถูกต้อง')
        } finally {
            setLoading(false)
        }
    }

    const handleGuest = () => {
        loginAsGuest()
        navigate('/camera')
    }

    return (
        <div className="login-page">
            <div className="login-card glass-card">
                <div className="login-header">
                    <div className="login-icon-wrap">
                        <LogIn size={28} />
                    </div>
                    <h2>ยินดีต้อนรับ</h2>
                    <p className="text-secondary">เข้าสู่ระบบบัญชีของคุณ</p>
                </div>

                {error && (
                    <div className="error-box">{error}</div>
                )}

                <form onSubmit={handleSubmit} className="login-form">
                    <div className="form-group">
                        <label htmlFor="email">อีเมล</label>
                        <input
                            id="email"
                            type="email"
                            className="input"
                            placeholder="กรอกอีเมลของคุณ"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="password">รหัสผ่าน</label>
                        <div className="input-pw-wrap">
                            <input
                                id="password"
                                type={showPw ? 'text' : 'password'}
                                className="input"
                                placeholder="กรอกรหัสผ่านของคุณ"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            <button type="button" className="pw-toggle" onClick={() => setShowPw(!showPw)}>
                                {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    <button type="submit" className="btn btn-accent btn-lg w-full" disabled={loading}>
                        {loading ? <div className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }} /> : <><LogIn size={18} /> เข้าสู่ระบบ</>}
                    </button>
                </form>

                <div className="login-divider">
                    <span>or</span>
                </div>

                <button className="btn btn-outline w-full" onClick={handleGuest}>
                    <UserCheck size={18} /> ใช้งานแบบบุคคลทั่วไป
                </button>
            </div>
        </div>
    )
}
