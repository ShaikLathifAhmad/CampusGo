from flask import Flask, jsonify, request
from flask_cors import CORS
import networkx as nx
import re
import os
from datetime import datetime
from functools import wraps
from logger import security_logger
from abuse_protection import abuse_protection

app = Flask(__name__)

# Security: Configure CORS with allowed origins
allowed_origins = os.getenv('ALLOWED_ORIGINS', 'http://localhost:3000,http://localhost:5173,http://127.0.0.1:5173').split(',')
CORS(app, origins=allowed_origins, supports_credentials=True)

# Security: Disable debug mode in production
app.config['DEBUG'] = os.getenv('FLASK_DEBUG', 'False') == 'True'
app.config['ENV'] = os.getenv('FLASK_ENV', 'production')

def rate_limit(f):
    """Rate limiting decorator"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        ip = request.remote_addr
        path = request.path
        
        result = abuse_protection.check_api_rate_limit(ip, path)
        
        if not result['allowed']:
            return jsonify({
                'error': result['reason'],
                'retry_after': result.get('retry_after')
            }), 429
        
        return f(*args, **kwargs)
    return decorated_function

def ai_rate_limit(f):
    """AI-specific rate limiting decorator"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        ip = request.remote_addr
        
        result = abuse_protection.check_ai_request(ip)
        
        if not result['allowed']:
            return jsonify({
                'error': result['reason'],
                'retry_after': result.get('retry_after')
            }), 429
        
        return f(*args, **kwargs)
    return decorated_function

def bot_detection(f):
    """Bot detection decorator"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        ip = request.remote_addr
        
        # Check if IP is blocked
        if abuse_protection.is_blocked(ip):
            security_logger.security_logger.warning(
                f"Blocked IP attempted access: {ip} - {request.path}"
            )
            return jsonify({
                'error': 'Access denied. Your IP has been blocked due to suspicious activity.'
            }), 403
        
        # Detect bots
        bot_check = abuse_protection.detect_bot(request)
        if bot_check['is_bot'] and bot_check['confidence'] == 'high':
            security_logger.security_logger.warning(
                f"Bot access blocked: {ip} - {bot_check['reason']}"
            )
            return jsonify({
                'error': 'Automated access detected. Please use the application through a web browser.'
            }), 403
        
        return f(*args, **kwargs)
    return decorated_function

def log_request(f):
    """Request logging decorator"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        start_time = datetime.now()
        ip = request.remote_addr
        
        try:
            response = f(*args, **kwargs)
            duration = (datetime.now() - start_time).total_seconds() * 1000
            
            status_code = response[1] if isinstance(response, tuple) else 200
            security_logger.log_request(
                request.path, 
                request.method, 
                ip, 
                status_code,
                duration
            )
            
            return response
        except Exception as e:
            security_logger.log_error(request.path, e, ip)
            raise
    
    return decorated_function

