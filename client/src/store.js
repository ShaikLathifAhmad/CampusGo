import { createStore } from 'zustand/vanilla';

// Initial State
const store = createStore((set) => ({
    userLocation: null,
    destination: null,
    route: [],
    markers: [],
    chatHistory: [
        { sender: 'bot', text: 'Hi! I am your campus guide. Ask me about locations or directions.' }
    ],
    isChatOpen: false,

    // Actions
    setUserLocation: (loc) => set({ userLocation: loc }),
    setDestination: (dest) => set({ destination: dest }),
    setRoute: (route) => set({ route }),
    addMarker: (marker) => set((state) => ({ markers: [...state.markers, marker] })),
    clearMarkers: () => set({ markers: [] }),
    addMessage: (msg) => set((state) => ({ chatHistory: [...state.chatHistory, msg] })),
    toggleChat: () => set((state) => ({ isChatOpen: !state.isChatOpen })),
}));

export default store;
