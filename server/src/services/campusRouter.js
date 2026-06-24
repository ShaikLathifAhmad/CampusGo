class CampusRouter {
    constructor() {
        this.graph = {
            'Main Gate': {
                connections: ['Srm hospital', 'Auditorium', 'Medical college library'],
                coords: { lat: 10.95387, lng: 78.75856 }
            },
            'Srm hospital': {
                connections: ['Main Gate', 'Medical boys hostel', 'Medical girls hostel', 'Srm medical college'],
                coords: { lat: 10.95460, lng: 78.75531 }
            },
            'Medical college library': {
                connections: ['Main Gate', 'Srm arts and science college', 'Srm medical college'],
                coords: { lat: 10.95305, lng: 78.75349 }
            },
            'Srm arts and science college': {
                connections: ['Medical college library', 'Srm instuite of hotel management', 'Srm TRP engineering college'],
                coords: { lat: 10.95223, lng: 78.75444 }
            },
            'Srm instuite of hotel management': {
                connections: ['Srm arts and science college', 'Srm TRP engineering college', 'TRP hostel'],
                coords: { lat: 10.95162, lng: 78.75429 }
            },
            'Srm medical college': {
                connections: ['Srm hospital', 'Medical college library', 'SRM College of Nursing'],
                coords: { lat: 10.95437, lng: 78.75366 }
            },
            'Srm TRP engineering college': {
                connections: ['Srm arts and science college', 'Srm instuite of hotel management', 'TRP hostel'],
                coords: { lat: 10.95222, lng: 78.75250 }
            },
            'SRM IST': {
                connections: ['Home needs', 'Medical boys hostel', 'Staff quarters'],
                coords: { lat: 10.95624, lng: 78.75421 }
            },
            'G Block Hostel': {
                connections: ['S Block Hostel', 'Medical girls hostel'],
                coords: { lat: 10.95606, lng: 78.75037 }
            },
            'S Block Hostel': {
                connections: ['G Block Hostel', 'Medical girls hostel', 'Staff quaters 2'],
                coords: { lat: 10.95765, lng: 78.74937 }
            },
            'TRP hostel': {
                connections: ['Srm TRP engineering college', 'Srm instuite of hotel management'],
                coords: { lat: 10.95299, lng: 78.75129 }
            },
            'Medical boys hostel': {
                connections: ['Srm hospital', 'SRM IST', 'Medical girls hostel'],
                coords: { lat: 10.95663, lng: 78.75179 }
            },
            'Medical girls hostel': {
                connections: ['Medical boys hostel', 'G Block Hostel', 'S Block Hostel', 'Srm hospital'],
                coords: { lat: 10.95697, lng: 78.75038 }
            },
            'Basil Restaurant': {
                connections: ['SRM IST', 'Home needs'],
                coords: { lat: 10.95523, lng: 78.75398 }
            },
            'SRM College of Nursing': {
                connections: ['Srm medical college', 'Staff quarters'],
                coords: { lat: 10.95490, lng: 78.75091 }
            },
            'Auditorium': {
                connections: ['Main Gate', 'Home needs'],
                coords: { lat: 10.95221, lng: 78.75811 }
            },
            'Staff quarters': {
                connections: ['SRM IST', 'SRM College of Nursing', 'Staff quaters 2'],
                coords: { lat: 10.95563, lng: 78.75174 }
            },
            'Staff quaters 2': {
                connections: ['Staff quarters', 'S Block Hostel'],
                coords: { lat: 10.95668, lng: 78.75110 }
            },
            'Play ground': {
                connections: ['Staff quarters', 'SRM IST'],
                coords: { lat: 10.95580, lng: 78.75271 }
            },
            'Home needs': {
                connections: ['SRM IST', 'Auditorium', 'Basil Restaurant'],
                coords: { lat: 10.95433, lng: 78.75713 }
            }
        };
    }

    // Haversine formula — distance in meters between two coords
    calculateDistance(lat1, lng1, lat2, lng2) {
        const R = 6371e3;
        const φ1 = lat1 * Math.PI / 180;
        const φ2 = lat2 * Math.PI / 180;
        const Δφ = (lat2 - lat1) * Math.PI / 180;
        const Δλ = (lng2 - lng1) * Math.PI / 180;
        const a = Math.sin(Δφ / 2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
        return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    }

    // BFS shortest path — returns array of location names or null
    findPath(startName, endName) {
        if (!this.graph[startName] || !this.graph[endName]) return null;
        if (startName === endName) return [startName];

        const queue = [[startName]];
        const visited = new Set([startName]);

        while (queue.length > 0) {
            const path = queue.shift();
            const node = path[path.length - 1];

            if (node === endName) return path;

            for (const neighbor of (this.graph[node].connections || [])) {
                if (!visited.has(neighbor)) {
                    visited.add(neighbor);
                    queue.push([...path, neighbor]);
                }
            }
        }

        return null;
    }

    // Returns full route with coords, distance, and walking time
    getRoute(startName, endName) {
        const path = this.findPath(startName, endName);
        if (!path) return null;

        const coordinates = path.map(name => this.graph[name].coords);

        let totalDistance = 0;
        for (let i = 0; i < coordinates.length - 1; i++) {
            totalDistance += this.calculateDistance(
                coordinates[i].lat, coordinates[i].lng,
                coordinates[i + 1].lat, coordinates[i + 1].lng
            );
        }

        return {
            path,
            coordinates,
            distance: Math.round(totalDistance),          // meters
            walkingTime: Math.ceil(totalDistance / 1.4 / 60) // minutes at 1.4 m/s
        };
    }

    // Returns all location names and their coordinates
    getAllLocations() {
        return Object.entries(this.graph).map(([name, data]) => ({
            name,
            lat: data.coords.lat,
            lng: data.coords.lng,
            connections: data.connections
        }));
    }

    // Case-insensitive partial name match — returns the exact graph key or null
    fuzzyMatch(query) {
        if (!query) return null;
        const q = query.toLowerCase().trim();

        // Exact match first
        const exact = Object.keys(this.graph).find(k => k.toLowerCase() === q);
        if (exact) return exact;

        // Partial match
        const partial = Object.keys(this.graph).find(k => k.toLowerCase().includes(q));
        return partial || null;
    }
}

module.exports = new CampusRouter();
