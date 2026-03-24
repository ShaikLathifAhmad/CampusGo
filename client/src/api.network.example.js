// ⚠️ NETWORK SHARING CONFIGURATION
// Copy this file content to api.js when sharing on local network
// Replace YOUR_IP_HERE with your actual IP address (e.g., 192.168.1.100)

const API_BASE = 'http://YOUR_IP_HERE:3000/api';

export const api = {
    // Get all locations
    getLocations: async () => {
        try {
            const res = await fetch(`${API_BASE}/locations`);
            return await res.json();
        } catch (e) {
            console.error("Failed to fetch locations", e);
            return [];
        }
    },

    // Add a new custom location
    addLocation: async (location) => {
        try {
            const res = await fetch(`${API_BASE}/locations`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(location)
            });
            return await res.json();
        } catch (e) {
            console.error("Failed to add location", e);
            return null;
        }
    },

    // Get route from AI service (via proxy)
    getRoute: async (start, end) => {
        try {
            const res = await fetch(`${API_BASE}/route`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ start, end })
            });
            return await res.json();
        } catch (e) {
            console.error("Failed to get route", e);
            return null;
        }
    },

    // Chat with AI
    sendMessage: async (message) => {
        try {
            const res = await fetch(`${API_BASE}/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message })
            });
            return await res.json();
        } catch (e) {
            console.error("Failed to send message", e);
            return { response: "Sorry, I'm having trouble connecting to the server." };
        }
    }
};
