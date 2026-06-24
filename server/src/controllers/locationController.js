const Location = require('../model/Location');
const logger = require('../utils/logger');

exports.getLocations = async (req, res) => {
    try {
        const locations = await Location.find({ isPublic: true }).select('-__v');
        res.json(locations);
    } catch (err) {
        logger.logApiError('GET /api/locations', err, { ip: req.ip });
        res.status(500).json({ error: 'Unable to fetch locations' });
    }
};

exports.addLocation = async (req, res) => {
    try {
        const { name, lat, lng, description } = req.body;

        if (!name || typeof name !== 'string') {
            return res.status(400).json({ error: 'Invalid location name' });
        }
        if (!lat || !lng) {
            return res.status(400).json({ error: 'Coordinates are required' });
        }

        const parsedLat = parseFloat(lat);
        const parsedLng = parseFloat(lng);

        if (isNaN(parsedLat) || isNaN(parsedLng)) {
            return res.status(400).json({ error: 'Coordinates must be numbers' });
        }

        if (parsedLat < 10.94 || parsedLat > 10.97 || parsedLng < 78.74 || parsedLng > 78.77) {
            return res.status(400).json({ error: 'Coordinates outside campus area' });
        }

        const duplicate = await Location.findOne({
            name,
            lat: { $gte: parsedLat - 0.0001, $lte: parsedLat + 0.0001 },
            lng: { $gte: parsedLng - 0.0001, $lte: parsedLng + 0.0001 }
        });

        if (duplicate) {
            return res.status(409).json({ error: 'Location already exists' });
        }

        const location = await Location.create({
            name,
            lat: parsedLat,
            lng: parsedLng,
            description: description || '',
            createdBy: req.user?.id || null
        });

        res.status(201).json({ message: 'Location added successfully', location });
    } catch (err) {
        logger.logApiError('POST /api/locations', err, { ip: req.ip });
        res.status(500).json({ error: 'Unable to add location' });
    }
};

exports.updateLocation = async (req, res) => {
    try {
        const location = await Location.findById(req.params.id);

        if (!location) {
            return res.status(404).json({ error: 'Location not found' });
        }

        const { name, description, lat, lng } = req.body;

        if (name && name.length > 100) {
            return res.status(400).json({ error: 'Location name too long' });
        }
        if (description && description.length > 500) {
            return res.status(400).json({ error: 'Description too long' });
        }

        if (name) location.name = name;
        if (description !== undefined) location.description = description;
        if (lat) location.lat = parseFloat(lat);
        if (lng) location.lng = parseFloat(lng);

        await location.save();

        res.json({ message: 'Location updated successfully', location });
    } catch (err) {
        logger.logApiError('PUT /api/locations', err, { ip: req.ip });
        res.status(500).json({ error: 'Unable to update location' });
    }
};

exports.deleteLocation = async (req, res) => {
    try {
        const location = await Location.findByIdAndDelete(req.params.id);

        if (!location) {
            return res.status(404).json({ error: 'Location not found' });
        }

        res.json({ message: 'Location deleted successfully' });
    } catch (err) {
        logger.logApiError('DELETE /api/locations', err, { ip: req.ip });
        res.status(500).json({ error: 'Unable to delete location' });
    }
};
