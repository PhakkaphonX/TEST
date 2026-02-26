import { UtensilsCrossed } from 'lucide-react'
import './Footer.css'

export default function Footer() {
    return (
        <footer className="footer">
            <div className="container footer-inner">
                <div className="footer-brand">
                    <UtensilsCrossed size={20} />
                    <span className="footer-name">ThaiFood AI</span>
                    <span className="footer-desc">วิเคราะห์โภชนาการด้วย AI</span>
                </div>
                <p className="footer-copy">© 2024 Thai Food Analysis. สงวนลิขสิทธิ์ทั้งหมด</p>
            </div>
        </footer>
    )
}
