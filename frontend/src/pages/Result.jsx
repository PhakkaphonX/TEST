import { useState, useEffect, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Flame, Beef, Droplets, Wheat, Camera, Save, ChevronRight, Loader2 } from 'lucide-react'
import CONFIG from '../utils/config'
import API from '../utils/api'
import { showToast } from '../utils/toast'
import { useAuth } from '../context/AuthContext'
import './Result.css'

export default function Result() {
    const navigate = useNavigate()
    const { isLoggedIn } = useAuth()
    const imgRef = useRef(null)

    const [imageData, setImageData] = useState(null)
    const [status, setStatus] = useState('loading') // loading | analyzing | done | error
    const [statusText, setStatusText] = useState('Loading image...')
    const [result, setResult] = useState(null)
    const [alternatives, setAlternatives] = useState([])
    const [saved, setSaved] = useState(false)

    // Load captured image
    useEffect(() => {
        const img = localStorage.getItem(CONFIG.STORAGE.CAPTURED_IMAGE)
        if (!img) {
            navigate('/camera')
            return
        }
        setImageData(img)
        setStatus('analyzing')
        setStatusText('Loading AI model...')
    }, [])

    // Run analysis when image is ready
    useEffect(() => {
        if (status !== 'analyzing' || !imageData) return
        analyzeImage()
    }, [status, imageData])

    async function analyzeImage() {
        try {
            setStatusText('Loading Teachable Machine model...')

            // Load Teachable Machine model
            const modelURL = '/tm-my-image-model/model.json'
            const metadataURL = '/tm-my-image-model/metadata.json'

            /* global tmImage */
            const model = await tmImage.load(modelURL, metadataURL)

            setStatusText('Analyzing food...')

            // Create image element for prediction
            const imgEl = document.createElement('img')
            imgEl.crossOrigin = 'anonymous'
            await new Promise((resolve, reject) => {
                imgEl.onload = resolve
                imgEl.onerror = reject
                imgEl.src = imageData
            })

            const predictions = await model.predict(imgEl)
            processPredictions(predictions)
        } catch (err) {
            console.error('Analysis error:', err)
            // Fallback to config-based detection
            fallbackAnalysis()
        }
    }

    function processPredictions(predictions) {
        const sorted = [...predictions].sort((a, b) => b.probability - a.probability)
        const topPrediction = sorted[0]
        const className = topPrediction.className.toLowerCase().trim()
        const confidence = (topPrediction.probability * 100).toFixed(1)

        // Check mapping
        let food = null
        for (const [key, value] of Object.entries(CONFIG.AI.THAI_FOOD_MAPPING)) {
            if (className.includes(key) || key.includes(className)) {
                food = value
                break
            }
        }

        if (!food) {
            // Try by class name directly
            food = { name: topPrediction.className, nameTh: '', ...CONFIG.AI.DEFAULT_FOOD }
            food.name = topPrediction.className
        }

        const mainResult = {
            name: food.name,
            nameTh: food.nameTh,
            confidence: parseFloat(confidence),
            calories: food.calories,
            protein: food.protein,
            fat: food.fat,
            carbs: food.carbs,
            sugar: food.sugar || 0,
        }

        // Alternatives
        const alts = sorted.slice(1, 4).map(p => {
            const cn = p.className.toLowerCase().trim()
            let altFood = CONFIG.AI.DEFAULT_FOOD
            for (const [key, val] of Object.entries(CONFIG.AI.THAI_FOOD_MAPPING)) {
                if (cn.includes(key) || key.includes(cn)) {
                    altFood = val
                    break
                }
            }
            return {
                name: altFood.name || p.className,
                nameTh: altFood.nameTh || '',
                confidence: (p.probability * 100).toFixed(1),
            }
        }).filter(a => parseFloat(a.confidence) > 1)

        setResult(mainResult)
        setAlternatives(alts)
        setStatus('done')
    }

    function fallbackAnalysis() {
        const food = CONFIG.AI.DEFAULT_FOOD
        setResult({
            name: food.name,
            nameTh: food.nameTh,
            confidence: 50,
            calories: food.calories,
            protein: food.protein,
            fat: food.fat,
            carbs: food.carbs,
            sugar: food.sugar || 0,
        })
        setAlternatives([])
        setStatus('done')
    }

    // Save log
    async function saveLog() {
        if (!result || saved) return
        const logEntry = {
            id: Date.now().toString(),
            foodName: result.name,
            foodNameTh: result.nameTh,
            confidence: result.confidence,
            calories: result.calories,
            protein: result.protein,
            fat: result.fat,
            carbs: result.carbs,
            sugar: result.sugar || 0,
            image: imageData,
            date: new Date().toISOString(),
        }

        // Save to localStorage
        const history = JSON.parse(localStorage.getItem('foodHistory') || '[]')
        history.unshift(logEntry)
        localStorage.setItem('foodHistory', JSON.stringify(history))

        // Try API
        if (isLoggedIn) {
            try {
                await API.post('/logs', logEntry)
            } catch (e) {
                // silently fall back to localStorage
            }
        }

        setSaved(true)
        showToast('Food log saved!', 'success')
    }

    if (status === 'loading' || status === 'analyzing') {
        return (
            <div className="result-page">
                <div className="container">
                    <div className="loading-state glass-card">
                        <Loader2 size={40} className="spin-icon" />
                        <h3>{statusText}</h3>
                        <p className="text-secondary">กรุณารอสักครู่ขณะวิเคราะห์อาหาร...</p>
                    </div>
                </div>
            </div>
        )
    }

    if (status === 'error') {
        return (
            <div className="result-page">
                <div className="container">
                    <div className="loading-state glass-card">
                        <h3>วิเคราะห์ไม่สำเร็จ</h3>
                        <p className="text-secondary">เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง</p>
                        <Link to="/camera" className="btn btn-accent mt-2">
                            <Camera size={18} /> ลองใหม่
                        </Link>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="result-page">
            <div className="container">
                <div className="page-header">
                    <h2>ผลการวิเคราะห์</h2>
                    <p className="text-secondary">AI ระบุอาหารของคุณแล้ว</p>
                </div>

                <div className="result-layout">
                    {/* Image & Food name */}
                    <div className="result-image-section glass-card">
                        <img ref={imgRef} src={imageData} alt="Food" className="result-img" />
                        <div className="result-food-name">
                            <h2>{result?.name}</h2>
                            {result?.nameTh && <p className="food-th">{result.nameTh}</p>}
                            <div className="confidence-badge">
                                {result?.confidence}% confidence
                            </div>
                        </div>
                    </div>

                    {/* Nutrition */}
                    <div className="result-details">
                        <div className="nutrition-grid">
                            <div className="nutrition-card glass-card cal-card">
                                <div className="nut-icon cal-icon"><Flame size={22} /></div>
                                <div className="nut-value">{result?.calories}</div>
                                <div className="nut-label">แคลอรี่</div>
                                <div className="nut-unit">kcal</div>
                            </div>
                            <div className="nutrition-card glass-card protein-card">
                                <div className="nut-icon protein-icon"><Beef size={22} /></div>
                                <div className="nut-value">{result?.protein}</div>
                                <div className="nut-label">โปรตีน</div>
                                <div className="nut-unit">g</div>
                            </div>
                            <div className="nutrition-card glass-card fat-card">
                                <div className="nut-icon fat-icon"><Droplets size={22} /></div>
                                <div className="nut-value">{result?.fat}</div>
                                <div className="nut-label">ไขมัน</div>
                                <div className="nut-unit">g</div>
                            </div>
                            <div className="nutrition-card glass-card carb-card">
                                <div className="nut-icon carb-icon"><Wheat size={22} /></div>
                                <div className="nut-value">{result?.carbs}</div>
                                <div className="nut-label">คาร์โบไฮเดรต</div>
                                <div className="nut-unit">g</div>
                            </div>
                        </div>

                        {/* Alternatives */}
                        {alternatives.length > 0 && (
                            <div className="alternatives-section glass-card">
                                <h4>ผลลัพธ์อื่นที่เป็นไปได้</h4>
                                {alternatives.map((alt, i) => (
                                    <div key={i} className="alt-item">
                                        <div>
                                            <span className="alt-name">{alt.name}</span>
                                            {alt.nameTh && <span className="alt-th">{alt.nameTh}</span>}
                                        </div>
                                        <span className="alt-conf">{alt.confidence}%</span>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Actions */}
                        <div className="result-actions">
                            <button className="btn btn-accent btn-lg" onClick={saveLog} disabled={saved}>
                                <Save size={18} /> {saved ? 'บันทึกแล้ว ✓' : 'บันทึกรายการ'}
                            </button>
                            <Link to="/camera" className="btn btn-outline">
                                <Camera size={18} /> วิเคราะห์อีกครั้ง
                            </Link>
                            <Link to="/dashboard" className="btn btn-ghost">
                                แดชบอร์ด <ChevronRight size={16} />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
