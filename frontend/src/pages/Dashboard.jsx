import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { Flame, UtensilsCrossed, CalendarDays, TrendingUp, Heart, Camera, Clock } from 'lucide-react'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend } from 'chart.js'
import { Bar, Doughnut } from 'react-chartjs-2'
import { useAuth } from '../context/AuthContext'
import API from '../utils/api'
import { formatRelativeTime } from '../utils/helpers'
import './Dashboard.css'

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend)

export default function Dashboard() {
    const { isLoggedIn } = useAuth()
    const [loading, setLoading] = useState(true)
    const [data, setData] = useState(null)

    useEffect(() => {
        loadData()
    }, [])

    async function loadData() {
        setLoading(true)
        try {
            // Try API first
            if (isLoggedIn) {
                try {
                    const res = await API.get('/logs/dashboard')
                    if (res.success) { setData(res.data); setLoading(false); return }
                } catch (e) { /* fall through */ }
            }
            // Fallback to localStorage
            loadFromLocalStorage()
        } catch (e) {
            loadFromLocalStorage()
        }
    }

    function loadFromLocalStorage() {
        const history = JSON.parse(localStorage.getItem('foodHistory') || '[]')
        if (history.length === 0) {
            setData(null)
            setLoading(false)
            return
        }

        const now = new Date()
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        const weekAgo = new Date(todayStart)
        weekAgo.setDate(weekAgo.getDate() - 7)

        const todayLogs = history.filter(h => new Date(h.date) >= todayStart)
        const weekLogs = history.filter(h => new Date(h.date) >= weekAgo)

        const todayCalories = todayLogs.reduce((sum, l) => sum + (l.calories || 0), 0)
        const weeklyCalories = weekLogs.reduce((sum, l) => sum + (l.calories || 0), 0)

        // Daily data for chart
        const dailyData = []
        const dayLabels = ['อา.', 'จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.']
        for (let i = 6; i >= 0; i--) {
            const d = new Date(todayStart)
            d.setDate(d.getDate() - i)
            const dEnd = new Date(d)
            dEnd.setDate(dEnd.getDate() + 1)
            const dayLogs = history.filter(h => {
                const hd = new Date(h.date)
                return hd >= d && hd < dEnd
            })
            dailyData.push({
                day: dayLabels[d.getDay()],
                calories: dayLogs.reduce((sum, l) => sum + (l.calories || 0), 0),
            })
        }

        // Today's nutrition
        const todayProtein = todayLogs.reduce((sum, l) => sum + (l.protein || 0), 0)
        const todayFat = todayLogs.reduce((sum, l) => sum + (l.fat || 0), 0)
        const todayCarbs = todayLogs.reduce((sum, l) => sum + (l.carbs || 0), 0)

        setData({
            todayCalories,
            mealsToday: todayLogs.length,
            weeklyCalories,
            avgDaily: weekLogs.length > 0 ? Math.round(weeklyCalories / 7) : 0,
            dailyData,
            todayNutrition: { protein: todayProtein, fat: todayFat, carbs: todayCarbs },
            recentLogs: history.slice(0, 5),
        })
        setLoading(false)
    }

    if (loading) {
        return (
            <div className="dashboard-page">
                <div className="container">
                    <div className="loading-state glass-card">
                        <div className="spinner" />
                        <p className="text-secondary">กำลังโหลดแดชบอร์ด...</p>
                    </div>
                </div>
            </div>
        )
    }

    if (!isLoggedIn && !data) {
        return (
            <div className="dashboard-page">
                <div className="container">
                    <div className="empty-state glass-card">
                        <Camera size={48} className="text-muted" />
                        <h3>ยังไม่มีข้อมูล</h3>
                        <p className="text-secondary">เริ่มวิเคราะห์อาหารไทยเพื่อดูแดชบอร์ด</p>
                        <Link to="/camera" className="btn btn-accent mt-2">
                            <Camera size={18} /> วิเคราะห์อาหาร
                        </Link>
                    </div>
                </div>
            </div>
        )
    }

    if (!data) {
        return (
            <div className="dashboard-page">
                <div className="container">
                    <div className="empty-state glass-card">
                        <Camera size={48} className="text-muted" />
                        <h3>ยังไม่มีข้อมูล</h3>
                        <p className="text-secondary">เริ่มวิเคราะห์อาหารไทยเพื่อดูแดชบอร์ด</p>
                        <Link to="/camera" className="btn btn-accent mt-2">
                            <Camera size={18} /> วิเคราะห์อาหาร
                        </Link>
                    </div>
                </div>
            </div>
        )
    }

    const weeklyChartData = {
        labels: data.dailyData.map(d => d.day),
        datasets: [{
            label: 'แคลอรี่',
            data: data.dailyData.map(d => d.calories),
            backgroundColor: 'rgba(232, 93, 38, 0.7)',
            borderColor: '#E85D26',
            borderWidth: 2,
            borderRadius: 8,
            borderSkipped: false,
        }],
    }

    const nutritionChartData = {
        labels: ['โปรตีน', 'ไขมัน', 'คาร์โบไฮเดรต'],
        datasets: [{
            data: [data.todayNutrition.protein, data.todayNutrition.fat, data.todayNutrition.carbs],
            backgroundColor: ['rgba(192, 57, 43, 0.8)', 'rgba(212, 168, 67, 0.8)', 'rgba(45, 80, 22, 0.8)'],
            borderWidth: 0,
        }],
    }

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
        },
        scales: {
            x: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: 'var(--text-muted)' } },
            y: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: 'var(--text-muted)' } },
        },
    }

    const doughnutOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { position: 'bottom', labels: { color: 'var(--text-secondary)', padding: 16 } },
        },
    }

    // Health status
    let healthStatus = { label: 'ดี', color: 'success', message: 'ปริมาณแคลอรี่ของคุณอยู่ในช่วงที่เหมาะสม' }
    if (data.todayCalories > 2500) {
        healthStatus = { label: 'สูง', color: 'warning', message: 'ปริมาณแคลอรี่ของคุณสูงกว่าปริมาณที่แนะนำต่อวัน' }
    }
    if (data.todayCalories > 3500) {
        healthStatus = { label: 'สูงมาก', color: 'danger', message: 'ปริมาณแคลอรี่ของคุณสูงเกินปริมาณที่แนะนำมาก' }
    }

    const stats = [
        { icon: <Flame size={22} />, label: 'แคลอรี่วันนี้', value: data.todayCalories, unit: 'kcal', className: 'stat-cal' },
        { icon: <UtensilsCrossed size={22} />, label: 'มื้ออาหารวันนี้', value: data.mealsToday, unit: 'มื้อ', className: 'stat-meals' },
        { icon: <CalendarDays size={22} />, label: 'รวมรายสัปดาห์', value: data.weeklyCalories, unit: 'kcal', className: 'stat-weekly' },
        { icon: <TrendingUp size={22} />, label: 'เฉลี่ยต่อวัน', value: data.avgDaily, unit: 'kcal', className: 'stat-avg' },
    ]

    return (
        <div className="dashboard-page">
            <div className="container">
                <div className="page-header flex justify-between items-center">
                    <div>
                        <h2>แดชบอร์ด</h2>
                        <p className="text-secondary">ติดตามโภชนาการและความคืบหน้า</p>
                    </div>
                    <Link to="/camera" className="btn btn-accent">
                        <Camera size={18} /> วิเคราะห์ใหม่
                    </Link>
                </div>

                {/* Stats */}
                <div className="grid grid-4 mb-3">
                    {stats.map((s, i) => (
                        <div key={i} className={`stat-card glass-card ${s.className}`}>
                            <div className="stat-icon-wrap">{s.icon}</div>
                            <div>
                                <div className="stat-label">{s.label}</div>
                                <div className="stat-value">{s.value}</div>
                                <div className="stat-unit">{s.unit}</div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Charts */}
                <div className="charts-row mb-3">
                    <div className="chart-card glass-card">
                        <h4>แคลอรี่รายสัปดาห์</h4>
                        <div className="chart-wrapper">
                            <Bar data={weeklyChartData} options={chartOptions} />
                        </div>
                    </div>
                    <div className="chart-card chart-small glass-card">
                        <h4>สัดส่วนโภชนาการ</h4>
                        <div className="chart-wrapper">
                            <Doughnut data={nutritionChartData} options={doughnutOptions} />
                        </div>
                    </div>
                </div>

                {/* Health + Recent */}
                <div className="charts-row">
                    <div className="glass-card p-3">
                        <h4 className="flex items-center gap-1 mb-2">
                            <Heart size={18} /> สถานะสุขภาพ
                        </h4>
                        <div className={`health-badge badge-${healthStatus.color}`}>
                            {healthStatus.label}
                        </div>
                        <p className="text-secondary text-sm mt-1">{healthStatus.message}</p>
                    </div>

                    <div className="glass-card p-3">
                        <div className="flex justify-between items-center mb-2">
                            <h4 className="flex items-center gap-1">
                                <Clock size={18} /> ล่าสุด
                            </h4>
                            <Link to="/history" className="btn btn-ghost btn-sm">ดูทั้งหมด</Link>
                        </div>
                        {data.recentLogs.length === 0 ? (
                            <p className="text-muted text-sm">ยังไม่มีรายการล่าสุด</p>
                        ) : (
                            <div className="recent-list">
                                {data.recentLogs.map((log, i) => (
                                    <div key={i} className="recent-item">
                                        <div>
                                            <span className="font-medium">{log.foodName}</span>
                                            <span className="text-muted text-sm"> · {formatRelativeTime(log.date)}</span>
                                        </div>
                                        <span className="text-accent font-semibold">{log.calories} kcal</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
