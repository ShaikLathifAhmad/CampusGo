// API Configuration
const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
const API_TIMEOUT = import.meta.env.VITE_API_TIMEOUT || 10000;

// Security: Add request timeout and error handling
const fetchWithTimeout = async (url, options = {}) => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), API_TIMEOUT);
    
    try {
        const response = await fetch(url, {
            ...options,
            signal: controller.signal,
            credentials: 'include', // Include cookies for CORS
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            }
        });
        clearTimeout(timeout);
        return response;
    } catch (error) {
        clearTimeout(timeout);
        if (error.name === 'AbortError') {
            throw new Error('Request timeout');
        }
        throw error;
    }
};

export const api = {
    // Get all locations
    getLocations: async () => {
        try {
            const res = await fetchWithTimeout(`${API_BASE}/locations`);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            return await res.json();
        } catch (e) {
            console.error("Failed to fetch locations", e);
            return [];
        }
    },

    // Add a new custom location
    addLocation: async (location) => {
        try {
            const res = await fetchWithTimeout(`${API_BASE}/locations`, {
                method: 'POST',
                body: JSON.stringify(location)
            });
            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.error || `HTTP ${res.status}`);
            }
            return await res.json();
        } catch (e) {
            console.error("Failed to add location", e);
            return { error: e.message };
        }
    },

    // Get route from AI service (via proxy)
    getRoute: async (start, end) => {
        try {
            const res = await fetchWithTimeout(`${API_BASE}/route`, {
                method: 'POST',
                body: JSON.stringify({ start, end })
            });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            return await res.json();
        } catch (e) {
            console.error("Failed to get route", e);
            return null;
        }
    },

    // Chat with AI
    sendMessage: async (message) => {
        try {
            // Client-side validation
            if (!message || typeof message !== 'string') {
                return { response: "Please enter a valid message." };
            }
            
            if (message.length > 500) {
                return { response: "Message too long. Maximum 500 characters." };
            }
            
            const res = await fetchWithTimeout(`${API_BASE}/chat`, {
                method: 'POST',
                body: JSON.stringify({ message })
            });
            
            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.error || `HTTP ${res.status}`);
            }
            
            return await res.json();
        } catch (e) {
            console.error("Failed to send message", e);
            return { response: "Sorry, I'm having trouble connecting to the server." };
        }
    }
};
