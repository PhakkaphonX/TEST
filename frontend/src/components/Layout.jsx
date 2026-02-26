import { Outlet, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import Navbar from './Navbar'
import Footer from './Footer'

export default function Layout() {
    const location = useLocation()

    // Scroll to top on route change
    useEffect(() => {
        window.scrollTo(0, 0)
    }, [location.pathname])

    const isHome = location.pathname === '/'

    return (
        <>
            <Navbar />
            <main className="page-enter" key={location.pathname} style={{ paddingTop: isHome ? 0 : '80px', flex: 1 }}>
                <Outlet />
            </main>
            <Footer />
        </>
    )
}
