/**
 * =====================================================
 * Authentication JavaScript
 * Handles login, registration, and guest access
 * =====================================================
 */

class AuthManager {
    constructor() {
        this.togglePasswordBtn = document.getElementById('togglePassword');
        this.passwordInput = document.getElementById('password');
    }

    // Initialize
    init() {
        this.bindEvents();
        this.checkRedirect();
    }

    // Bind event listeners
    bindEvents() {
        // Toggle password visibility
        this.togglePasswordBtn?.addEventListener('click', () => {
            const type = this.passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            this.passwordInput.setAttribute('type', type);
            
            const icon = this.togglePasswordBtn.querySelector('i');
            icon.classList.toggle('bi-eye');
            icon.classList.toggle('bi-eye-slash');
        });

        // Login form submission
        document.getElementById('loginForm')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin();
        });

        // Guest access
        document.getElementById('guestBtn')?.addEventListener('click', () => {
            this.handleGuestAccess();
        });
    }

    // Check for redirect parameter
    checkRedirect() {
        const urlParams = new URLSearchParams(window.location.search);
        const redirect = urlParams.get('redirect');
        if (redirect) {
            localStorage.setItem('thaiFood_redirect', redirect);
        }
    }

    // Handle login
    async handleLogin() {
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        const rememberMe = document.getElementById('rememberMe')?.checked;

        // Validation
        if (!email || !password) {
            this.showError('Please enter both email and password');
            return;
        }

        const loginBtn = document.getElementById('loginBtn');
        this.setLoading(true);

        try {
            const response = await API.post('/auth/login', { email, password });

            if (response.success) {
                // Store user data
                Utils.setCurrentUser(response.data.user, response.data.token);

                // Show success message
                Utils.showToast('Login successful!', 'success');

                // Handle remember me
                if (rememberMe) {
                    localStorage.setItem('thaiFood_remember', JSON.stringify({ email }));
                } else {
                    localStorage.removeItem('thaiFood_remember');
                }

                // Redirect
                const redirect = localStorage.getItem('thaiFood_redirect') || 'index.html';
                localStorage.removeItem('thaiFood_redirect');
                
                setTimeout(() => {
                    window.location.href = redirect;
                }, 1000);
            } else {
                throw new Error(response.message || 'Login failed');
            }
        } catch (error) {
            console.error('Login error:', error);
            this.showError(error.message || 'Invalid email or password');
        } finally {
            this.setLoading(false);
        }
    }

    // Handle guest access
    handleGuestAccess() {
        // Create a temporary guest user
        const guestUser = {
            id: 'guest',
            username: 'Guest',
            email: 'guest@example.com'
        };
        
        // Store guest token (temporary)
        Utils.setCurrentUser(guestUser, 'guest-token');
        
        Utils.showToast('Continuing as guest', 'info');
        
        // Redirect to camera page
        setTimeout(() => {
            window.location.href = 'camera.html';
        }, 500);
    }

    // Show error message
    showError(message) {
        const errorDiv = document.getElementById('errorMessage');
        const errorText = document.getElementById('errorText');
        
        if (errorDiv && errorText) {
            errorText.textContent = message;
            errorDiv.classList.remove('d-none');
            
            // Hide after 5 seconds
            setTimeout(() => {
                errorDiv.classList.add('d-none');
            }, 5000);
        }
    }

    // Set loading state
    setLoading(isLoading) {
        const loginBtn = document.getElementById('loginBtn');
        if (!loginBtn) return;

        const normalText = loginBtn.querySelector('.normal-text');
        const loadingText = loginBtn.querySelector('.loading-text');

        if (isLoading) {
            loginBtn.disabled = true;
            normalText?.classList.add('d-none');
            loadingText?.classList.remove('d-none');
        } else {
            loginBtn.disabled = false;
            normalText?.classList.remove('d-none');
            loadingText?.classList.add('d-none');
        }
    }
}

// Initialize auth manager
document.addEventListener('DOMContentLoaded', () => {
    const authManager = new AuthManager();
    authManager.init();
});
