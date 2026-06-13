// OpenRouteService Integration
class OpenRouteService {
    constructor(apiKey) {
        this.apiKey = apiKey;
        this.baseUrl = 'https://api.openrouteservice.org/v2/directions/foot-walking';
    }

    async getRoute(startCoords, endCoords) {
        try {
            const url = `${this.baseUrl}?api_key=${this.apiKey}&start=${startCoords.lng},${startCoords.lat}&end=${endCoords.lng},${endCoords.lat}`;
            
            console.log('Fetching route from OpenRouteService...');
            
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`OpenRouteService error: ${response.status}`);
            }
            
            const data = await response.json();
            console.log('OpenRouteService response:', data);
            
            if (!data.features || data.features.length === 0) {
                throw new Error('No route found');
            }
            
            const route = data.features[0];
            const coordinates = route.geometry.coordinates.map(coord => [coord[1], coord[0]]); // [lng, lat] to [lat, lng]
            const distance = route.properties.segments[0].distance; // in meters
            const duration = route.properties.segments[0].duration; // in seconds
            
            return {
                coordinates: coordinates,
                distance: Math.round(distance),
                duration: Math.round(duration / 60), // convert to minutes
                steps: route.properties.segments[0].steps || []
            };
        } catch (error) {
            console.error('Error fetching route from OpenRouteService:', error);
            throw error;
        }
    }
}

export default OpenRouteService;
