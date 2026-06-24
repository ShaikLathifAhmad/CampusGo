const CAMPUS_INFO = {
    'main gate': {
        description: 'The main entrance to SRM Trichy campus',
        timings: 'Open 24/7',
        coordinates: '10.95387, 78.75856',
        markerName: 'Main Gate'
    },
    'library': {
        description: 'Medical College Library with extensive collection of books and digital resources',
        timings: '8:00 AM - 8:00 PM (Mon-Sat), 9:00 AM - 5:00 PM (Sun)',
        facilities: 'Reading rooms, computer lab, digital library, study areas',
        location: 'Near Medical College',
        markerName: 'Medical college library'
    },
    'hospital': {
        description: 'SRM Hospital - Multi-specialty teaching hospital',
        timings: '24/7 Emergency Services, OPD: 9:00 AM - 5:00 PM',
        facilities: 'Emergency care, OPD, diagnostic services, pharmacy',
        contact: '+91 431 225 8000',
        markerName: 'Srm hospital'
    },
    'college': {
        description: 'All colleges in SRM Trichy open at 9:00 AM and close at 5:00 PM, working from Monday to Friday.',
        timings: '9:00 AM - 5:00 PM (Monday to Friday)'
    },
    'srm ist': {
        description: 'SRM Institute of Science & Technology - Premier engineering institution',
        timings: '9:00 AM - 5:00 PM (Monday to Friday)',
        markerName: 'SRM IST'
    },
    'trp': {
        description: 'SRM TRP Engineering College',
        timings: '9:00 AM - 5:00 PM (Monday to Friday)',
        markerName: 'Srm TRP engineering college'
    },
    'trp engineering': {
        description: 'SRM TRP Engineering College',
        timings: '9:00 AM - 5:00 PM (Monday to Friday)',
        markerName: 'Srm TRP engineering college'
    },
    'medical college': {
        description: 'SRM Medical College offering MBBS and postgraduate programs',
        timings: '9:00 AM - 5:00 PM (Monday to Friday)',
        markerName: 'Srm medical college'
    },
    'arts and science': {
        description: 'SRM Arts and Science College',
        timings: '9:00 AM - 5:00 PM (Monday to Friday)',
        markerName: 'Srm arts and science college'
    },
    'hotel management': {
        description: 'SRM Institute of Hotel Management',
        timings: '9:00 AM - 5:00 PM (Monday to Friday)',
        markerName: 'Srm instuite of hotel management'
    },
    'nursing college': {
        description: 'SRM College of Nursing',
        timings: '9:00 AM - 5:00 PM (Monday to Friday)',
        markerName: 'SRM College of Nursing'
    },
    'hostel': {
        description: 'Separate hostels for boys and girls with modern amenities',
        facilities: 'Wi-Fi, mess, common rooms, gym, laundry',
        timings: 'Gates close at 10:00 PM',
        markerName: 'G Block Hostel'
    },
    'canteen': {
        description: 'Multiple food courts and canteens across campus',
        timings: '9:00 AM - 7:30 PM',
        options: 'South Indian, North Indian, Chinese, snacks, beverages',
        markerName: 'Basil Restaurant',
        list: [
            { name: 'TRP Canteen', location: 'TRP Engineering Block', timings: '9:00 AM - 7:30 PM' },
            { name: 'Main Canteen', location: 'Near Main Gate', timings: '8:00 AM - 8:00 PM' },
            { name: 'Medical College Canteen', location: 'Medical College Block', timings: '9:00 AM - 7:00 PM' },
            { name: 'Basil Restaurant', location: 'Near Hospital', timings: '10:00 AM - 9:00 PM' },
            { name: 'Mr. Burger', location: 'Campus Center', timings: '11:00 AM - 8:00 PM' },
            { name: 'Kaapi Cafe', location: 'Library Area', timings: '9:00 AM - 6:00 PM' }
        ]
    },
    'gym': {
        description: 'Fitness center with modern equipment',
        timings: '6:00 AM - 9:00 PM',
        facilities: 'Cardio equipment, weights, trainers available'
    },
    'auditorium': {
        description: 'Main auditorium for events and seminars',
        capacity: '500+ seating capacity',
        facilities: 'AC, audio-visual equipment, stage',
        markerName: 'Auditorium'
    },
    'sports ground': {
        description: 'Sports complex with multiple facilities',
        facilities: 'Cricket, football, basketball, volleyball, athletics track',
        timings: '6:00 AM - 7:00 PM',
        markerName: 'Play ground'
    },
    'atm': {
        description: 'ATM facilities available on campus',
        banks: 'SBI, ICICI, HDFC',
        location: 'Near main gate and hospital'
    },
    'basil': {
        description: 'Basil Restaurant - Popular dining spot on campus',
        timings: '10:00 AM - 9:00 PM',
        location: 'Near Hospital',
        markerName: 'Basil Restaurant'
    },
    'basil restaurant': {
        description: 'Basil Restaurant - Popular dining spot on campus',
        timings: '10:00 AM - 9:00 PM',
        location: 'Near Hospital',
        markerName: 'Basil Restaurant'
    },
    'parent visiting': {
        description: 'Parent visiting hours and guidelines',
        hostelVisit: 'Parents can visit student hostels to see their ward at any time',
        campusVisit: 'Parents wanting to visit the campus: 10:00 AM - 4:00 PM',
        note: 'No time restrictions for hostel visits to meet students'
    },
    'parents': {
        description: 'Parent visiting hours and guidelines',
        hostelVisit: 'Parents can visit student hostels to see their ward at any time',
        campusVisit: 'Parents wanting to visit the campus: 10:00 AM - 4:00 PM',
        note: 'No time restrictions for hostel visits to meet students'
    },
    'visiting hours': {
        description: 'Parent visiting hours and guidelines',
        hostelVisit: 'Parents can visit student hostels to see their ward at any time',
        campusVisit: 'Parents wanting to visit the campus: 10:00 AM - 4:00 PM',
        note: 'No time restrictions for hostel visits to meet students'
    }
};

