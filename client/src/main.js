import './style.css';
import MapService from './mapService';
import store from './store';
import { api } from './api';

// ===== CampusGo Frontend Script =====

// Helper function to add both click and touch events
function addButtonHandler(button, handler) {
  if (button) {
    button.addEventListener('click', handler);
    button.addEventListener('touchstart', handler);
  }
}

// Global function for Explore Campus button (called from onclick)
window.exploreCampus = function() {
  console.log('exploreCampus function called!');
  const landingContent = document.getElementById('landing-content');
  const mapContainer = document.getElementById('map-container');
  
  if (landingContent) landingContent.style.display = 'none';
  if (mapContainer) {
    mapContainer.style.display = 'block';
    if (!window.mapServiceInstance) {
      setTimeout(() => {
        initializeMap();
      }, 100);
    }
  }
};

const header = document.querySelector('.header');
const hamburger = document.querySelector('.hamburger');
const nav = document.querySelector('.nav');
const navBackdrop = document.getElementById('nav-backdrop');
const navLinks = document.querySelectorAll('.nav__link');
const reveals = document.querySelectorAll('.reveal');

// ===== HAMBURGER TOGGLE =====
if (hamburger && nav) {
  let isToggling = false;
  
  const toggleMenu = () => {
    if (isToggling) return;
    isToggling = true;
    
    hamburger.classList.toggle('open');
    nav.classList.toggle('open');
    if (navBackdrop) {
      navBackdrop.classList.toggle('active');
    }
    
    setTimeout(() => {
      isToggling = false;
    }, 400);
  };
  
  // Touch handler for mobile
  hamburger.addEventListener('touchstart', (e) => {
    e.preventDefault();
    console.log('Hamburger touched');
    toggleMenu();
  }, { passive: false });
  
  // Click handler for desktop (won't fire if touch already handled)
  hamburger.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleMenu();
  });
}

// Close menu when clicking backdrop
if (navBackdrop) {
  let isClosing = false;
  
  const closeMenu = () => {
    if (isClosing) return;
    isClosing = true;
    
    if (hamburger) hamburger.classList.remove('open');
    if (nav) nav.classList.remove('open');
    navBackdrop.classList.remove('active');
    
    setTimeout(() => {
      isClosing = false;
    }, 400);
  };
  
  navBackdrop.addEventListener('touchstart', (e) => {
    e.preventDefault();
    console.log('Backdrop touched');
    closeMenu();
  }, { passive: false });
  
  navBackdrop.addEventListener('click', (e) => {
    e.preventDefault();
    closeMenu();
  });
}

// Close mobile menu on link click
navLinks.forEach(link => {
  let isNavigating = false;
  
  const navigateToSection = () => {
    if (isNavigating) return;
    isNavigating = true;
    
    const href = link.getAttribute('href');
    if (href && href.startsWith('#')) {
      // Close mobile menu
      if (hamburger) hamburger.classList.remove('open');
      if (nav) nav.classList.remove('open');
      if (navBackdrop) navBackdrop.classList.remove('active');
      
      // Scroll to section
      const targetId = href.substring(1);
      const targetSection = document.getElementById(targetId);
      if (targetSection) {
        targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
    
    setTimeout(() => {
      isNavigating = false;
    }, 500);
  };
  
  // Touch handler for mobile
  link.addEventListener('touchstart', (e) => {
    e.preventDefault();
    console.log('Nav link touched');
    navigateToSection();
  }, { passive: false });
  
  // Click handler for desktop
  link.addEventListener('click', (e) => {
    e.preventDefault();
    navigateToSection();
  });
});

// ===== STICKY HEADER =====
window.addEventListener('scroll', () => {
  if (header) {
    if (window.scrollY > 60) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  }
});

// ===== ACTIVE NAV LINK ON SCROLL =====
const sections = document.querySelectorAll('section[id]');

function highlightNav() {
  const scrollY = window.scrollY + 100;
  sections.forEach(section => {
    const top = section.offsetTop;
    const height = section.offsetHeight;
    const id = section.getAttribute('id');
    const link = document.querySelector(`.nav__link[href="#${id}"]`);
    if (link) {
      if (scrollY >= top && scrollY < top + height) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    }
  });
}

window.addEventListener('scroll', highlightNav);

// ===== SCROLL REVEAL (Intersection Observer) =====
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, {
  threshold: 0.12,
  rootMargin: '0px 0px -40px 0px'
});

reveals.forEach(el => revealObserver.observe(el));

// ===== CONTACT FORM (prevent default) =====
const form = document.getElementById('contactForm');
if (form) {
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = form.querySelector('.btn-submit');
    btn.textContent = '✓ Message Sent!';
    btn.style.background = 'linear-gradient(135deg, #43a047, #2e7d32)';
    setTimeout(() => {
      btn.textContent = 'Send Message';
      btn.style.background = '';
      form.reset();
    }, 2500);
  });
}

