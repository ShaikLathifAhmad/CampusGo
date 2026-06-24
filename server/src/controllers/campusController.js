const campusRouter = require('../services/campusRouter');
const openRouteService = require('../services/openRouteService');
const logger = require('../utils/logger');

exports.getLocations = (req, res) => {
    try {
        const locations = campusRouter.getAllLocations();
        res.json({ count: locations.length, locations });
    } catch (err) {
        logger.logApiError('GET /api/campus/locations', err, { ip: req.ip });
        res.status(500).json({ error: 'Unable to fetch campus locations' });
    }
};

exports.getRoute = async (req, res) => {
    try {
        const { start, end } = req.body;

        if (!start || !end) {
            return res.status(400).json({ error: 'start and end location names are required' });
        }

        // Resolve names — accept exact or partial matches
        const resolvedStart = campusRouter.fuzzyMatch(start);
        const resolvedEnd = campusRouter.fuzzyMatch(end);

        if (!resolvedStart) {
            return res.status(404).json({ error: `Location not found: "${start}"`, hint: 'Use GET /api/campus/locations to see all valid names' });
        }
        if (!resolvedEnd) {
            return res.status(404).json({ error: `Location not found: "${end}"`, hint: 'Use GET /api/campus/locations to see all valid names' });
        }

        const bfsRoute = campusRouter.getRoute(resolvedStart, resolvedEnd);

        if (!bfsRoute) {
            return res.status(404).json({ error: `No path found between "${resolvedStart}" and "${resolvedEnd}"` });
        }

        // Try OpenRouteService for real road-following directions
        // Falls back to BFS graph route if ORS is unavailable or key not set
        let coordinates = bfsRoute.coordinates;
        let distance = bfsRoute.distance;
        let walkingTime = bfsRoute.walkingTime;
        let routeSource = 'campus-graph';

        if (process.env.ORS_API_KEY) {
            try {
                const startCoords = bfsRoute.coordinates[0];
                const endCoords = bfsRoute.coordinates[bfsRoute.coordinates.length - 1];
                const orsRoute = await openRouteService.getRoute(startCoords, endCoords);

                coordinates = orsRoute.coordinates;
                distance = orsRoute.distance;
                walkingTime = orsRoute.duration;
                routeSource = 'openrouteservice';
            } catch (orsErr) {
                logger.warn('ORS failed, using campus graph fallback', { error: orsErr.message, start: resolvedStart, end: resolvedEnd });
            }
        }

        logger.info('Campus route calculated', { ip: req.ip, start: resolvedStart, end: resolvedEnd, distance, routeSource });

        res.json({
            start: resolvedStart,
            end: resolvedEnd,
            path: bfsRoute.path,
            coordinates,
            distance,
            walkingTime,
            routeSource
        });
    } catch (err) {
        logger.logApiError('POST /api/campus/route', err, { ip: req.ip });
        res.status(500).json({ error: 'Unable to calculate campus route' });
    }
};

exports.searchLocation = (req, res) => {
    try {
        const { q } = req.query;

        if (!q || q.trim().length < 2) {
            return res.status(400).json({ error: 'Query must be at least 2 characters' });
        }

        const all = campusRouter.getAllLocations();
        const query = q.toLowerCase().trim();

        const results = all.filter(loc => loc.name.toLowerCase().includes(query));

        res.json({ count: results.length, results });
    } catch (err) {
        logger.logApiError('GET /api/campus/search', err, { ip: req.ip });
        res.status(500).json({ error: 'Search failed' });
    }
};
