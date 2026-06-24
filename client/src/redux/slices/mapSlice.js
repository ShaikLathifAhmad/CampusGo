import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  markers: [],
  route: null,
  selectedStart: '',
  selectedEnd: '',
  isMapVisible: false,
}

const mapSlice = createSlice({
  name: 'map',
  initialState,
  reducers: {
    setMarkers:       (state, action) => { state.markers = action.payload },
    setRoute:         (state, action) => { state.route = action.payload },
    clearRoute:       (state)         => { state.route = null; state.selectedStart = ''; state.selectedEnd = '' },
    setSelectedStart: (state, action) => { state.selectedStart = action.payload },
    setSelectedEnd:   (state, action) => { state.selectedEnd = action.payload },
    showMap:          (state)         => { state.isMapVisible = true },
    hideMap:          (state)         => { state.isMapVisible = false },
  },
})

export const {
  setMarkers, setRoute, clearRoute,
  setSelectedStart, setSelectedEnd,
  showMap, hideMap,
} = mapSlice.actions

export default mapSlice.reducer
