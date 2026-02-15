/**
 * =====================================================
 * Camera Page JavaScript
 * Handles webcam, upload, and AI prediction
 * =====================================================
 */

class CameraManager {
    constructor() {
        this.video = document.getElementById('videoElement');
        this.canvas = document.getElementById('canvasElement');
        this.stream = null;
        this.model = null;
        this.isModelLoaded = false;
    }

    // Initialize camera
    async init() {
        this.bindEvents();
        await this.loadModel();
    }

    // Load TensorFlow.js MobileNet model
    async loadModel() {
        try {
            console.log('Loading MobileNet model...');
            this.model = await mobilenet.load();
            this.isModelLoaded = true;
            console.log('MobileNet model loaded successfully');
        } catch (error) {
            console.error('Error loading model:', error);
            Utils.showToast('Error loading AI model. Please refresh the page.', 'danger');
        }
    }

    // Bind event listeners
    bindEvents() {
        // Camera controls
        document.getElementById('startCameraBtn')?.addEventListener('click', () => this.startCamera());
        document.getElementById('stopCameraBtn')?.addEventListener('click', () => this.stopCamera());
        document.getElementById('captureBtn')?.addEventListener('click', () => this.captureImage());

        // Upload controls
        document.getElementById('browseBtn')?.addEventListener('click', () => {
            document.getElementById('fileInput')?.click();
        });

        document.getElementById('fileInput')?.addEventListener('change', (e) => this.handleFileSelect(e));

        document.getElementById('analyzeUploadBtn')?.addEventListener('click', () => {
            const imageData = document.getElementById('previewImage')?.src;
            if (imageData) {
                this.analyzeImage(imageData);
            }
        });

        document.getElementById('clearUploadBtn')?.addEventListener('click', () => this.clearUpload());

        // Drag and drop
        const uploadArea = document.getElementById('uploadArea');
        if (uploadArea) {
            uploadArea.addEventListener('dragover', (e) => {
                e.preventDefault();
                uploadArea.classList.add('dragover');
            });

            uploadArea.addEventListener('dragleave', () => {
                uploadArea.classList.remove('dragover');
            });

            uploadArea.addEventListener('drop', (e) => {
                e.preventDefault();
                uploadArea.classList.remove('dragover');
                const files = e.dataTransfer.files;
                if (files.length > 0) {
                    this.handleFile(files[0]);
                }
            });
        }
    }

    // Start webcam
    async startCamera() {
        try {
            this.stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
                audio: false
            });

            this.video.srcObject = this.stream;

            document.getElementById('cameraPlaceholder')?.classList.add('d-none');
            document.getElementById('captureBtn')?.removeAttribute('disabled');
            document.getElementById('stopCameraBtn')?.removeAttribute('disabled');
            document.getElementById('startCameraBtn')?.classList.add('d-none');

            Utils.showToast('Camera started successfully', 'success');
        } catch (error) {
            console.error('Error starting camera:', error);
            this.showCameraError('Could not access camera. Please allow camera permissions.');
        }
    }

    // Stop webcam
    stopCamera() {
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
            this.stream = null;
        }

        this.video.srcObject = null;

        document.getElementById('cameraPlaceholder')?.classList.remove('d-none');
        document.getElementById('captureBtn')?.setAttribute('disabled', 'true');
        document.getElementById('stopCameraBtn')?.setAttribute('disabled', 'true');
        document.getElementById('startCameraBtn')?.classList.remove('d-none');
    }

    // Capture image from webcam
    captureImage() {
        if (!this.stream) return;

        const ctx = this.canvas.getContext('2d');
        this.canvas.width = this.video.videoWidth;
        this.canvas.height = this.video.videoHeight;
        ctx.drawImage(this.video, 0, 0);

        const imageData = this.canvas.toDataURL('image/jpeg', 0.9);
        
        // Stop camera after capture
        this.stopCamera();

        // Analyze the captured image
        this.analyzeImage(imageData);
    }

    // Handle file selection
    handleFileSelect(event) {
        const file = event.target.files[0];
        if (file) {
            this.handleFile(file);
        }
    }

    // Handle file upload
    handleFile(file) {
        // Validate file type
        if (!file.type.startsWith('image/')) {
            Utils.showToast('Please select a valid image file', 'danger');
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            Utils.showToast('File size should be less than 5MB', 'danger');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            this.showImagePreview(e.target.result);
        };
        reader.readAsDataURL(file);
    }

    // Show image preview
    showImagePreview(imageData) {
        const previewImg = document.getElementById('previewImage');
        const uploadArea = document.getElementById('uploadArea');
        const previewArea = document.getElementById('uploadPreview');

        if (previewImg) previewImg.src = imageData;
        if (uploadArea) uploadArea.classList.add('d-none');
        if (previewArea) previewArea.classList.remove('d-none');
    }

    // Clear upload
    clearUpload() {
        const fileInput = document.getElementById('fileInput');
        const uploadArea = document.getElementById('uploadArea');
        const previewArea = document.getElementById('uploadPreview');

        if (fileInput) fileInput.value = '';
        if (uploadArea) uploadArea.classList.remove('d-none');
        if (previewArea) previewArea.classList.add('d-none');
    }

    // Show camera error
    showCameraError(message) {
        const errorDiv = document.getElementById('cameraError');
        const errorText = document.getElementById('cameraErrorText');

        if (errorDiv && errorText) {
            errorText.textContent = message;
            errorDiv.classList.remove('d-none');
        }
    }

    // Analyze image with AI
    async analyzeImage(imageData) {
        // Store image data
        localStorage.setItem(CONFIG.STORAGE.CAPTURED_IMAGE, imageData);

        // Navigate to result page for analysis
        window.location.href = 'result.html';
    }
}

// Initialize camera manager
document.addEventListener('DOMContentLoaded', () => {
    const cameraManager = new CameraManager();
    cameraManager.init();
});
