import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Trash2, Download, Search, Camera, Clock, ChevronLeft, ChevronRight } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import API from '../utils/api'
import { formatDate } from '../utils/helpers'
import { showToast } from '../utils/toast'
import './History.css'

const ITEMS_PER_PAGE = 10

export default function History() {
    const { isLoggedIn } = useAuth()
    const [logs, setLogs] = useState([])
    const [filtered, setFiltered] = useState([])
    const [loading, setLoading] = useState(true)
    const [page, setPage] = useState(1)
    const [search, setSearch] = useState('')
    const [sort, setSort] = useState('newest')
    const [deleteId, setDeleteId] = useState(null)

    useEffect(() => { loadHistory() }, [])

    async function loadHistory() {
        setLoading(true)
        try {
            if (isLoggedIn) {
                try {
                    const res = await API.get('/logs')
                    if (res.success && res.data.length > 0) {
                        setLogs(res.data)
                        setFiltered(res.data)
                        setLoading(false)
                        return
                    }
                } catch (e) { /* fall through */ }
            }
            loadFromLocalStorage()
        } catch (e) {
            loadFromLocalStorage()
        }
    }

    function loadFromLocalStorage() {
        const history = JSON.parse(localStorage.getItem('foodHistory') || '[]')
        setLogs(history)
        setFiltered(history)
        setLoading(false)
    }

    // Filter & sort
    useEffect(() => {
        let result = [...logs]
        if (search) {
            const s = search.toLowerCase()
            result = result.filter(l => (l.foodName || '').toLowerCase().includes(s) || (l.foodNameTh || '').toLowerCase().includes(s))
        }
        if (sort === 'newest') result.sort((a, b) => new Date(b.date) - new Date(a.date))
        else if (sort === 'oldest') result.sort((a, b) => new Date(a.date) - new Date(b.date))
        else if (sort === 'calories-high') result.sort((a, b) => (b.calories || 0) - (a.calories || 0))
        else if (sort === 'calories-low') result.sort((a, b) => (a.calories || 0) - (b.calories || 0))
        setFiltered(result)
        setPage(1)
    }, [search, sort, logs])

    // Pagination
    const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE)
    const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE)

    // Delete
    async function confirmDelete() {
        if (!deleteId) return
        try {
            if (isLoggedIn) {
                try { await API.delete(`/logs/${deleteId}`) } catch (e) { /* silent */ }
            }
            const updated = logs.filter(l => l.id !== deleteId)
            setLogs(updated)
            localStorage.setItem('foodHistory', JSON.stringify(updated))
            showToast('Log deleted', 'info')
        } catch (e) {
            showToast('Failed to delete', 'error')
        }
        setDeleteId(null)
    }

    // Export CSV
    function exportCSV() {
        if (filtered.length === 0) return
        const headers = 'วันที่,อาหาร,แคลอรี่,โปรตีน,ไขมัน,คาร์โบไฮเดรต\n'
        const rows = filtered.map(l =>
            `"${formatDate(l.date)}","${l.foodName}",${l.calories},${l.protein},${l.fat},${l.carbs}`
        ).join('\n')
        const blob = new Blob([headers + rows], { type: 'text/csv' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'food_history.csv'
        a.click()
        URL.revokeObjectURL(url)
        showToast('ส่งออก CSV แล้ว!', 'success')
    }

    if (loading) {
        return (
            <div className="history-page">
                <div className="container">
                    <div className="loading-state glass-card">
                        <div className="spinner" />
                        <p className="text-secondary">กำลังโหลดประวัติ...</p>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="history-page">
            <div className="container">
                <div className="page-header flex justify-between items-center">
                    <div>
                        <h2>ประวัติอาหาร</h2>
                        <p className="text-secondary">{filtered.length} รายการ</p>
                    </div>
                    <div className="flex gap-1">
                        <button className="btn btn-outline btn-sm" onClick={exportCSV} disabled={filtered.length === 0}>
                            <Download size={16} /> ส่งออก
                        </button>
                        <Link to="/camera" className="btn btn-accent btn-sm">
                            <Camera size={16} /> ใหม่
                        </Link>
                    </div>
                </div>

                {/* Filters */}
                <div className="filters glass-card">
                    <div className="search-wrap">
                        <Search size={18} className="search-icon" />
                        <input
                            type="text"
                            className="input search-input"
                            placeholder="ค้นหาอาหาร..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <select className="input sort-select" value={sort} onChange={(e) => setSort(e.target.value)}>
                        <option value="newest">ล่าสุดก่อน</option>
                        <option value="oldest">เก่าสุดก่อน</option>
                        <option value="calories-high">แคลอรี่สูงสุด</option>
                        <option value="calories-low">แคลอรี่ต่ำสุด</option>
                    </select>
                </div>

                {/* Table */}
                {filtered.length === 0 ? (
                    <div className="empty-state glass-card">
                        <Clock size={48} className="text-muted" />
                        <h3>ไม่พบประวัติ</h3>
                        <p className="text-secondary">เริ่มวิเคราะห์อาหารเพื่อสร้างประวัติ</p>
                        <Link to="/camera" className="btn btn-accent mt-2">
                            <Camera size={18} /> วิเคราะห์อาหาร
                        </Link>
                    </div>
                ) : (
                    <>
                        <div className="history-table glass-card">
                            <div className="table-header">
                                <span className="th-img">รูป</span>
                                <span className="th-food">อาหาร</span>
                                <span className="th-cal">แคลอรี่</span>
                                <span className="th-prot">โปรตีน</span>
                                <span className="th-fat">ไขมัน</span>
                                <span className="th-carb">คาร์โบฯ</span>
                                <span className="th-date">วันที่</span>
                                <span className="th-action"></span>
                            </div>
                            {paginated.map((log) => (
                                <div key={log.id} className="table-row">
                                    <span className="td-img">
                                        {log.image ? (
                                            <img src={log.image} alt={log.foodName} className="log-thumb" />
                                        ) : (
                                            <div className="log-thumb-placeholder">🍜</div>
                                        )}
                                    </span>
                                    <span className="td-food">
                                        <span className="font-medium">{log.foodName}</span>
                                        {log.foodNameTh && <span className="text-muted text-xs">{log.foodNameTh}</span>}
                                    </span>
                                    <span className="td-cal text-accent font-semibold">{log.calories}</span>
                                    <span className="td-prot">{log.protein}g</span>
                                    <span className="td-fat">{log.fat}g</span>
                                    <span className="td-carb">{log.carbs}g</span>
                                    <span className="td-date text-muted text-sm">{formatDate(log.date)}</span>
                                    <span className="td-action">
                                        <button className="btn btn-ghost btn-sm" onClick={() => setDeleteId(log.id)}>
                                            <Trash2 size={16} />
                                        </button>
                                    </span>
                                </div>
                            ))}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="pagination">
                                <button className="btn btn-ghost btn-sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>
                                    <ChevronLeft size={16} />
                                </button>
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                                    <button
                                        key={p}
                                        className={`btn btn-sm ${p === page ? 'btn-accent' : 'btn-ghost'}`}
                                        onClick={() => setPage(p)}
                                    >
                                        {p}
                                    </button>
                                ))}
                                <button className="btn btn-ghost btn-sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
                                    <ChevronRight size={16} />
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Delete Modal */}
            {deleteId && (
                <div className="modal-overlay" onClick={() => setDeleteId(null)}>
                    <div className="modal-card glass-card" onClick={(e) => e.stopPropagation()}>
                        <h3>ลบรายการ?</h3>
                        <p className="text-secondary">การดำเนินการนี้ไม่สามารถย้อนกลับได้</p>
                        <div className="modal-actions">
                            <button className="btn btn-outline" onClick={() => setDeleteId(null)}>ยกเลิก</button>
                            <button className="btn btn-danger" onClick={confirmDelete}>ลบ</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