// ===== LANDING PAGE CHATBOT =====
const chatToggleLanding = document.getElementById('chat-toggle-landing');
const chatWindowLanding = document.getElementById('chat-window-landing');
const chatInputLanding = document.getElementById('chat-input-field-landing');
const chatSendBtnLanding = document.getElementById('chat-send-btn-landing');
const messagesContainerLanding = document.getElementById('chat-messages-landing');

let isChatOpenLanding = false;

if (chatToggleLanding) {
  let landingChatTimeout = null;
  
  const toggleLandingChat = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    // Debounce to prevent double-trigger
    if (landingChatTimeout) return;
    
    landingChatTimeout = setTimeout(() => {
      landingChatTimeout = null;
    }, 300);
    
    isChatOpenLanding = !isChatOpenLanding;
    if (isChatOpenLanding) {
      chatWindowLanding.classList.add('open');
      chatToggleLanding.innerHTML = '✖';
    } else {
      chatWindowLanding.classList.remove('open');
      chatToggleLanding.innerHTML = '💬';
    }
  };
  
  chatToggleLanding.addEventListener('click', toggleLandingChat);
  chatToggleLanding.addEventListener('touchstart', toggleLandingChat, { passive: false });
}

const appendMessageLanding = (sender, text) => {
  const msgDiv = document.createElement('div');
  msgDiv.className = `message ${sender}`;
  msgDiv.textContent = text;
  messagesContainerLanding.appendChild(msgDiv);
  messagesContainerLanding.scrollTop = messagesContainerLanding.scrollHeight;
};

const handleSendMessageLanding = async () => {
  const text = chatInputLanding.value.trim();
  if (!text) return;
  appendMessageLanding('user', text);
  chatInputLanding.value = '';
  
  try {
    const response = await api.sendMessage(text);
    appendMessageLanding('bot', response.response);
  } catch (error) {
    appendMessageLanding('bot', 'Sorry, I encountered an error. Please try again.');
  }
};

if (chatSendBtnLanding) {
  addButtonHandler(chatSendBtnLanding, handleSendMessageLanding);
}

if (chatInputLanding) {
  chatInputLanding.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleSendMessageLanding();
  });
}

// Ensure social media links work properly
document.addEventListener('DOMContentLoaded', () => {
  const socialLinks = document.querySelectorAll('.footer__socials a');
  console.log('Found social links:', socialLinks.length);
  
  socialLinks.forEach((link, index) => {
    const href = link.getAttribute('href');
    console.log(`Social link ${index}:`, href);
    
    // Remove any existing event listeners by cloning
    const newLink = link.cloneNode(true);
    link.parentNode.replaceChild(newLink, link);
    
    // Add fresh click handler
    newLink.addEventListener('click', (e) => {
      console.log('Social link clicked:', href);
      // Let the browser handle external links normally
      if (href && (href.startsWith('http://') || href.startsWith('https://'))) {
        // Don't prevent default - let it open
        window.open(href, '_blank', 'noopener,noreferrer');
        e.preventDefault(); // Prevent the original link from also firing
      }
    }, { capture: true });
  });
});

// Handle quick query buttons for landing page
const handleQuickQueryLanding = (e) => {
  if (e.target.classList.contains('quick-query-btn') && e.target.closest('#chat-window-landing')) {
    const query = e.target.getAttribute('data-query');
    if (query) {
      appendMessageLanding('user', query);
      api.sendMessage(query).then(response => {
        appendMessageLanding('bot', response.response);
      }).catch(error => {
        appendMessageLanding('bot', 'Sorry, I encountered an error. Please try again.');
      });
    }
  }
};

document.addEventListener('click', handleQuickQueryLanding);
document.addEventListener('touchstart', handleQuickQueryLanding);

// ===== MAP INTEGRATION =====
const exploreCampusBtn = document.getElementById('explore-campus-btn');
const mapContainer = document.getElementById('map-container');
const landingContent = document.getElementById('landing-content');
const goBackBtn = document.getElementById('go-back-btn');

let mapService = null;

// Note: Explore Campus button uses onclick="window.exploreCampus()" in HTML
// This is more reliable for mobile than event listeners

