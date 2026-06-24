const axios = require('axios');
const logger = require('../utils/logger');

class OpenRouteService {
    constructor() {
        this.apiKey = process.env.ORS_API_KEY;
        this.baseUrl = 'https://api.openrouteservice.org/v2/directions/foot-walking';
    }

    async getRoute(startCoords, endCoords) {
        if (!this.apiKey) {
            throw new Error('ORS_API_KEY is not set in environment variables');
        }

        const url = `${this.baseUrl}?api_key=${this.apiKey}&start=${startCoords.lng},${startCoords.lat}&end=${endCoords.lng},${endCoords.lat}`;

        const response = await axios.get(url, { timeout: 10000 });
        const data = response.data;

        if (!data.features || data.features.length === 0) {
            throw new Error('No route found from OpenRouteService');
        }

        const route = data.features[0];
        const segment = route.properties.segments[0];

        return {
            // [lng, lat] → [lat, lng] for Leaflet
            coordinates: route.geometry.coordinates.map(coord => ({ lat: coord[1], lng: coord[0] })),
            distance: Math.round(segment.distance),       // meters
            duration: Math.round(segment.duration / 60),  // minutes
            steps: segment.steps || []
        };
    }
}

module.exports = new OpenRouteService();
