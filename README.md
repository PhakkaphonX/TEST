# 🍜 Thai Food Analysis — AI-Powered Nutrition

ระบบวิเคราะห์อาหารไทยและคำนวณโภชนาการด้วย AI (Teachable Machine + TensorFlow.js)

> **Live Demo**: [https://test-1-bqv1.onrender.com](https://test-1-bqv1.onrender.com)

## ✨ Features

- 📸 **ถ่ายภาพ / อัปโหลดรูป** — วิเคราะห์อาหารไทยจากกล้องหรือไฟล์ภาพ
- 🤖 **AI วิเคราะห์** — Teachable Machine + TensorFlow.js จำแนกชนิดอาหาร 25+ เมนู
- 🔥 **ค่าโภชนาการ** — แคลอรี่, โปรตีน, ไขมัน, คาร์โบไฮเดรต
- 📊 **แดชบอร์ด** — กราฟแคลอรี่รายสัปดาห์, สัดส่วนโภชนาการ, สถานะสุขภาพ
- 📋 **ประวัติอาหาร** — ค้นหา, เรียงลำดับ, ส่งออก CSV
- 🔐 **ระบบสมาชิก** — เข้าสู่ระบบ / ใช้งานแบบ Guest
- 📱 **Responsive** — ใช้งานได้ทั้ง Desktop และ Mobile

## 🛠️ Technology Stack

### Frontend (React)
- **React 18** + React Router v6
- **Vite** — Build tool
- **Chart.js** + react-chartjs-2 — กราฟและแผนภูมิ
- **Lucide React** — ไอคอน
- **TensorFlow.js** + Teachable Machine — AI classification
- **CSS** — Dark Glassmorphism theme

### Backend (Node.js)
- **Express.js** — REST API
- **MySQL** — ฐานข้อมูล
- **JWT** — Authentication
- **Multer** — อัปโหลดรูปภาพ

## 📁 Project Structure

```
thai-food-analysis/
├── frontend/                  # React Frontend (Vite)
│   ├── index.html             # Entry HTML
│   ├── package.json
│   ├── vite.config.js         # Vite config + proxy
│   └── src/
│       ├── main.jsx           # React entry point
│       ├── App.jsx            # Router setup
│       ├── index.css          # Global styles (dark theme)
│       ├── assets/            # Images
│       ├── components/        # Navbar, Footer, Layout
│       ├── context/           # AuthContext
│       ├── pages/             # Home, Camera, Result,
│       │                        Dashboard, History, Login
│       └── utils/             # config, api, helpers, toast
├── backend/
│   ├── server.js              # Express server
│   ├── routes/                # API routes
│   ├── controllers/           # Business logic
│   ├── models/                # Database models
│   └── middleware/            # Auth middleware
├── tm-my-image-model/         # Teachable Machine model
│   ├── model.json
│   ├── metadata.json
│   └── weights.bin
└── database/
    └── schema.sql             # MySQL schema
```

## 🚀 Quick Start

### Prerequisites
- Node.js v16+
- MySQL v5.7+

### 1. Clone & Install

```bash
git clone https://github.com/PhakkaphonX/TEST.git
cd TEST

# Install backend
cd backend && npm install

# Install frontend
cd ../frontend && npm install
```

### 2. Setup Database

```bash
mysql -u root -p < database/schema.sql
```

### 3. Configure Backend

```bash
cd backend
cp .env.example .env
# แก้ไข .env ใส่ข้อมูล MySQL ของคุณ
```

### 4. Run Development

```bash
# Terminal 1 — Backend (port 3000)
cd backend && npm start

# Terminal 2 — Frontend (port 5173)
cd frontend && npm run dev
```

เปิด **http://localhost:5173** ในเบราว์เซอร์

### 5. Build for Production

```bash
cd frontend && npm run build
```

Backend จะเสิร์ฟไฟล์จาก `frontend/dist/` อัตโนมัติ

## 🌐 Deploy on Render

| Setting | Value |
|---------|-------|
| **Build Command** | `cd backend && npm install && cd ../frontend && npm install && npm run build` |
| **Start Command** | `cd backend && node server.js` |

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | สมัครสมาชิก |
| POST | `/api/auth/login` | เข้าสู่ระบบ |
| GET | `/api/foods` | รายการอาหารทั้งหมด |
| GET | `/api/foods/nutrition/:name` | ข้อมูลโภชนาการ |
| POST | `/api/logs` | บันทึกรายการอาหาร |
| GET | `/api/logs` | ดูประวัติอาหาร |
| GET | `/api/logs/dashboard` | ข้อมูลแดชบอร์ด |
| DELETE | `/api/logs/:id` | ลบรายการ |
| POST | `/api/upload/image` | อัปโหลดรูปภาพ |

## 🎨 Screenshots

| หน้าหลัก | กล้อง / อัปโหลด |
|:---------:|:---------------:|
| Dark Glassmorphism Theme | ถ่ายภาพ + Drag & Drop |

| ผลวิเคราะห์ | แดชบอร์ด |
|:----------:|:--------:|
| AI + ค่าโภชนาการ | กราฟ + สถานะสุขภาพ |

## 📄 License

MIT License

---

**🍛 สนุกกับการวิเคราะห์อาหารไทยด้วย AI!**
