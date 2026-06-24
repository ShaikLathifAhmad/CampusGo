const { CAMPUS_INFO, FAQ, COLLEGE_LIST } = require('../services/chatKnowledge');
const logger = require('../utils/logger');
const rateLimiter = require('../middleware/rateLimiter');

// Find the first key in a dictionary whose words appear in the message
const findBestMatch = (message, dict) => {
    const lower = message.toLowerCase();
    for (const key of Object.keys(dict)) {
        if (lower.includes(key) || key.split(' ').some(word => lower.includes(word))) {
            return key;
        }
    }
    return null;
};

// Build a location info response string from a CAMPUS_INFO entry
const buildLocationResponse = (key, info) => {
    let response = `📍 ${key.charAt(0).toUpperCase() + key.slice(1)}\n\n${info.description}\n\n`;

    if (key === 'canteen' && info.list) {
        response += '🍽️ Available Canteens:\n\n';
        info.list.forEach(c => {
            response += `• ${c.name}\n  📌 ${c.location}\n  ⏰ ${c.timings}\n\n`;
        });
        response += `🍴 Food Options: ${info.options}`;
        return response;
    }

    if (['parent visiting', 'parents', 'visiting hours'].includes(key) && info.hostelVisit) {
        response += `🏠 Hostel Visits: ${info.hostelVisit}\n`;
        response += `🏫 Campus Visits: ${info.campusVisit}\n`;
        if (info.note) response += `\n💡 Note: ${info.note}`;
        return response;
    }

    if (info.timings)    response += `⏰ Timings: ${info.timings}\n`;
    if (info.facilities) response += `🏢 Facilities: ${info.facilities}\n`;
    if (info.contact)    response += `📞 Contact: ${info.contact}\n`;
    if (info.location)   response += `📌 Location: ${info.location}\n`;
    if (info.capacity)   response += `🪑 Capacity: ${info.capacity}\n`;
    if (info.banks)      response += `🏦 Banks: ${info.banks}\n`;

    return response;
};