def validate_input(f):
    """Input validation decorator"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if request.method == 'POST':
            data = request.get_json()
            
            if not data:
                security_logger.log_suspicious_activity(
                    'Empty POST request',
                    request.remote_addr,
                    {'endpoint': request.path}
                )
                return jsonify({'error': 'Invalid request data'}), 400
            
            # Check for suspicious patterns
            data_str = str(data)
            suspicious_patterns = [
                r'<script', r'javascript:', r'onerror=', r'onload=',
                r'eval\(', r'exec\(', r'__import__', r'subprocess'
            ]
            
            for pattern in suspicious_patterns:
                if re.search(pattern, data_str, re.IGNORECASE):
                    security_logger.log_suspicious_activity(
                        'Potential injection attempt',
                        request.remote_addr,
                        {'pattern': pattern, 'endpoint': request.path}
                    )
                    return jsonify({'error': 'Invalid input detected'}), 400
        
        return f(*args, **kwargs)
    
    return decorated_function

# Graph representation of the campus
G = nx.Graph()

# Add nodes with real coordinates
G.add_node("main_gate", pos=(10.95137, 78.74544))
G.add_node("admin_block", pos=(10.95500, 78.75200))
G.add_node("library", pos=(10.95746, 78.75984))
G.add_node("canteen", pos=(10.95300, 78.75000))

# Add edges (paths)
G.add_edge("main_gate", "admin_block", weight=0.5)
G.add_edge("admin_block", "library", weight=0.3)
G.add_edge("admin_block", "canteen", weight=0.2)
G.add_edge("canteen", "library", weight=0.4)

# Campus Knowledge Base
CAMPUS_INFO = {
    # Locations
    "main gate": {
        "description": "The main entrance to SRM Trichy campus",
        "timings": "Open 24/7",
        "coordinates": "10.95387, 78.75856",
        "marker_name": "Main Gate"
    },
    "library": {
        "description": "Medical College Library with extensive collection of books and digital resources",
        "timings": "8:00 AM - 8:00 PM (Mon-Sat), 9:00 AM - 5:00 PM (Sun)",
        "facilities": "Reading rooms, computer lab, digital library, study areas",
        "location": "Near Medical College",
        "marker_name": "Medical college library"
    },
    "hospital": {
        "description": "SRM Hospital - Multi-specialty teaching hospital",
        "timings": "24/7 Emergency Services, OPD: 9:00 AM - 5:00 PM",
        "facilities": "Emergency care, OPD, diagnostic services, pharmacy",
        "contact": "+91 431 225 8000",
        "marker_name": "Srm hospital"
    },
    "college": {
        "description": "All colleges in SRM Trichy open at 9:00 AM and close at 5:00 PM, working from Monday to Friday.",
        "timings": "9:00 AM - 5:00 PM (Monday to Friday)"
    },
    "srm ist": {
        "description": "SRM Institute of Science & Technology - Premier engineering institution",
        "timings": "9:00 AM - 5:00 PM (Monday to Friday)",
        "marker_name": "SRM IST"
    },
    "trp": {
        "description": "SRM TRP Engineering College",
        "timings": "9:00 AM - 5:00 PM (Monday to Friday)",
        "marker_name": "Srm TRP engineering college"
    },
    "trp engineering": {
        "description": "SRM TRP Engineering College",
        "timings": "9:00 AM - 5:00 PM (Monday to Friday)",
        "marker_name": "Srm TRP engineering college"
    },
    "medical college": {
        "description": "SRM Medical College offering MBBS and postgraduate programs",
        "timings": "9:00 AM - 5:00 PM (Monday to Friday)",
        "marker_name": "Srm medical college"
    },
    "arts and science": {
        "description": "SRM Arts and Science College",
        "timings": "9:00 AM - 5:00 PM (Monday to Friday)",
        "marker_name": "Srm arts and science college"
    },
    "hotel management": {
        "description": "SRM Institute of Hotel Management",
        "timings": "9:00 AM - 5:00 PM (Monday to Friday)",
        "marker_name": "Srm instuite of hotel management"
    },
    "nursing college": {
        "description": "SRM College of Nursing",
        "timings": "9:00 AM - 5:00 PM (Monday to Friday)",
        "marker_name": "SRM College of Nursing"
    },
    "hostel": {
        "description": "Separate hostels for boys and girls with modern amenities",
        "facilities": "Wi-Fi, mess, common rooms, gym, laundry",
        "timings": "Gates close at 10:00 PM",
        "marker_name": "G Block Hostel"
    },
    "canteen": {
        "description": "Multiple food courts and canteens across campus",
        "timings": "9:00 AM - 7:30 PM",
        "options": "South Indian, North Indian, Chinese, snacks, beverages",
        "marker_name": "Basil Restaurant",
        "list": [
            {"name": "TRP Canteen", "location": "TRP Engineering Block", "timings": "9:00 AM - 7:30 PM"},
            {"name": "Main Canteen", "location": "Near Main Gate", "timings": "8:00 AM - 8:00 PM"},
            {"name": "Medical College Canteen", "location": "Medical College Block", "timings": "9:00 AM - 7:00 PM"},
            {"name": "Basil Restaurant", "location": "Near Hospital", "timings": "10:00 AM - 9:00 PM"},
            {"name": "Mr. Burger", "location": "Campus Center", "timings": "11:00 AM - 8:00 PM"},
            {"name": "Kaapi Cafe", "location": "Library Area", "timings": "9:00 AM - 6:00 PM"}
        ]
    },
    "gym": {
        "description": "Fitness center with modern equipment",
        "timings": "6:00 AM - 9:00 PM",
        "facilities": "Cardio equipment, weights, trainers available"
    },
    "auditorium": {
        "description": "Main auditorium for events and seminars",
        "capacity": "500+ seating capacity",
        "facilities": "AC, audio-visual equipment, stage",
        "marker_name": "Auditorium"
    },
    "sports ground": {
        "description": "Sports complex with multiple facilities",
        "facilities": "Cricket, football, basketball, volleyball, athletics track",
        "timings": "6:00 AM - 7:00 PM",
        "marker_name": "Play ground"
    },
    "atm": {
        "description": "ATM facilities available on campus",
        "banks": "SBI, ICICI, HDFC",
        "location": "Near main gate and hospital"
    },
    "basil": {
        "description": "Basil Restaurant - Popular dining spot on campus",
        "timings": "10:00 AM - 9:00 PM",
        "location": "Near Hospital",
        "marker_name": "Basil Restaurant"
    },
    "basil restaurant": {
        "description": "Basil Restaurant - Popular dining spot on campus",
        "timings": "10:00 AM - 9:00 PM",
        "location": "Near Hospital",
        "marker_name": "Basil Restaurant"
    },
    "parent visiting": {
        "description": "Parent visiting hours and guidelines",
        "hostel_visit": "Parents can visit student hostels to see their ward at any time",
        "campus_visit": "Parents wanting to visit the campus: 10:00 AM - 4:00 PM",
        "note": "No time restrictions for hostel visits to meet students"
    },
    "parents": {
        "description": "Parent visiting hours and guidelines",
        "hostel_visit": "Parents can visit student hostels to see their ward at any time",
        "campus_visit": "Parents wanting to visit the campus: 10:00 AM - 4:00 PM",
        "note": "No time restrictions for hostel visits to meet students"
    },
    "visiting hours": {
        "description": "Parent visiting hours and guidelines",
        "hostel_visit": "Parents can visit student hostels to see their ward at any time",
        "campus_visit": "Parents wanting to visit the campus: 10:00 AM - 4:00 PM",
        "note": "No time restrictions for hostel visits to meet students"
    }
}

# FAQ Responses
FAQ = {
    "admission": "For admission inquiries, please contact the admissions office at +91 431 225 8000 or visit www.srmtrichy.edu.in",
    "fees": "Fee structure varies by course. Please contact the accounts department or check the official website for detailed information.",
    "placement": "SRM Trichy has a dedicated placement cell. Companies like TCS, Infosys, Wipro, and many others recruit from campus.",
    "transport": "College buses are available from various parts of Trichy. Contact the transport office for routes and timings.",
    "wifi": "Wi-Fi is available across campus. Students can get credentials from the IT department.",
    "contact": "Main Office: +91 431 225 8000 | Email: info@srmtrichy.edu.in | Address: Tiruchirappalli-Chennai Highway, Trichy - 621105",
    "emergency": "For emergencies, contact: Security: +91 431 225 8001 | Hospital: +91 431 225 8002 | Ambulance: Available 24/7",
    "college timings": "All colleges in SRM Trichy open at 9:00 AM and close at 5:00 PM, working from Monday to Friday.",
    "college timing": "All colleges in SRM Trichy open at 9:00 AM and close at 5:00 PM, working from Monday to Friday.",
    "working hours": "All colleges in SRM Trichy open at 9:00 AM and close at 5:00 PM, working from Monday to Friday.",
    "timing": "All colleges in SRM Trichy open at 9:00 AM and close at 5:00 PM, working from Monday to Friday.",
    "college hours": "All colleges in SRM Trichy open at 9:00 AM and close at 5:00 PM, working from Monday to Friday.",
    "parent visit": "Parents can visit student hostels to see their ward at any time. For campus visits, the timings are 10:00 AM - 4:00 PM.",
    "parents visit": "Parents can visit student hostels to see their ward at any time. For campus visits, the timings are 10:00 AM - 4:00 PM.",
    "visitor": "Parents can visit student hostels to see their ward at any time. For campus visits, the timings are 10:00 AM - 4:00 PM."
}

def find_best_match(message, keywords_dict):
    """Find the best matching key from a dictionary based on message content"""
    message_lower = message.lower()
    for key in keywords_dict:
        if key in message_lower or any(word in message_lower for word in key.split()):
            return key
    return None

@app.route('/health', methods=['GET'])
@rate_limit
@log_request
@bot_detection
def health_check():
    return jsonify({"status": "healthy", "service": "AI Navigation Service"})

@app.route('/route', methods=['POST'])
@rate_limit
@ai_rate_limit
@log_request
@validate_input
@bot_detection
def get_route():
    data = request.json
    start = data.get('start')
    end = data.get('end')
    
    if not start or not end:
        return jsonify({"error": "Start and End locations required"}), 400
        
    try:
        path = nx.shortest_path(G, source=start, target=end, weight='weight')
        return jsonify({"path": path})
    except nx.NetworkXNoPath:
        return jsonify({"error": "No path found"}), 404
    except nx.NodeNotFound as e:
        return jsonify({"error": str(e)}), 404

@app.route('/chat', methods=['POST'])
@rate_limit
@ai_rate_limit
@log_request
@validate_input
@bot_detection
def chat():
    data = request.json
    message = data.get('message', '').strip()
    
    if not message:
        return jsonify({"response": "Please ask me something about the campus!"})
    
    # Validate message length
    if len(message) > 500:
        security_logger.log_suspicious_activity(
            'Excessive message length',
            request.remote_addr,
            {'length': len(message)}
        )
        return jsonify({"error": "Message too long. Maximum 500 characters."}), 400
    
    message_lower = message.lower()
    
    # Check for "all colleges" or "colleges in srm" queries
    if any(phrase in message_lower for phrase in ['all colleges', 'colleges in srm', 'list of colleges', 'which colleges', 'what colleges', 'colleges available']):
        college_list = [
            "SRM IST",
            "Srm TRP engineering college", 
            "Srm medical college",
            "Srm arts and science college",
            "Srm instuite of hotel management",
            "SRM College of Nursing"
        ]
        response = "🎓 Colleges in SRM Trichy:\n\n"
        response += "1. SRM Institute of Science & Technology (SRM IST)\n"
        response += "2. SRM TRP Engineering College\n"
        response += "3. SRM Medical College\n"
        response += "4. SRM Arts and Science College\n"
        response += "5. SRM Institute of Hotel Management\n"
        response += "6. SRM College of Nursing\n\n"
        response += "⏰ All colleges open at 9:00 AM and close at 5:00 PM, working from Monday to Friday."
        
        return jsonify({
            "response": response,
            "highlightMultipleLocations": college_list
        })
    
    # Check for facilities query
    if any(phrase in message_lower for phrase in ['facilities', 'what facilities', 'list facilities', 'available facilities', 'amenities', 'what amenities']):
        response = "🏢 Facilities Available in SRM Trichy:\n\n"
        response += "🎓 Academic:\n"
        response += "• 6 Colleges (Engineering, Medical, Arts & Science, Hotel Management, Nursing)\n"
        response += "• Medical College Library\n"
        response += "• Smart Classrooms & Labs\n\n"
        response += "🏥 Healthcare:\n"
        response += "• SRM Hospital (24/7 Emergency)\n"
        response += "• Medical Services\n\n"
        response += "🏠 Accommodation:\n"
        response += "• Boys Hostels (G Block, S Block, TRP, Medical)\n"
        response += "• Girls Hostels (Medical Girls Hostel)\n"
        response += "• Staff Quarters\n\n"
        response += "🍽️ Dining:\n"
        response += "• Multiple Canteens (TRP, Main, Medical College)\n"
        response += "• Basil Restaurant\n"
        response += "• Mr. Burger\n"
        response += "• Kaapi Cafe\n\n"
        response += "⚽ Sports & Recreation:\n"
        response += "• Sports Ground (Cricket, Football, Basketball, Volleyball)\n"
        response += "• Gym\n\n"
        response += "🎭 Others:\n"
        response += "• Auditorium\n"
        response += "• ATM (SBI, ICICI, HDFC)\n"
        response += "• Home Needs Store\n"
        response += "• Temple\n"
        response += "• Bus Stop\n"
        response += "• Parking\n\n"
        response += "Ask about any specific facility for more details!"
        
        return jsonify({"response": response})
    
    # Greetings
    if any(word in message_lower for word in ['hi', 'hello', 'hey', 'greetings']):
        return jsonify({"response": "Hello! I'm your campus guide. I can help you with:\n• Location information\n• Timings and facilities\n• Directions\n• Contact details\n• General campus queries\n\nWhat would you like to know?"})
    
    # Help/What can you do
    if any(phrase in message_lower for phrase in ['help', 'what can you', 'how can you', 'what do you']):
        return jsonify({"response": "I can help you with:\n✓ Finding locations (library, hospital, hostels, etc.)\n✓ Facility timings and information\n✓ Contact details\n✓ Admission and placement info\n✓ Emergency contacts\n\nJust ask me anything about the campus!"})
    
    # Check for location queries
    location_match = find_best_match(message, CAMPUS_INFO)
    if location_match:
        info = CAMPUS_INFO[location_match]
        response = f"📍 {location_match.title()}\n\n"
        response += f"{info['description']}\n\n"
        
        # Special handling for canteen to show list
        if location_match == "canteen" and 'list' in info:
            response += "🍽️ Available Canteens:\n\n"
            for canteen in info['list']:
                response += f"• {canteen['name']}\n"
                response += f"  📌 {canteen['location']}\n"
                response += f"  ⏰ {canteen['timings']}\n\n"
            response += f"🍴 Food Options: {info['options']}"
        # Special handling for parent visiting hours
        elif location_match in ["parent visiting", "parents", "visiting hours"] and 'hostel_visit' in info:
            response += f"🏠 Hostel Visits: {info['hostel_visit']}\n"
            response += f"🏫 Campus Visits: {info['campus_visit']}\n"
            if 'note' in info:
                response += f"\n💡 Note: {info['note']}"
        else:
            if 'timings' in info:
                response += f"⏰ Timings: {info['timings']}\n"
            if 'facilities' in info:
                response += f"🏢 Facilities: {info['facilities']}\n"
            if 'contact' in info:
                response += f"📞 Contact: {info['contact']}\n"
            if 'location' in info:
                response += f"📌 Location: {info['location']}\n"
        
        # Return response with location name for map highlighting
        return jsonify({
            "response": response,
            "highlightLocation": info.get('marker_name', location_match)
        })
    
    # Check for FAQ queries
    faq_match = find_best_match(message, FAQ)
    if faq_match:
        return jsonify({"response": FAQ[faq_match]})
    
    # Timing queries
    if any(word in message_lower for word in ['timing', 'time', 'open', 'close', 'hours']):
        return jsonify({"response": "Please specify which location you'd like timings for:\n• Library\n• Hospital\n• Canteen\n• Gym\n• Sports Ground\n• Hostel gates"})
    
    # Direction queries
    if any(word in message_lower for word in ['how to reach', 'how to get', 'direction', 'way to', 'route to']):
        return jsonify({"response": "I can help you find directions! Please use the map page to:\n1. Enter your starting location\n2. Enter your destination\n3. Click 'Get Route'\n\nOr tell me which location you want to reach!"})
    
    # Contact queries
    if any(word in message_lower for word in ['contact', 'phone', 'email', 'call']):
        return jsonify({"response": FAQ['contact']})
    
    # Emergency
    if any(word in message_lower for word in ['emergency', 'urgent', 'ambulance', 'security']):
        return jsonify({"response": FAQ['emergency']})
    
    # Default response with suggestions
    return jsonify({"response": "Sorry, I cannot answer this question. I can only help with campus-related queries like locations, timings, facilities, and contact information."})

if __name__ == '__main__':
    # Cleanup abuse protection periodically
    import threading
    def periodic_cleanup():
        while True:
            import time
            time.sleep(300)  # Every 5 minutes
            abuse_protection.cleanup()
    
    cleanup_thread = threading.Thread(target=periodic_cleanup, daemon=True)
    cleanup_thread.start()
    
    # Security: Configure for production
    host = os.getenv('HOST', '0.0.0.0')
    port = int(os.getenv('PORT', 5000))
    debug = os.getenv('FLASK_DEBUG', 'False') == 'True'
    
    # SSL/TLS configuration for HTTPS
    ssl_cert = os.getenv('SSL_CERT_PATH')
    ssl_key = os.getenv('SSL_KEY_PATH')
    
    if ssl_cert and ssl_key and os.path.exists(ssl_cert) and os.path.exists(ssl_key):
        import ssl
        context = ssl.SSLContext(ssl.PROTOCOL_TLSv1_2)
        context.load_cert_chain(ssl_cert, ssl_key)
        
        security_logger.app_logger.info(f'Starting HTTPS server on {host}:{port}')
        app.run(host=host, port=port, debug=debug, ssl_context=context)
    else:
        if os.getenv('FLASK_ENV') == 'production':
            security_logger.app_logger.warning('Running in production without HTTPS')
            print('⚠️  WARNING: Running in production without HTTPS. Configure SSL_CERT_PATH and SSL_KEY_PATH')
        
        security_logger.app_logger.info(f'Starting HTTP server on {host}:{port}')
        app.run(host=host, port=port, debug=debug)
