import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  messages: [
    { sender: 'bot', text: "Hello! I'm here to help you navigate the campus. Ask me anything!" }
  ],
  isOpen: false,
  isLoading: false,
  highlightLocation: null,
  highlightMultipleLocations: [],
}

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    addMessage:     (state, action) => { state.messages.push(action.payload) },
    toggleChat:     (state)         => { state.isOpen = !state.isOpen },
    openChat:       (state)         => { state.isOpen = true },
    closeChat:      (state)         => { state.isOpen = false },
    setLoading:     (state, action) => { state.isLoading = action.payload },
    setHighlight:   (state, action) => {
      state.highlightLocation = action.payload.single || null
      state.highlightMultipleLocations = action.payload.multiple || []
    },
    clearHighlight: (state) => {
      state.highlightLocation = null
      state.highlightMultipleLocations = []
    },
    clearMessages:  (state) => {
      state.messages = [
        { sender: 'bot', text: "Hello! I'm here to help you navigate the campus. Ask me anything!" }
      ]
    },
  },
})

export const {
  addMessage, toggleChat, openChat, closeChat,
  setLoading, setHighlight, clearHighlight, clearMessages,
} = chatSlice.actions

export default chatSlice.reducer
