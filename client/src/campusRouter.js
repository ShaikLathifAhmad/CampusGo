// Simple Campus Routing System
// This creates a graph of campus locations and finds paths between them

class CampusRouter {
    constructor() {
        // Define campus graph with connections between locations
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
                coords: { lat: 10.95668, lng: 78.7511 }
            },
            'Play ground': {
                connections: ['Staff quarters', 'SRM IST'],
                coords: { lat: 10.9558, lng: 78.75271 }
            },
            'Home needs': {
                connections: ['SRM IST', 'Auditorium', 'Basil Restaurant'],
                coords: { lat: 10.95433, lng: 78.75713 }
            }
        };
    }

    // Calculate distance between two coordinates (in meters)
    calculateDistance(lat1, lng1, lat2, lng2) {
        const R = 6371e3; // Earth's radius in meters
        const φ1 = lat1 * Math.PI / 180;
        const φ2 = lat2 * Math.PI / 180;
        const Δφ = (lat2 - lat1) * Math.PI / 180;
        const Δλ = (lng2 - lng1) * Math.PI / 180;

        const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
                  Math.cos(φ1) * Math.cos(φ2) *
                  Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return R * c; // Distance in meters
    }

    // Find shortest path using BFS (Breadth-First Search)
    findPath(startName, endName) {
        if (!this.graph[startName] || !this.graph[endName]) {
            return null;
        }

        if (startName === endName) {
            return [startName];
        }

        const queue = [[startName]];
        const visited = new Set([startName]);

        while (queue.length > 0) {
            const path = queue.shift();
            const node = path[path.length - 1];

            if (node === endName) {
                return path;
            }

            const connections = this.graph[node].connections || [];
            for (const neighbor of connections) {
                if (!visited.has(neighbor)) {
                    visited.add(neighbor);
                    queue.push([...path, neighbor]);
                }
            }
        }

        return null; // No path found
    }

    // Get route with coordinates
    getRoute(startName, endName) {
        const path = this.findPath(startName, endName);
        
        if (!path) {
            return null;
        }

        const coordinates = path.map(name => this.graph[name].coords);
        
        // Calculate total distance
        let totalDistance = 0;
        for (let i = 0; i < coordinates.length - 1; i++) {
            const dist = this.calculateDistance(
                coordinates[i].lat, coordinates[i].lng,
                coordinates[i + 1].lat, coordinates[i + 1].lng
            );
            totalDistance += dist;
        }

        // Estimate walking time (average walking speed: 1.4 m/s or 5 km/h)
        const walkingTime = Math.ceil(totalDistance / 1.4 / 60); // in minutes

        return {
            path: path,
            coordinates: coordinates,
            distance: Math.round(totalDistance),
            walkingTime: walkingTime
        };
    }
}

export default CampusRouter;
