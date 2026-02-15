/**
 * =====================================================
 * Main JavaScript Utilities
 * Shared functions across all pages
 * =====================================================
 */

// API Helper Class
class API {
    static async request(endpoint, options = {}) {
        const url = `${CONFIG.API_BASE_URL}${endpoint}`;
        
        const defaultOptions = {
            headers: {
                'Content-Type': 'application/json'
            }
        };

        // Add auth token if available
        const token = localStorage.getItem(CONFIG.STORAGE.TOKEN);
        if (token) {
            defaultOptions.headers.Authorization = `Bearer ${token}`;
        }

        const config = {
            ...defaultOptions,
            ...options,
            headers: {
                ...defaultOptions.headers,
                ...options.headers
            }
        };

        try {
            const response = await fetch(url, config);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'API request failed');
            }

            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    static async get(endpoint) {
        return this.request(endpoint, { method: 'GET' });
    }

    static async post(endpoint, body) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(body)
        });
    }

    static async put(endpoint, body) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(body)
        });
    }

    static async delete(endpoint) {
        return this.request(endpoint, { method: 'DELETE' });
    }
}

// Make API available globally
window.API = API;

// Utility Functions
const Utils = {
    // Format number with commas
    formatNumber(num) {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    },

    // Format date
    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    },

    // Format relative time
    formatRelativeTime(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now - date;
        
        const seconds = Math.floor(diff / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
        if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
        if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
        return 'Just now';
    },

    // Debounce function
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    // Show toast notification
    showToast(message, type = 'success') {
        const toastContainer = document.querySelector('.toast-container') || (() => {
            const container = document.createElement('div');
            container.className = 'toast-container';
            document.body.appendChild(container);
            return container;
        })();

        const toast = document.createElement('div');
        toast.className = `toast align-items-center text-white bg-${type} border-0`;
        toast.setAttribute('role', 'alert');
        toast.innerHTML = `
            <div class="d-flex">
                <div class="toast-body">${message}</div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
            </div>
        `;

        toastContainer.appendChild(toast);
        const bsToast = new bootstrap.Toast(toast, { delay: 3000 });
        bsToast.show();

        toast.addEventListener('hidden.bs.toast', () => {
            toast.remove();
        });
    },

    // Check if user is logged in
    isLoggedIn() {
        return !!localStorage.getItem(CONFIG.STORAGE.TOKEN);
    },

    // Get current user
    getCurrentUser() {
        const userStr = localStorage.getItem(CONFIG.STORAGE.USER);
        return userStr ? JSON.parse(userStr) : null;
    },

    // Set current user
    setCurrentUser(user, token) {
        localStorage.setItem(CONFIG.STORAGE.USER, JSON.stringify(user));
        localStorage.setItem(CONFIG.STORAGE.TOKEN, token);
    },

    // Clear current user
    clearCurrentUser() {
        localStorage.removeItem(CONFIG.STORAGE.USER);
        localStorage.removeItem(CONFIG.STORAGE.TOKEN);
    },

    // Update navigation based on auth status
    updateNavigation() {
        const authSection = document.getElementById('authSection');
        if (!authSection) return;

        if (this.isLoggedIn()) {
            const user = this.getCurrentUser();
            authSection.innerHTML = `
                <div class="dropdown">
                    <button class="btn btn-outline-light btn-sm dropdown-toggle" type="button" data-bs-toggle="dropdown">
                        <i class="bi bi-person-circle me-2"></i>${user?.username || 'User'}
                    </button>
                    <ul class="dropdown-menu dropdown-menu-end">
                        <li><a class="dropdown-item" href="dashboard.html">
                            <i class="bi bi-graph-up me-2"></i>Dashboard
                        </a></li>
                        <li><a class="dropdown-item" href="history.html">
                            <i class="bi bi-clock-history me-2"></i>History
                        </a></li>
                        <li><hr class="dropdown-divider"></li>
                        <li><a class="dropdown-item text-danger" href="#" id="logoutBtn">
                            <i class="bi bi-box-arrow-right me-2"></i>Logout
                        </a></li>
                    </ul>
                </div>
            `;

            // Add logout handler
            document.getElementById('logoutBtn')?.addEventListener('click', (e) => {
                e.preventDefault();
                this.clearCurrentUser();
                window.location.href = 'index.html';
            });
        }
    },

    // Convert image to base64
    async imageToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    },

    // Compress image
    async compressImage(base64String, maxWidth = 800, maxHeight = 600) {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                if (width > maxWidth) {
                    height = Math.round((height * maxWidth) / width);
                    width = maxWidth;
                }
                if (height > maxHeight) {
                    width = Math.round((width * maxHeight) / height);
                    height = maxHeight;
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                
                resolve(canvas.toDataURL('image/jpeg', 0.8));
            };
            img.src = base64String;
        });
    }
};

// Make Utils available globally
window.Utils = Utils;

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    Utils.updateNavigation();
});
