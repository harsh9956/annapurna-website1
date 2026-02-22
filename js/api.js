/**
 * Annapurna API Layer
 * Handles robust network requests to the backend with intelligent fallback behaviors 
 * if the Node.js server is not currently running.
 */
const API_BASE_URL = 'https://annapurna-website1.onrender.com/api';

const API = {
    /**
     * Helper to get the auth token
     */
    getToken() {
        // First try sessionStorage (from this session), then localStorage (persisted)
        return sessionStorage.getItem('annapurna_token') || localStorage.getItem('annapurna_token');
    },

    /**
     * Core robust fetch wrapper
     */
    async request(endpoint, options = {}) {
        const url = `${API_BASE_URL}${endpoint}`;

        // Setup headers
        const headers = {
            'Content-Type': 'application/json',
            ...(options.headers || {})
        };

        const token = this.getToken();
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const fetchOptions = {
            ...options,
            headers
        };

        try {
            const response = await fetch(url, fetchOptions);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'API Error');
            }

            return data;
        } catch (error) {
            console.warn(`[API Network Failed for ${endpoint}]:`, error.message);
            // Throw a specific network offline error so callers can fallback
            throw { isNetworkError: true, originalError: error };
        }
    }
};

window.API = API;
