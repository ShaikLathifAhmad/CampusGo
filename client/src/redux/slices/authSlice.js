import { createSlice } from '@reduxjs/toolkit'

const token = localStorage.getItem('campusgo_token')
const user  = JSON.parse(localStorage.getItem('campusgo_user') || 'null')

const initialState = {
  user,
  token,
  isAuthenticated: !!token,
  error: null,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      state.user            = action.payload.user
      state.token           = action.payload.token
      state.isAuthenticated = true
      state.error           = null
      localStorage.setItem('campusgo_token', action.payload.token)
      localStorage.setItem('campusgo_user',  JSON.stringify(action.payload.user))
    },
    logout: (state) => {
      state.user            = null
      state.token           = null
      state.isAuthenticated = false
      localStorage.removeItem('campusgo_token')
      localStorage.removeItem('campusgo_user')
    },
    setError: (state, action) => { state.error = action.payload },
    clearError: (state) => { state.error = null },
  },
})

export const { setCredentials, logout, setError, clearError } = authSlice.actions
export default authSlice.reducer