const FAQ = {
    'admission': 'For admission inquiries, please contact the admissions office at +91 431 225 8000 or visit www.srmtrichy.edu.in',
    'fees': 'Fee structure varies by course. Please contact the accounts department or check the official website for detailed information.',
    'placement': 'SRM Trichy has a dedicated placement cell. Companies like TCS, Infosys, Wipro, and many others recruit from campus.',
    'transport': 'College buses are available from various parts of Trichy. Contact the transport office for routes and timings.',
    'wifi': 'Wi-Fi is available across campus. Students can get credentials from the IT department.',
    'contact': 'Main Office: +91 431 225 8000 | Email: info@srmtrichy.edu.in | Address: Tiruchirappalli-Chennai Highway, Trichy - 621105',
    'emergency': 'For emergencies, contact: Security: +91 431 225 8001 | Hospital: +91 431 225 8002 | Ambulance: Available 24/7',
    'college timings': 'All colleges in SRM Trichy open at 9:00 AM and close at 5:00 PM, working from Monday to Friday.',
    'college timing': 'All colleges in SRM Trichy open at 9:00 AM and close at 5:00 PM, working from Monday to Friday.',
    'working hours': 'All colleges in SRM Trichy open at 9:00 AM and close at 5:00 PM, working from Monday to Friday.',
    'timing': 'All colleges in SRM Trichy open at 9:00 AM and close at 5:00 PM, working from Monday to Friday.',
    'college hours': 'All colleges in SRM Trichy open at 9:00 AM and close at 5:00 PM, working from Monday to Friday.',
    'parent visit': 'Parents can visit student hostels to see their ward at any time. For campus visits, the timings are 10:00 AM - 4:00 PM.',
    'parents visit': 'Parents can visit student hostels to see their ward at any time. For campus visits, the timings are 10:00 AM - 4:00 PM.',
    'visitor': 'Parents can visit student hostels to see their ward at any time. For campus visits, the timings are 10:00 AM - 4:00 PM.'
};

const COLLEGE_LIST = [
    'SRM IST',
    'Srm TRP engineering college',
    'Srm medical college',
    'Srm arts and science college',
    'Srm instuite of hotel management',
    'SRM College of Nursing'
];

module.exports = { CAMPUS_INFO, FAQ, COLLEGE_LIST };
