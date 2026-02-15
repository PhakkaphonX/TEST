/**
 * =====================================================
 * Camera Page JavaScript
 * Handles webcam, upload, and AI prediction
 * Supports mobile camera switching (front/back)
 * =====================================================
 */

class CameraManager {
    constructor() {
        this.video = document.getElementById('videoElement');
        this.canvas = document.getElementById('canvasElement');
        this.stream = null;
        this.model = null;
        this.isModelLoaded = false;

        // Camera switching support
        this.availableDevices = [];
        this.currentDeviceId = null;
        this.currentFacingMode = 'environment'; // default to back camera on mobile
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

    // Enumerate available video devices
    async enumerateDevices() {
        try {
            const devices = await navigator.mediaDevices.enumerateDevices();
            this.availableDevices = devices.filter(d => d.kind === 'videoinput');
            console.log(`Found ${this.availableDevices.length} camera(s):`, this.availableDevices);

            // Populate the camera source dropdown
            const select = document.getElementById('cameraSource');
            if (select && this.availableDevices.length > 0) {
                select.innerHTML = '';
                this.availableDevices.forEach((device, idx) => {
                    const option = document.createElement('option');
                    option.value = device.deviceId;
                    option.textContent = device.label || `Camera ${idx + 1}`;
                    select.appendChild(option);
                });

                // Show the dropdown & switch button if more than 1 camera
                if (this.availableDevices.length > 1) {
                    document.getElementById('cameraSourceContainer')?.classList.remove('d-none');
                    document.getElementById('switchCameraBtn')?.classList.remove('d-none');
                }
            }
        } catch (err) {
            console.warn('Could not enumerate devices:', err);
        }
    }

    // Bind event listeners
    bindEvents() {
        // Camera controls
        document.getElementById('startCameraBtn')?.addEventListener('click', () => this.startCamera());
        document.getElementById('stopCameraBtn')?.addEventListener('click', () => this.stopCamera());
        document.getElementById('captureBtn')?.addEventListener('click', () => this.captureImage());

        // Switch camera (toggle front/back)
        document.getElementById('switchCameraBtn')?.addEventListener('click', () => this.switchCamera());

        // Camera source dropdown change
        document.getElementById('cameraSource')?.addEventListener('change', (e) => {
            this.currentDeviceId = e.target.value;
            this.startCameraWithDevice(this.currentDeviceId);
        });

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

    // Start webcam (initial start with facingMode preference)
    async startCamera() {
        try {
            const constraints = {
                video: {
                    facingMode: this.currentFacingMode,
                    width: { ideal: 1920 },
                    height: { ideal: 1080 }
                },
                audio: false
            };

            this.stream = await navigator.mediaDevices.getUserMedia(constraints);
            this.video.srcObject = this.stream;

            // After getting permission, enumerate devices (labels are available now)
            await this.enumerateDevices();

            // Update the dropdown to reflect the active device
            const activeTrack = this.stream.getVideoTracks()[0];
            if (activeTrack) {
                const settings = activeTrack.getSettings();
                if (settings.deviceId) {
                    this.currentDeviceId = settings.deviceId;
                    const select = document.getElementById('cameraSource');
                    if (select) select.value = this.currentDeviceId;
                }
            }

            this.showCameraUI(true);
            Utils.showToast('Camera started successfully', 'success');
        } catch (error) {
            console.error('Error starting camera:', error);
            // Fallback: try without facingMode constraint
            try {
                this.stream = await navigator.mediaDevices.getUserMedia({
                    video: { width: { ideal: 1280 }, height: { ideal: 720 } },
                    audio: false
                });
                this.video.srcObject = this.stream;
                await this.enumerateDevices();
                this.showCameraUI(true);
                Utils.showToast('Camera started successfully', 'success');
            } catch (fallbackError) {
                console.error('Fallback camera also failed:', fallbackError);
                this.showCameraError('Could not access camera. Please allow camera permissions.');
            }
        }
    }

    // Start camera with a specific device ID
    async startCameraWithDevice(deviceId) {
        // Stop existing stream first
        this.stopStream();

        try {
            this.stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    deviceId: { exact: deviceId },
                    width: { ideal: 1920 },
                    height: { ideal: 1080 }
                },
                audio: false
            });

            this.video.srcObject = this.stream;
            this.currentDeviceId = deviceId;
            this.showCameraUI(true);
        } catch (error) {
            console.error('Error switching camera:', error);
            this.showCameraError('Could not switch camera. Please try again.');
        }
    }

    // Switch between front and back camera (toggle facingMode)
    async switchCamera() {
        // Toggle facing mode
        this.currentFacingMode = this.currentFacingMode === 'environment' ? 'user' : 'environment';

        // Stop existing stream
        this.stopStream();

        try {
            this.stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: this.currentFacingMode,
                    width: { ideal: 1920 },
                    height: { ideal: 1080 }
                },
                audio: false
            });

            this.video.srcObject = this.stream;

            // Mirror the video if using front camera
            if (this.currentFacingMode === 'user') {
                this.video.style.transform = 'scaleX(-1)';
            } else {
                this.video.style.transform = 'scaleX(1)';
            }

            // Update the dropdown to reflect the new device
            const activeTrack = this.stream.getVideoTracks()[0];
            if (activeTrack) {
                const settings = activeTrack.getSettings();
                if (settings.deviceId) {
                    this.currentDeviceId = settings.deviceId;
                    const select = document.getElementById('cameraSource');
                    if (select) select.value = this.currentDeviceId;
                }
            }

            const label = this.currentFacingMode === 'user' ? 'Front' : 'Back';
            Utils.showToast(`Switched to ${label} camera`, 'success');
        } catch (error) {
            console.error('Error switching camera:', error);
            // Revert facing mode
            this.currentFacingMode = this.currentFacingMode === 'environment' ? 'user' : 'environment';
            Utils.showToast('Could not switch camera', 'danger');
        }
    }

    // Stop only the media stream (without resetting UI)
    stopStream() {
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
            this.stream = null;
        }
        this.video.srcObject = null;
    }

    // Show/hide camera UI elements
    showCameraUI(active) {
        if (active) {
            document.getElementById('cameraPlaceholder')?.classList.add('d-none');
            document.getElementById('captureBtn')?.removeAttribute('disabled');
            document.getElementById('stopCameraBtn')?.removeAttribute('disabled');
            document.getElementById('startCameraBtn')?.classList.add('d-none');
            document.getElementById('cameraError')?.classList.add('d-none');
            document.getElementById('cropGuide')?.classList.remove('d-none');
        } else {
            document.getElementById('cameraPlaceholder')?.classList.remove('d-none');
            document.getElementById('captureBtn')?.setAttribute('disabled', 'true');
            document.getElementById('stopCameraBtn')?.setAttribute('disabled', 'true');
            document.getElementById('startCameraBtn')?.classList.remove('d-none');
            document.getElementById('switchCameraBtn')?.classList.add('d-none');
            document.getElementById('cameraSourceContainer')?.classList.add('d-none');
            document.getElementById('cropGuide')?.classList.add('d-none');
        }
    }

    // Stop webcam
    stopCamera() {
        this.stopStream();
        this.video.style.transform = '';
        this.showCameraUI(false);
    }

    // Capture image from webcam
    captureImage() {
        if (!this.stream) return;

        const ctx = this.canvas.getContext('2d');

        // Center-crop: take the center 70% of the image to remove background noise
        const cropRatio = 0.70;
        const srcW = this.video.videoWidth;
        const srcH = this.video.videoHeight;
        const cropW = Math.round(srcW * cropRatio);
        const cropH = Math.round(srcH * cropRatio);
        const offsetX = Math.round((srcW - cropW) / 2);
        const offsetY = Math.round((srcH - cropH) / 2);

        this.canvas.width = cropW;
        this.canvas.height = cropH;

        // If front camera (mirrored), flip the canvas capture too
        if (this.currentFacingMode === 'user') {
            ctx.translate(cropW, 0);
            ctx.scale(-1, 1);
        }

        // Draw only the center-cropped portion
        ctx.drawImage(this.video, offsetX, offsetY, cropW, cropH, 0, 0, cropW, cropH);

        const imageData = this.canvas.toDataURL('image/jpeg', 1.0);

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
