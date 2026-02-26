/**
 * API Helper — Thai Food Analysis
 */
import CONFIG from './config'

const API = {
    async request(endpoint, options = {}) {
        const url = `${CONFIG.API_BASE_URL}${endpoint}`

        const defaultOptions = {
            headers: { 'Content-Type': 'application/json' },
        }

        const token = localStorage.getItem(CONFIG.STORAGE.TOKEN)
        if (token) {
            defaultOptions.headers.Authorization = `Bearer ${token}`
        }

        const config = {
            ...defaultOptions,
            ...options,
            headers: { ...defaultOptions.headers, ...options.headers },
        }

        try {
            const response = await fetch(url, config)
            const data = await response.json()
            if (!response.ok) throw new Error(data.message || 'API request failed')
            return data
        } catch (error) {
            console.error('API Error:', error)
            throw error
        }
    },

    get(endpoint) {
        return this.request(endpoint, { method: 'GET' })
    },

    post(endpoint, body) {
        return this.request(endpoint, { method: 'POST', body: JSON.stringify(body) })
    },

    put(endpoint, body) {
        return this.request(endpoint, { method: 'PUT', body: JSON.stringify(body) })
    },

    delete(endpoint) {
        return this.request(endpoint, { method: 'DELETE' })
    },
}

export default API