exports.chat = (req, res) => {
    try {
        const aiRateCheck = rateLimiter.checkAIRequest(req.ip);
        if (!aiRateCheck.allowed) {
            return res.status(429).json({ error: aiRateCheck.reason, retryAfter: aiRateCheck.retryAfter });
        }

        const message = (req.body.message || '').trim();

        if (!message) {
            return res.json({ response: 'Please ask me something about the campus!' });
        }

        if (message.length > 500) {
            return res.status(400).json({ error: 'Message too long. Maximum 500 characters.' });
        }

        const lower = message.toLowerCase();

        // All colleges query
        if (['all colleges', 'colleges in srm', 'list of colleges', 'which colleges', 'what colleges', 'colleges available']
            .some(p => lower.includes(p))) {
            return res.json({
                response:
                    '🎓 Colleges in SRM Trichy:\n\n' +
                    '1. SRM Institute of Science & Technology (SRM IST)\n' +
                    '2. SRM TRP Engineering College\n' +
                    '3. SRM Medical College\n' +
                    '4. SRM Arts and Science College\n' +
                    '5. SRM Institute of Hotel Management\n' +
                    '6. SRM College of Nursing\n\n' +
                    '⏰ All colleges open at 9:00 AM and close at 5:00 PM, working from Monday to Friday.',
                highlightMultipleLocations: COLLEGE_LIST
            });
        }

        // Facilities / amenities query
        if (['facilities', 'what facilities', 'list facilities', 'available facilities', 'amenities', 'what amenities']
            .some(p => lower.includes(p))) {
            return res.json({
                response:
                    '🏢 Facilities Available in SRM Trichy:\n\n' +
                    '🎓 Academic:\n' +
                    '• 6 Colleges (Engineering, Medical, Arts & Science, Hotel Management, Nursing)\n' +
                    '• Medical College Library\n' +
                    '• Smart Classrooms & Labs\n\n' +
                    '🏥 Healthcare:\n' +
                    '• SRM Hospital (24/7 Emergency)\n' +
                    '• Medical Services\n\n' +
                    '🏠 Accommodation:\n' +
                    '• Boys Hostels (G Block, S Block, TRP, Medical)\n' +
                    '• Girls Hostels (Medical Girls Hostel)\n' +
                    '• Staff Quarters\n\n' +
                    '🍽️ Dining:\n' +
                    '• Multiple Canteens (TRP, Main, Medical College)\n' +
                    '• Basil Restaurant\n' +
                    '• Mr. Burger\n' +
                    '• Kaapi Cafe\n\n' +
                    '⚽ Sports & Recreation:\n' +
                    '• Sports Ground (Cricket, Football, Basketball, Volleyball)\n' +
                    '• Gym\n\n' +
                    '🎭 Others:\n' +
                    '• Auditorium\n' +
                    '• ATM (SBI, ICICI, HDFC)\n' +
                    '• Home Needs Store\n' +
                    '• Temple\n' +
                    '• Bus Stop\n' +
                    '• Parking\n\n' +
                    'Ask about any specific facility for more details!'
            });
        }

        // Greetings
        if (['hi', 'hello', 'hey', 'greetings'].some(w => lower.includes(w))) {
            return res.json({
                response:
                    "Hello! I'm your campus guide. I can help you with:\n" +
                    '• Location information\n• Timings and facilities\n• Directions\n• Contact details\n• General campus queries\n\n' +
                    'What would you like to know?'
            });
        }

        // Help query
        if (['help', 'what can you', 'how can you', 'what do you'].some(p => lower.includes(p))) {
            return res.json({
                response:
                    'I can help you with:\n' +
                    '✓ Finding locations (library, hospital, hostels, etc.)\n' +
                    '✓ Facility timings and information\n' +
                    '✓ Contact details\n' +
                    '✓ Admission and placement info\n' +
                    '✓ Emergency contacts\n\n' +
                    'Just ask me anything about the campus!'
            });
        }

        // Location match
        const locationKey = findBestMatch(message, CAMPUS_INFO);
        if (locationKey) {
            const info = CAMPUS_INFO[locationKey];
            return res.json({
                response: buildLocationResponse(locationKey, info),
                highlightLocation: info.markerName || locationKey
            });
        }

        // FAQ match
        const faqKey = findBestMatch(message, FAQ);
        if (faqKey) {
            return res.json({ response: FAQ[faqKey] });
        }

        // Timing fallback
        if (['timing', 'time', 'open', 'close', 'hours'].some(w => lower.includes(w))) {
            return res.json({
                response:
                    "Please specify which location you'd like timings for:\n" +
                    '• Library\n• Hospital\n• Canteen\n• Gym\n• Sports Ground\n• Hostel gates'
            });
        }

        // Direction fallback
        if (['how to reach', 'how to get', 'direction', 'way to', 'route to'].some(p => lower.includes(p))) {
            return res.json({
                response:
                    'I can help you find directions! Please use the map page to:\n' +
                    '1. Enter your starting location\n' +
                    '2. Enter your destination\n' +
                    '3. Click \'Get Route\'\n\n' +
                    'Or tell me which location you want to reach!'
            });
        }

        // Contact fallback
        if (['contact', 'phone', 'email', 'call'].some(w => lower.includes(w))) {
            return res.json({ response: FAQ['contact'] });
        }

        // Emergency fallback
        if (['emergency', 'urgent', 'ambulance', 'security'].some(w => lower.includes(w))) {
            return res.json({ response: FAQ['emergency'] });
        }

        // Default
        logger.info('Chat unmatched query', { ip: req.ip, message: message.substring(0, 50) });
        return res.json({
            response: 'Sorry, I cannot answer this question. I can only help with campus-related queries like locations, timings, facilities, and contact information.'
        });

    } catch (err) {
        logger.logApiError('POST /api/chat', err, { ip: req.ip });
        res.status(500).json({ error: 'Unable to process request' });
    }
};
