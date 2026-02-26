import { useState, useRef, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Camera as CameraIcon, Upload, SwitchCamera, X, Zap, ImageIcon } from 'lucide-react'
import { imageToBase64, compressImage } from '../utils/helpers'
import CONFIG from '../utils/config'
import { showToast } from '../utils/toast'
import './Camera.css'

export default function Camera() {
    const navigate = useNavigate()
    const videoRef = useRef(null)
    const canvasRef = useRef(null)
    const fileInputRef = useRef(null)

    const [stream, setStream] = useState(null)
    const [cameraActive, setCameraActive] = useState(false)
    const [preview, setPreview] = useState(null)
    const [facingMode, setFacingMode] = useState('environment')
    const [dragOver, setDragOver] = useState(false)

    // Start camera
    const startCamera = useCallback(async () => {
        try {
            if (stream) {
                stream.getTracks().forEach(t => t.stop())
            }
            const constraints = {
                video: {
                    facingMode,
                    width: { ideal: 1280 },
                    height: { ideal: 960 },
                },
            }
            const mediaStream = await navigator.mediaDevices.getUserMedia(constraints)
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream
            }
            setStream(mediaStream)
            setCameraActive(true)
        } catch (err) {
            console.error('Camera error:', err)
            showToast('Cannot access camera. Please use file upload.', 'error')
        }
    }, [facingMode])

    // Stop camera
    const stopCamera = useCallback(() => {
        if (stream) {
            stream.getTracks().forEach(t => t.stop())
            setStream(null)
        }
        setCameraActive(false)
    }, [stream])

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (stream) stream.getTracks().forEach(t => t.stop())
        }
    }, [stream])

    // Switch camera
    const switchCamera = () => {
        setFacingMode(prev => (prev === 'environment' ? 'user' : 'environment'))
    }

    useEffect(() => {
        if (cameraActive) startCamera()
    }, [facingMode])

    // Capture image
    const captureImage = () => {
        if (!videoRef.current || !canvasRef.current) return
        const video = videoRef.current
        const canvas = canvasRef.current
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        const ctx = canvas.getContext('2d')
        ctx.drawImage(video, 0, 0)
        const imageData = canvas.toDataURL('image/jpeg', 0.9)
        setPreview(imageData)
        stopCamera()
    }

    // Handle file upload
    const handleFile = async (file) => {
        if (!file || !file.type.startsWith('image/')) {
            showToast('Please select an image file', 'error')
            return
        }
        try {
            const base64 = await imageToBase64(file)
            const compressed = await compressImage(base64, 1280, 960)
            setPreview(compressed)
            stopCamera()
        } catch (err) {
            showToast('Error reading file', 'error')
        }
    }

    const handleDrop = (e) => {
        e.preventDefault()
        setDragOver(false)
        const file = e.dataTransfer.files[0]
        if (file) handleFile(file)
    }

    // Analyze — store image and navigate
    const analyzeImage = () => {
        if (!preview) return
        localStorage.setItem(CONFIG.STORAGE.CAPTURED_IMAGE, preview)
        navigate('/result')
    }

    const clearPreview = () => {
        setPreview(null)
    }

    return (
        <div className="camera-page">
            <div className="container">
                <div className="page-header">
                    <h2>ถ่ายภาพอาหาร</h2>
                    <p className="text-secondary">ถ่ายรูปหรืออัปโหลดภาพอาหารไทยเพื่อวิเคราะห์</p>
                </div>

                <div className="camera-layout">
                    {/* Camera / Preview area */}
                    <div className="camera-main glass-card">
                        {preview ? (
                            <div className="preview-area">
                                <img src={preview} alt="Preview" className="preview-img" />
                                <button className="btn-clear" onClick={clearPreview}>
                                    <X size={20} />
                                </button>
                            </div>
                        ) : cameraActive ? (
                            <div className="video-area">
                                <video ref={videoRef} autoPlay playsInline muted className="camera-video" />
                            </div>
                        ) : (
                            <div
                                className={`upload-area ${dragOver ? 'drag-over' : ''}`}
                                onClick={() => fileInputRef.current?.click()}
                                onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                                onDragLeave={() => setDragOver(false)}
                                onDrop={handleDrop}
                            >
                                <ImageIcon size={48} className="text-muted" />
                                <h3>อัปโหลดรูปภาพ</h3>
                                <p className="text-secondary text-sm">ลากแล้ววาง หรือคลิกเพื่อเลือกรูป</p>
                            </div>
                        )}
                        <canvas ref={canvasRef} style={{ display: 'none' }} />
                    </div>

                    {/* Controls */}
                    <div className="camera-controls">
                        {preview ? (
                            <>
                                <button className="btn btn-accent btn-lg w-full" onClick={analyzeImage}>
                                    <Zap size={20} /> วิเคราะห์อาหาร
                                </button>
                                <button className="btn btn-outline w-full" onClick={clearPreview}>
                                    ถ่ายใหม่ / อัปโหลดใหม่
                                </button>
                            </>
                        ) : (
                            <>
                                {!cameraActive ? (
                                    <button className="btn btn-primary btn-lg w-full" onClick={startCamera}>
                                        <CameraIcon size={20} /> เปิดกล้อง
                                    </button>
                                ) : (
                                    <>
                                        <button className="btn btn-accent btn-lg w-full" onClick={captureImage}>
                                            <CameraIcon size={20} /> ถ่ายภาพ
                                        </button>
                                        <button className="btn btn-outline w-full" onClick={switchCamera}>
                                            <SwitchCamera size={18} /> สลับกล้อง
                                        </button>
                                        <button className="btn btn-ghost w-full" onClick={stopCamera}>
                                            หยุดกล้อง
                                        </button>
                                    </>
                                )}
                                <div className="divider-text"><span>or</span></div>
                                <button className="btn btn-outline w-full" onClick={() => fileInputRef.current?.click()}>
                                    <Upload size={18} /> อัปโหลดไฟล์
                                </button>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    capture="environment"
                                    style={{ display: 'none' }}
                                    onChange={(e) => { if (e.target.files[0]) handleFile(e.target.files[0]) }}
                                />
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
