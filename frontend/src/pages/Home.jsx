import { Link } from 'react-router-dom'
import { Camera, Cpu, BarChart3, ArrowRight, Sparkles, Flame, ChefHat } from 'lucide-react'
import CONFIG from '../utils/config'
import heroImg from '../assets/hero-food.png'
import './Home.css'

const features = [
    { icon: <Camera size={28} />, title: '1. ถ่ายภาพ', desc: 'ใช้กล้องเว็บแคมหรืออัปโหลดรูปอาหารไทย' },
    { icon: <Cpu size={28} />, title: '2. AI วิเคราะห์', desc: 'โมเดล AI วิเคราะห์ภาพและระบุชนิดอาหาร' },
    { icon: <BarChart3 size={28} />, title: '3. รับค่าโภชนาการ', desc: 'ดูรายละเอียดค่าโภชนาการและติดตามการกิน' },
]

const FOOD_EMOJIS = {
    'Pad Thai': '🍝',
    'Khao Pad': '🍚',
    'Tom Yum Goong': '🍲',
    'Green Curry': '🍛',
    'Massaman Curry': '🍛',
    'Som Tum': '🥗',
    'Mango Sticky Rice': '🥭',
    'Pad Krapow Moo': '🥘',
    'Kai Yang': '🍗',
    'Satay': '🥩',
    'Spring Rolls': '🥟',
    'Pla Tod': '🐟',
    'Khanom Jeen': '🍜',
    'Khao Kha Moo': '🍖',
}

const foods = Object.values(CONFIG.AI.THAI_FOOD_MAPPING)
    .filter((v, i, a) => a.findIndex(t => t.name === v.name) === i)
    .slice(0, 8)

export default function Home() {
    return (
        <div className="home-page">
            {/* Hero */}
            <section className="hero">
                <div className="hero-bg" />
                <div className="container hero-content">
                    <div className="hero-text">
                        <div className="hero-badge">
                            <Sparkles size={14} /> วิเคราะห์ด้วย AI
                        </div>
                        <h1>
                            วิเคราะห์อาหารไทย
                            <br />
                            ด้วย <span className="text-gradient">ปัญญาประดิษฐ์</span>
                        </h1>
                        <p className="hero-desc">
                            ถ่ายภาพหรืออัปโหลดรูปอาหารไทย แล้วรับผลวิเคราะห์โภชนาการทันที
                            ทั้งแคลอรี่ โปรตีน ไขมัน และคาร์โบไฮเดรต
                        </p>
                        <div className="hero-actions">
                            <Link to="/camera" className="btn btn-accent btn-lg">
                                <Camera size={20} /> เริ่มวิเคราะห์
                            </Link>
                            <a href="#features" className="btn btn-outline btn-lg">
                                เรียนรู้เพิ่มเติม <ArrowRight size={18} />
                            </a>
                        </div>
                        <div className="hero-stats">
                            <div className="hero-stat">
                                <ChefHat size={20} />
                                <span><strong>25+</strong> เมนูอาหาร</span>
                            </div>
                            <div className="hero-stat">
                                <Cpu size={20} />
                                <span><strong>AI</strong> ขับเคลื่อน</span>
                            </div>
                            <div className="hero-stat">
                                <Flame size={20} />
                                <span><strong>100%</strong> ฟรี</span>
                            </div>
                        </div>
                    </div>
                    <div className="hero-visual">
                        <div className="hero-img-wrapper">
                            <img
                                src={heroImg}
                                alt="Thai Food"
                                loading="lazy"
                            />
                            <div className="hero-img-glow" />
                        </div>
                    </div>
                </div>
            </section>

            {/* Features */}
            <section id="features" className="section">
                <div className="container">
                    <div className="section-header">
                        <h2>วิธีใช้งาน</h2>
                        <p className="text-secondary">3 ขั้นตอนง่ายๆ ในการวิเคราะห์อาหารไทย</p>
                    </div>
                    <div className="grid grid-3 features-grid">
                        {features.map((f, i) => (
                            <div key={i} className="feature-card glass-card">
                                <div className="feature-icon">{f.icon}</div>
                                <h3>{f.title}</h3>
                                <p className="text-secondary">{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Supported Foods */}
            <section className="section section-alt">
                <div className="container">
                    <div className="section-header">
                        <h2>เมนูอาหารที่รองรับ</h2>
                        <p className="text-secondary">AI ของเราสามารถจำแนกอาหารไทยยอดนิยมเหล่านี้ได้</p>
                    </div>
                    <div className="grid grid-4 foods-grid">
                        {foods.map((food, i) => (
                            <div key={i} className="food-card glass-card">
                                <div className="food-emoji">{FOOD_EMOJIS[food.name] || '🍽️'}</div>
                                <h4>{food.name}</h4>
                                <p className="food-name-th">{food.nameTh}</p>
                                <div className="food-cal">
                                    <Flame size={14} /> {food.calories} kcal
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="text-center mt-4">
                        <Link to="/camera" className="btn btn-primary btn-lg">
                            <Camera size={18} /> วิเคราะห์อาหารของคุณ
                        </Link>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="cta-section">
                <div className="container text-center">
                    <h2>พร้อมเริ่มติดตามแล้วหรือยัง?</h2>
                    <p className="text-secondary mt-1">เริ่มวิเคราะห์คุณค่าโภชนาการอาหารไทยได้เลย</p>
                    <Link to="/camera" className="btn btn-accent btn-lg mt-3">
                        เริ่มต้นใช้งาน <ArrowRight size={18} />
                    </Link>
                </div>
            </section>
        </div>
    )
}
