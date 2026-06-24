import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

const baseUrl = import.meta.env.VITE_API_BASE_URL || '/api'

export const campusApi = createApi({
  reducerPath: 'campusApi',
  baseQuery: fetchBaseQuery({
    baseUrl,
    prepareHeaders: (headers, { getState }) => {
      const token = getState().auth.token
      if (token) headers.set('Authorization', `Bearer ${token}`)
      return headers
    },
  }),
  tagTypes: ['Locations', 'User'],
  endpoints: (builder) => ({

    /* ── Campus locations ── */
    getCampusLocations: builder.query({
      query: () => '/campus/locations',
    }),
    searchCampusLocations: builder.query({
      query: (q) => `/campus/search?q=${q}`,
    }),
    getCampusRoute: builder.mutation({
      query: ({ start, end }) => ({
        url: '/campus/route',
        method: 'POST',
        body: { start, end },
      }),
    }),

    /* ── Custom locations ── */
    getCustomLocations: builder.query({
      query: () => '/locations',
      providesTags: ['Locations'],
    }),
    addCustomLocation: builder.mutation({
      query: (body) => ({ url: '/locations', method: 'POST', body }),
      invalidatesTags: ['Locations'],
    }),
    deleteCustomLocation: builder.mutation({
      query: (id) => ({ url: `/locations/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Locations'],
    }),

    /* ── Chat ── */
    sendChatMessage: builder.mutation({
      query: (message) => ({
        url: '/chat',
        method: 'POST',
        body: { message },
      }),
    }),

    /* ── Auth ── */
    login: builder.mutation({
      query: (body) => ({ url: '/auth/login', method: 'POST', body }),
    }),
    register: builder.mutation({
      query: (body) => ({ url: '/auth/register', method: 'POST', body }),
    }),
    getMe: builder.query({
      query: () => '/auth/me',
      providesTags: ['User'],
    }),
  }),
})

export const {
  useGetCampusLocationsQuery,
  useSearchCampusLocationsQuery,
  useGetCampusRouteMutation,
  useGetCustomLocationsQuery,
  useAddCustomLocationMutation,
  useDeleteCustomLocationMutation,
  useSendChatMessageMutation,
  useLoginMutation,
  useRegisterMutation,
  useGetMeQuery,
} = campusApi
