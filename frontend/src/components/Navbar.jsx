import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { UtensilsCrossed, Camera, BarChart3, History, LogIn, LogOut, User, Menu, X } from 'lucide-react'
import { useState } from 'react'
import './Navbar.css'

export default function Navbar() {
    const { isLoggedIn, user, logout } = useAuth()
    const navigate = useNavigate()
    const [menuOpen, setMenuOpen] = useState(false)
    const [dropdownOpen, setDropdownOpen] = useState(false)

    const handleLogout = () => {
        logout()
        setDropdownOpen(false)
        navigate('/')
    }

    const navLinks = [
        { to: '/', label: 'หน้าหลัก', icon: <UtensilsCrossed size={18} /> },
        { to: '/camera', label: 'กล้อง', icon: <Camera size={18} /> },
        { to: '/dashboard', label: 'แดชบอร์ด', icon: <BarChart3 size={18} /> },
        { to: '/history', label: 'ประวัติ', icon: <History size={18} /> },
    ]

    return (
        <nav className="navbar">
            <div className="container navbar-inner">
                <NavLink to="/" className="navbar-brand" onClick={() => setMenuOpen(false)}>
                    <UtensilsCrossed size={24} className="brand-icon" />
                    <span>ThaiFood AI</span>
                </NavLink>

                <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)}>
                    {menuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>

                <div className={`navbar-menu ${menuOpen ? 'open' : ''}`}>
                    <div className="nav-links">
                        {navLinks.map(link => (
                            <NavLink
                                key={link.to}
                                to={link.to}
                                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                                onClick={() => setMenuOpen(false)}
                                end={link.to === '/'}
                            >
                                {link.icon}
                                <span>{link.label}</span>
                            </NavLink>
                        ))}
                    </div>

                    <div className="nav-auth">
                        {isLoggedIn ? (
                            <div className="user-dropdown">
                                <button className="user-btn" onClick={() => setDropdownOpen(!dropdownOpen)}>
                                    <User size={18} />
                                    <span>{user?.username || 'User'}</span>
                                </button>
                                {dropdownOpen && (
                                    <div className="dropdown-menu">
                                        <NavLink to="/dashboard" className="dropdown-item" onClick={() => { setDropdownOpen(false); setMenuOpen(false); }}>
                                            <BarChart3 size={16} /> แดชบอร์ด
                                        </NavLink>
                                        <NavLink to="/history" className="dropdown-item" onClick={() => { setDropdownOpen(false); setMenuOpen(false); }}>
                                            <History size={16} /> ประวัติ
                                        </NavLink>
                                        <hr className="dropdown-divider" />
                                        <button className="dropdown-item danger" onClick={handleLogout}>
                                            <LogOut size={16} /> ออกจากระบบ
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <NavLink to="/login" className="btn btn-outline btn-sm" onClick={() => setMenuOpen(false)}>
                                <LogIn size={16} /> เข้าสู่ระบบ
                            </NavLink>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    )
}