// Go Back Button Handler
const goBackToLanding = (e) => {
  if (e) {
    e.preventDefault();
    e.stopPropagation();
  }
  
  console.log('Go Back button clicked!'); // Debug log
  
  // Hide map container
  if (mapContainer) {
    mapContainer.style.display = 'none';
  }
  
  // Show landing content
  if (landingContent) {
    landingContent.style.display = 'block';
  }
  
  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

if (goBackBtn) {
  // Mobile touch handler
  goBackBtn.addEventListener('touchstart', function(e) {
    e.preventDefault();
    e.stopPropagation();
    console.log('Go Back touch start detected');
    
    // Visual feedback
    this.style.transform = 'scale(0.95)';
    
    setTimeout(() => {
      this.style.transform = '';
      goBackToLanding(e);
    }, 150);
  }, { passive: false });
  
  // Desktop click handler
  addButtonHandler(goBackBtn, goBackToLanding);
}

function initializeMap() {
  if (window.mapServiceInstance) {
    console.log('Map already initialized');
    return;
  }
  
  mapService = new MapService('map');
  window.mapServiceInstance = mapService; // Store globally

  // Handle map resize when container size changes
  setTimeout(() => {
    if (mapService && mapService.map) {
      mapService.map.invalidateSize();
    }
  }, 100);

  const initialLocations = [
    { name: 'Main Gate', lat: 10.95387, lng: 78.75856, color: 'red', type: 'maingate' },
    { name: 'Srm hospital', lat: 10.95460, lng: 78.75531, type: 'hospital', color: 'blue' },
    { name: 'Medical college library', lat: 10.95305, lng: 78.75349,color: 'blue', type: 'library' },
    { name: 'Srm arts and science college', lat: 10.95223, lng: 78.75444,color: 'red', type: 'college' },
    { name: 'Srm instuite of hotel management', lat: 10.95162, lng: 78.75429,color: 'red', type: 'college' },
    { name: 'Srm medical college', lat: 10.95437, lng: 78.75366,color: 'blue', type: 'college' },
    { name: 'Srm TRP engineering college', lat: 10.95222, lng: 78.75250,color: 'red', type: 'college' },
    { name: 'SRM IST', lat: 10.95624, lng: 78.75421,color: 'red', type: 'college' },
    { name: 'G Block Hostel', lat: 10.95606, lng: 78.75037,color: 'green', size: 'small', type: 'hostel' },
    { name: 'S Block Hostel', lat: 10.95765, lng: 78.74937,color: 'green', size: 'small', type: 'hostel' },
    { name: 'TRP hostel', lat: 10.95299, lng: 78.75129,color: 'green', size: 'small', type: 'hostel' },
    { name: 'Medical boys hostel', lat: 10.95663, lng: 78.75179,color: 'green', size: 'small', type: 'hostel' },
    { name: 'Medical girls hostel', lat: 10.95697, lng: 78.75038,color: 'green', size: 'small', type: 'hostel' },
    { name: 'Basil Restaurant', lat: 10.95523, lng: 78.75398,color: 'yellow', size: 'small', type: 'restaurant' },
    { name: 'SRM College of Nursing', lat: 10.95490, lng: 78.75091,color: 'blue', type: 'college' },
    { name: 'Auditorium', lat: 10.95221, lng: 78.75811,color: 'red', type: 'auditorium' },
    { name: 'Staff quarters', lat: 10.95563, lng: 78.75174,color: 'green', size: 'small', type: 'quarters' },
    { name: 'Staff quaters 2', lat: 10.95668, lng: 78.7511,color: 'green', size: 'small', type: 'quarters' },
    { name: 'Play ground', lat: 10.9558, lng: 78.75271,color: 'red', size: 'small', type: 'playground' },
    { name: 'Home needs', lat: 10.95433, lng: 78.75713,color: 'blue', type: 'homeneeds' },
    { name: 'Temple', lat: 10.95480, lng: 78.75686,color: 'orange', type: 'temple' },
    { name: 'Temple', lat: 10.95282, lng: 78.75553,color: 'orange', type: 'temple' },
  ];

  store.getState().clearMarkers();
  initialLocations.forEach(loc => store.getState().addMarker(loc));

  const chatToggleBtn = document.getElementById('chat-toggle');
  const chatWindow = document.getElementById('chat-window');

  store.subscribe(state => {
    if (state.isChatOpen) {
      chatWindow.classList.add('open');
      chatToggleBtn.innerHTML = '✖';
    } else {
      chatWindow.classList.remove('open');
      chatToggleBtn.innerHTML = '💬';
      
      // Unhighlight locations when chat is closed
      if (mapService) {
        mapService.unhighlightLocation();
        mapService.unhighlightMultipleLocations();
      }
    }
  });

  // Fix for mobile - prevent double trigger
  let chatToggleTimeout = null;
  const toggleChat = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    // Debounce to prevent double-trigger
    if (chatToggleTimeout) return;
    
    chatToggleTimeout = setTimeout(() => {
      chatToggleTimeout = null;
    }, 300);
    
    store.getState().toggleChat();
  };

  chatToggleBtn.addEventListener('click', toggleChat);
  chatToggleBtn.addEventListener('touchstart', toggleChat, { passive: false });

  const chatInput = document.getElementById('chat-input-field');
  const chatSendBtn = document.getElementById('chat-send-btn');
  const messagesContainer = document.getElementById('chat-messages');

  const appendMessage = (sender, text) => {
    const msgDiv = document.createElement('div');
    msgDiv.className = `message ${sender}`;
    msgDiv.textContent = text;
    messagesContainer.appendChild(msgDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    store.getState().addMessage({ sender, text });
  };

  const handleSendMessage = async () => {
    const text = chatInput.value.trim();
    if (!text) return;
    appendMessage('user', text);
    chatInput.value = '';
    const response = await api.sendMessage(text);
    appendMessage('bot', response.response);
    
    // Highlight single location on map if provided
    if (response.highlightLocation && mapService) {
      mapService.highlightLocation(response.highlightLocation);
    }
    
    // Highlight multiple locations on map if provided
    if (response.highlightMultipleLocations && mapService) {
      mapService.highlightMultipleLocations(response.highlightMultipleLocations);
    }
  };

  addButtonHandler(chatSendBtn, handleSendMessage);
  chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleSendMessage();
  });

  // Handle quick query buttons for map page
  const handleQuickQueryMap = (e) => {
    if (e.target.classList.contains('quick-query-btn') && e.target.closest('#chat-window')) {
      const query = e.target.getAttribute('data-query');
      if (query) {
        appendMessage('user', query);
        api.sendMessage(query).then(response => {
          appendMessage('bot', response.response);
          
          // Highlight single location on map if provided
          if (response.highlightLocation && mapService) {
            mapService.highlightLocation(response.highlightLocation);
          }
          
          // Highlight multiple locations on map if provided
          if (response.highlightMultipleLocations && mapService) {
            mapService.highlightMultipleLocations(response.highlightMultipleLocations);
          }
        });
      }
    }
  };

  document.addEventListener('click', handleQuickQueryMap);
  document.addEventListener('touchstart', handleQuickQueryMap);

  const startInput = document.getElementById('start-input');
  const endInput = document.getElementById('end-input');
  const routeBtn = document.getElementById('route-btn');
  const clearRouteBtn = document.getElementById('clear-route-btn');

  // Create autocomplete datalists for location suggestions
  const startDatalist = document.createElement('datalist');
  startDatalist.id = 'start-locations';
  const endDatalist = document.createElement('datalist');
  endDatalist.id = 'end-locations';
  
  initialLocations.forEach(loc => {
    const startOption = document.createElement('option');
    startOption.value = loc.name;
    startDatalist.appendChild(startOption);
    
    const endOption = document.createElement('option');
    endOption.value = loc.name;
    endDatalist.appendChild(endOption);
  });
  
  document.body.appendChild(startDatalist);
  document.body.appendChild(endDatalist);
  
  startInput.setAttribute('list', 'start-locations');
  endInput.setAttribute('list', 'end-locations');

  addButtonHandler(routeBtn, async () => {
    const startQuery = startInput.value.trim().toLowerCase();
    const endQuery = endInput.value.trim().toLowerCase();
    
    console.log('Searching for route from:', startQuery, 'to:', endQuery);
    
    const locations = store.getState().markers;
    console.log('Available locations:', locations.map(l => l.name));
    
    const startLocation = locations.find(l => l.name.toLowerCase().includes(startQuery));
    const endLocation = locations.find(l => l.name.toLowerCase().includes(endQuery));

    console.log('Found start location:', startLocation);
    console.log('Found end location:', endLocation);

    if (startLocation && endLocation) {
      console.log('Drawing route from', startLocation.name, 'to', endLocation.name);
      try {
        mapService.drawRoute(startLocation, endLocation);
        clearRouteBtn.style.display = 'block';
      } catch (error) {
        console.error('Error drawing route:', error);
        appendMessage('bot', 'Error creating route. Please try again.');
        if (!store.getState().isChatOpen) store.getState().toggleChat();
      }
    } else {
      let errorMsg = '';
      if (!startLocation) errorMsg += `Start location "${startInput.value}" not found. `;
      if (!endLocation) errorMsg += `End location "${endInput.value}" not found.`;
      console.error('Location not found:', errorMsg);
      appendMessage('bot', errorMsg);
      if (!store.getState().isChatOpen) store.getState().toggleChat();
    }
  });

  // Clear route button handler
  addButtonHandler(clearRouteBtn, () => {
    mapService.clearRoute();
    startInput.value = '';
    endInput.value = '';
    clearRouteBtn.style.display = 'none';
  });

  mapService.addClickCallback((latlng) => {
    console.log("Clicked at", latlng);
  });
}
