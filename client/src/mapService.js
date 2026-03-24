import L from 'leaflet';
import store from './store';
import OpenRouteService from './openRouteService';

// Fix for Leaflet icons
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl,
    iconUrl,
    shadowUrl,
});

class MapService {
    constructor(elementId) {
        // New Campus Coordinates (SRM Trichy approx bounds)
        const southWest = L.latLng(10.95000, 78.74544);
        const northEast = L.latLng(10.96135, 78.75984);
        const bounds = L.latLngBounds(southWest, northEast);
        const center = bounds.getCenter();

        // Store initial view settings
        this.initialCenter = center;
        this.initialZoom = 16;

        this.map = L.map(elementId, {
            center: center,
            zoom: this.initialZoom,
            minZoom: 15,
            maxBounds: bounds,
            maxBoundsViscosity: 1.0,
            zoomControl: false  // Disable default zoom control
        });

        // Add custom zoom control to bottom-left
        L.control.zoom({
            position: 'bottomleft'
        }).addTo(this.map);

        const streetTiles = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        });

        const satelliteTiles = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
            attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EBP, and the GIS User Community'
        });

        const baseMaps = {
            "Satellite View": satelliteTiles,
            "Street View": streetTiles
        };

        // Set satellite as default
        satelliteTiles.addTo(this.map);

        // Add layer control
        L.control.layers(baseMaps).addTo(this.map);

        this.routeLayer = null;
        this.markerLayers = [];
        this.markerMap = new Map(); // Map to store marker references by location name
        this.highlightedMarker = null; // Track currently highlighted marker
        this.highlightedMarkers = []; // Track multiple highlighted markers
        this.openRouteService = new OpenRouteService('eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6IjA2OWYwYTI2YmFmOTQ4OTU4NDhmZDM1ZDc3MWFmZGNlIiwiaCI6Im11cm11cjY0In0=');

        // Subscribe to store changes
        store.subscribe((state) => this.updateMarkers(state.markers));
        store.subscribe((state) => this.drawRoute(state.route));

        // Handle window resize to fix map display issues
        window.addEventListener('resize', () => {
            this.map.invalidateSize();
        });
    }

    updateMarkers(markers) {
        // Clear existing markers
        this.markerLayers.forEach(layer => this.map.removeLayer(layer));
        this.markerLayers = [];
        this.markerMap.clear();

        // Helper to create standard icons
        const getIcon = (color, size) => {
            const isSmall = size === 'small';
            const iconUrl = `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`;
            const shadowUrl = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png';

            if (isSmall) {
                return new L.Icon({
                    iconUrl,
                    shadowUrl,
                    iconSize: [16, 26],
                    iconAnchor: [8, 26],
                    popupAnchor: [1, -22],
                    shadowSize: [26, 26]
                });
            } else {
                return new L.Icon({
                    iconUrl,
                    shadowUrl,
                    iconSize: [25, 41],
                    iconAnchor: [12, 41],
                    popupAnchor: [1, -34],
                    shadowSize: [41, 41]
                });
            }
        };

        // Helper to create university icon
        // Attribution: Univeristy icons created by nawicon - Flaticon
        const makeUniversityIcon = () => L.icon({
            iconUrl: '/university-icon.svg',
            iconSize: [32, 32],
            iconAnchor: [16, 32],
            popupAnchor: [0, -32]
        });

        // Special Campus.png icon for the attribution location
        const makeCampusIcon = () => L.icon({
            iconUrl: '/Campus.png',
            iconSize: [40, 40],
            iconAnchor: [20, 40],
            popupAnchor: [0, -40]
        });

        // Special hospital.png icon for hospital location
        const makeHospitalIcon = () => L.icon({
            iconUrl: '/hospital.png',
            iconSize: [40, 40],
            iconAnchor: [20, 40],
            popupAnchor: [0, -40]
        });

        // Special maingate.png icon for main gate location
        const makeMainGateIcon = () => L.icon({
            iconUrl: '/maingate.png',
            iconSize: [40, 40],
            iconAnchor: [20, 40],
            popupAnchor: [0, -40]
        });

        // Special Auditorium.png icon for auditorium location
        const makeAuditoriumIcon = () => L.icon({
            iconUrl: '/Auditorium.png',
            iconSize: [40, 40],
            iconAnchor: [20, 40],
            popupAnchor: [0, -40]
        });

        // Special library.png icon for library location
        const makeLibraryIcon = () => L.icon({
            iconUrl: '/library.png',
            iconSize: [40, 40],
            iconAnchor: [20, 40],
            popupAnchor: [0, -40]
        });

        // Special restaurant.png icon for restaurant location
        const makeRestaurantIcon = () => L.icon({
            iconUrl: '/restaurant.png',
            iconSize: [40, 40],
            iconAnchor: [20, 40],
            popupAnchor: [0, -40]
        });

        // Special ground.png icon for playground location
        const makeGroundIcon = () => L.icon({
            iconUrl: '/ground.png',
            iconSize: [40, 40],
            iconAnchor: [20, 40],
            popupAnchor: [0, -40]
        });

        // Special hostel.png icon for hostel locations
        const makeHostelIcon = () => L.icon({
            iconUrl: '/hostel.png',
            iconSize: [40, 40],
            iconAnchor: [20, 40],
            popupAnchor: [0, -40]
        });

        // Special quaters.png icon for staff quarters locations
        const makeQuartersIcon = () => L.icon({
            iconUrl: '/quaters.png',
            iconSize: [40, 40],
            iconAnchor: [20, 40],
            popupAnchor: [0, -40]
        });

        // Special homeneeds.png icon for Home needs location
        const makeHomeNeedsIcon = () => L.icon({
            iconUrl: '/homeneeds.png',
            iconSize: [40, 40],
            iconAnchor: [20, 40],
            popupAnchor: [0, -40]
        });

        // Special temple.png icon for Temple locations
        const makeTempleIcon = () => L.icon({
            iconUrl: '/temple.png',
            iconSize: [40, 40],
            iconAnchor: [20, 40],
            popupAnchor: [0, -40]
        });

        const mainGateIcon = makeUniversityIcon();
        const auditoriumIcon = makeUniversityIcon();
        const collegeIcon = makeUniversityIcon();
        const hospitalIcon = makeUniversityIcon();
        const libraryIcon = makeUniversityIcon();
        const hostelIcon = makeUniversityIcon();
        const restaurantIcon = makeUniversityIcon();
        const quartersIcon = makeUniversityIcon();
        const playgroundIcon = makeUniversityIcon();

        markers.forEach(m => {
            let icon;
            
            // Special case for Main Gate
            if (m.name === 'Main Gate') {
                icon = makeMainGateIcon();
            }
            // Special case for Auditorium
            else if (m.name === 'Auditorium') {
                icon = makeAuditoriumIcon();
            }
            // Special case for Medical college library
            else if (m.name === 'Medical college library') {
                icon = makeLibraryIcon();
            }
            // Special case for Basil Restaurant
            else if (m.name === 'Basil Restaurant') {
                icon = makeRestaurantIcon();
            }
            // Special case for Play ground
            else if (m.name === 'Play ground') {
                icon = makeGroundIcon();
            }
            // Special case for hostels
            else if (m.name === 'G Block Hostel' || m.name === 'S Block Hostel' || m.name === 'TRP hostel' || m.name === 'Medical boys hostel' || m.name === 'Medical girls hostel') {
                icon = makeHostelIcon();
            }
            // Special case for staff quarters
            else if (m.name === 'Staff quarters' || m.name === 'Staff quaters 2') {
                icon = makeQuartersIcon();
            }
            // Special case for Home needs
            else if (m.name === 'Home needs') {
                icon = makeHomeNeedsIcon();
            }
            // Special case for Temple
            else if (m.name === 'Temple') {
                if (m.type === 'temple-homeneeds') {
                    icon = makeHomeNeedsIcon();
                } else {
                    icon = makeTempleIcon();
                }
            }
            // Special case for hospital location
            else if (m.name === 'Srm hospital') {
                icon = makeHospitalIcon();
            }
            // Special case for college locations that should use Campus.png
            else if (m.name === 'SRM IST' || 
                m.name === 'Srm arts and science college' ||
                m.name === 'Srm instuite of hotel management' ||
                m.name === 'Srm medical college' ||
                m.name === 'Srm TRP engineering college' ||
                m.name === 'SRM College of Nursing') {
                icon = makeCampusIcon();
            }
            else if (m.type === 'maingate') { icon = mainGateIcon; }
            else if (m.type === 'auditorium') { icon = auditoriumIcon; }
            else if (m.type === 'college') { icon = collegeIcon; }
            else if (m.type === 'hospital') { icon = hospitalIcon; }
            else if (m.type === 'library') { icon = libraryIcon; }
            else if (m.type === 'hostel') { icon = hostelIcon; }
            else if (m.type === 'restaurant') { icon = restaurantIcon; }
            else if (m.type === 'quarters') { icon = quartersIcon; }
            else if (m.type === 'playground') { icon = playgroundIcon; }
            else {
                const color = m.color || 'red';
                icon = getIcon(color, m.size);
            }

            const marker = L.marker([m.lat, m.lng], { icon })
                .bindPopup(`<b>${m.name}</b><br>${m.description || ''}`)
                .addTo(this.map);
            this.markerLayers.push(marker);
            
            // Store marker reference by location name (lowercase for easy matching)
            this.markerMap.set(m.name.toLowerCase(), {
                marker: marker,
                location: m,
                originalIcon: icon
            });
        });
    }

    async drawRoute(startLocation, endLocation) {
        try {
            // Remove existing route and waypoint markers
            this.clearRoute();

            if (startLocation && endLocation) {
                console.log('Creating route from', startLocation.name, 'to', endLocation.name);
                console.log('Start coords:', startLocation.lat, startLocation.lng);
                console.log('End coords:', endLocation.lat, endLocation.lng);
                
                // Get route using OpenRouteService
                const route = await this.openRouteService.getRoute(
                    { lat: startLocation.lat, lng: startLocation.lng },
                    { lat: endLocation.lat, lng: endLocation.lng }
                );
                
                console.log('Route found:', route);
                
                // Create custom waypoint markers
                const startIcon = L.divIcon({
                    className: 'waypoint-marker',
                    html: `<div style="background: #10b981; color: white; padding: 8px 12px; border-radius: 20px; font-weight: 600; font-size: 12px; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4); white-space: nowrap;">Start: ${startLocation.name}</div>`,
                    iconSize: [null, null],
                    iconAnchor: [0, 0]
                });

                const endIcon = L.divIcon({
                    className: 'waypoint-marker',
                    html: `<div style="background: #ef4444; color: white; padding: 8px 12px; border-radius: 20px; font-weight: 600; font-size: 12px; box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4); white-space: nowrap;">End: ${endLocation.name}</div>`,
                    iconSize: [null, null],
                    iconAnchor: [0, 0]
                });

                // Add waypoint markers
                const startMarker = L.marker([startLocation.lat, startLocation.lng], { icon: startIcon }).addTo(this.map);
                const endMarker = L.marker([endLocation.lat, endLocation.lng], { icon: endIcon }).addTo(this.map);
                
                this.waypointMarkers = [startMarker, endMarker];
                console.log('Waypoint markers added');

                // Draw route line
                this.routeLine = L.polyline(route.coordinates, {
                    color: '#3b82f6',
                    weight: 6,
                    opacity: 0.9,
                    smoothFactor: 1
                }).addTo(this.map);
                
                console.log('Route line added with', route.coordinates.length, 'points');

                // Create route info box
                const RouteInfo = L.Control.extend({
                    onAdd: function() {
                        const div = L.DomUtil.create('div', 'route-info-box');
                        div.innerHTML = `
                            <div style="background: rgba(17, 24, 39, 0.95); backdrop-filter: blur(20px); padding: 1rem; border-radius: 12px; border: 1px solid rgba(255, 255, 255, 0.1); box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5); color: white; min-width: 200px;">
                                <div style="font-weight: 600; font-size: 1rem; margin-bottom: 0.5rem; color: #3b82f6;">Route Information</div>
                                <div style="font-size: 0.9rem; margin-bottom: 0.3rem;">
                                    <span style="color: rgba(255,255,255,0.7);">Distance:</span> 
                                    <span style="font-weight: 600;">${route.distance}m</span>
                                </div>
                                <div style="font-size: 0.9rem; margin-bottom: 0.3rem;">
                                    <span style="color: rgba(255,255,255,0.7);">Walking Time:</span> 
                                    <span style="font-weight: 600;">~${route.duration} min</span>
                                </div>
                                <div style="font-size: 0.85rem; margin-top: 0.5rem; padding-top: 0.5rem; border-top: 1px solid rgba(255,255,255,0.1); color: rgba(255,255,255,0.6);">
                                    Powered by OpenRouteService
                                </div>
                            </div>
                        `;
                        return div;
                    }
                });

                this.routeInfoBox = new RouteInfo({ position: 'topright' });
                this.routeInfoBox.addTo(this.map);
                console.log('Route info box added');

                // Fit bounds to show entire route
                this.map.fitBounds(this.routeLine.getBounds(), { padding: [80, 80] });
                
                console.log('Route displayed successfully');
            }
        } catch (error) {
            console.error('Error in drawRoute:', error);
            alert('Error creating route: ' + error.message + '. Please try again.');
        }
    }

    addClickCallback(callback) {
        this.map.on('click', (e) => {
            callback(e.latlng);
        });
    }

    async drawAllRoutesFromMainGate(mainGate, otherLocations) {
        try {
            // Clear any existing routes first
            this.clearAllRoutes();
            
            // Initialize array to store all route lines
            this.allRouteLines = [];
            this.allRouteMarkers = [];
            
            // Array of colors for different routes
            const colors = [
                '#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6',
                '#ec4899', '#14b8a6', '#f97316', '#06b6d4', '#6366f1',
                '#84cc16', '#a855f7', '#22c55e', '#eab308', '#0ea5e9',
                '#d946ef', '#f43f5e', '#facc15', '#2dd4bf', '#a78bfa', '#fb923c'
            ];
            
            let successCount = 0;
            let failCount = 0;
            
            // Process routes with delay to respect API rate limits
            for (let i = 0; i < otherLocations.length; i++) {
                const location = otherLocations[i];
                const color = colors[i % colors.length];
                
                try {
                    console.log(`Fetching route ${i + 1}/${otherLocations.length}: Main Gate → ${location.name}`);
                    
                    // Get route using OpenRouteService
                    const route = await this.openRouteService.getRoute(
                        { lat: mainGate.lat, lng: mainGate.lng },
                        { lat: location.lat, lng: location.lng }
                    );
                    
                    // Draw route line with unique color
                    const routeLine = L.polyline(route.coordinates, {
                        color: color,
                        weight: 4,
                        opacity: 0.7,
                        smoothFactor: 1
                    }).addTo(this.map);
                    
                    // Add popup to route line
                    routeLine.bindPopup(`
                        <div style="font-weight: 600; margin-bottom: 4px;">Main Gate → ${location.name}</div>
                        <div style="font-size: 0.85rem;">Distance: ${route.distance}m</div>
                        <div style="font-size: 0.85rem;">Time: ~${route.duration} min</div>
                    `);
                    
                    this.allRouteLines.push(routeLine);
                    successCount++;
                    
                    // Add small delay between requests to avoid rate limiting (40 requests/min = 1.5s delay)
                    if (i < otherLocations.length - 1) {
                        await new Promise(resolve => setTimeout(resolve, 1500));
                    }
                    
                } catch (error) {
                    console.error(`Failed to fetch route to ${location.name}:`, error);
                    failCount++;
                    // Continue with next location even if one fails
                }
            }
            
            console.log(`Routes displayed: ${successCount} successful, ${failCount} failed`);
            
            // Fit map to show all routes
            if (this.allRouteLines.length > 0) {
                const group = L.featureGroup(this.allRouteLines);
                this.map.fitBounds(group.getBounds(), { padding: [50, 50] });
            }
            
            return { successCount, failCount };
            
        } catch (error) {
            console.error('Error in drawAllRoutesFromMainGate:', error);
            throw error;
        }
    }

    clearAllRoutes() {
        // Clear all route lines
        if (this.allRouteLines && this.allRouteLines.length > 0) {
            this.allRouteLines.forEach(line => {
                if (this.map.hasLayer(line)) {
                    this.map.removeLayer(line);
                }
            });
            this.allRouteLines = [];
        }
        
        // Clear all route markers
        if (this.allRouteMarkers && this.allRouteMarkers.length > 0) {
            this.allRouteMarkers.forEach(marker => {
                if (this.map.hasLayer(marker)) {
                    this.map.removeLayer(marker);
                }
            });
            this.allRouteMarkers = [];
        }
        
        console.log('All routes cleared');
    }

    clearRoute() {
        // Remove route line
        if (this.routeLine) {
            this.map.removeLayer(this.routeLine);
            this.routeLine = null;
        }

        // Remove route markers
        if (this.routeMarkers) {
            this.routeMarkers.forEach(marker => this.map.removeLayer(marker));
            this.routeMarkers = [];
        }

        // Remove waypoint markers
        if (this.waypointMarkers) {
            this.waypointMarkers.forEach(marker => this.map.removeLayer(marker));
            this.waypointMarkers = [];
        }

        // Remove route info box
        if (this.routeInfoBox) {
            this.map.removeControl(this.routeInfoBox);
            this.routeInfoBox = null;
        }

        // Reset map to initial view with smooth animation
        this.map.setView(this.initialCenter, this.initialZoom, {
            animate: true,
            duration: 0.5
        });

        console.log('Route cleared and map reset to initial view');
    }

    highlightLocation(locationName) {
        // First, unhighlight any previously highlighted marker
        this.unhighlightLocation();
        
        // Find the marker by name (case-insensitive)
        const markerData = this.markerMap.get(locationName.toLowerCase());
        
        if (markerData) {
            const { marker, location, originalIcon } = markerData;
            
            // Create a larger, pulsing icon for highlighting
            const highlightIcon = L.divIcon({
                className: 'highlight-marker',
                html: `
                    <div style="
                        position: relative;
                        width: 60px;
                        height: 60px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                    ">
                        <div style="
                            position: absolute;
                            width: 100%;
                            height: 100%;
                            background: rgba(249, 168, 37, 0.3);
                            border-radius: 50%;
                            animation: pulse-highlight 1.5s ease-in-out infinite;
                        "></div>
                        <div style="
                            position: relative;
                            width: 40px;
                            height: 40px;
                            background: var(--clr-accent);
                            border-radius: 50%;
                            border: 3px solid white;
                            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            font-size: 20px;
                        ">📍</div>
                    </div>
                `,
                iconSize: [60, 60],
                iconAnchor: [30, 30],
                popupAnchor: [0, -30]
            });
            
            // Change the marker icon to highlighted version
            marker.setIcon(highlightIcon);
            
            // Open the popup
            marker.openPopup();
            
            // Zoom to the location with smooth animation
            this.map.flyTo([location.lat, location.lng], 18, {
                duration: 1.5,
                easeLinearity: 0.25
            });
            
            // Store reference to highlighted marker
            this.highlightedMarker = { marker, originalIcon };
            
            console.log('Highlighted location:', locationName);
            return true;
        }
        
        console.log('Location not found:', locationName);
        return false;
    }

    unhighlightLocation() {
        if (this.highlightedMarker) {
            const { marker, originalIcon } = this.highlightedMarker;
            
            // Restore original icon
            marker.setIcon(originalIcon);
            
            // Close popup
            marker.closePopup();
            
            this.highlightedMarker = null;
            console.log('Unhighlighted marker');
        }
    }

    highlightMultipleLocations(locationNames) {
        // First, unhighlight any previously highlighted markers
        this.unhighlightMultipleLocations();
        
        this.highlightedMarkers = [];
        const bounds = [];
        
        locationNames.forEach(locationName => {
            const markerData = this.markerMap.get(locationName.toLowerCase());
            
            if (markerData) {
                const { marker, location, originalIcon } = markerData;
                
                // Open the popup
                marker.openPopup();
                
                // Store reference
                this.highlightedMarkers.push({ marker, originalIcon });
                
                // Add to bounds
                bounds.push([location.lat, location.lng]);
            }
        });
        
        // Fit map to show all highlighted locations
        if (bounds.length > 0) {
            this.map.fitBounds(bounds, { 
                padding: [80, 80],
                maxZoom: 16,
                animate: true,
                duration: 1.5
            });
        }
        
        console.log('Highlighted multiple locations:', locationNames);
        return bounds.length > 0;
    }

    unhighlightMultipleLocations() {
        if (this.highlightedMarkers && this.highlightedMarkers.length > 0) {
            this.highlightedMarkers.forEach(({ marker, originalIcon }) => {
                // Close popup
                marker.closePopup();
            });
            
            this.highlightedMarkers = [];
            console.log('Unhighlighted multiple markers');
        }
    }

}

export default MapService;
