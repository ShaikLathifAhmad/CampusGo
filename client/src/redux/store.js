import { configureStore } from '@reduxjs/toolkit'
import { campusApi } from './api/campusApi'
import mapReducer   from './slices/mapSlice'
import chatReducer  from './slices/chatSlice'
import authReducer  from './slices/authSlice'

export const store = configureStore({
  reducer: {
    map:  mapReducer,
    chat: chatReducer,
    auth: authReducer,
    [campusApi.reducerPath]: campusApi.reducer,
  },
  middleware: (getDefault) =>
    getDefault().concat(campusApi.middleware),
})
