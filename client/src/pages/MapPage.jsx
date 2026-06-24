import { useNavigate } from 'react-router-dom'
import { useGetCampusLocationsQuery } from '../redux/api/campusApi'
import CampusMap from '../components/map/CampusMap'
import SearchBar from '../components/map/SearchBar'
import ChatBot   from '../components/map/ChatBot'

export default function MapPage() {
  const navigate = useNavigate()
  const { data, isLoading } = useGetCampusLocationsQuery()
  const locations = data?.locations || []

  return (
    <div className="relative w-screen h-screen overflow-hidden">

      {/* Full screen map */}
      <div className="absolute inset-0">
        {isLoading ? (
          <div className="w-full h-full flex items-center justify-center bg-primary-dark">
            <div className="text-center text-white">
              <svg className="animate-spin w-10 h-10 mx-auto mb-4 text-secondary" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
              <p className="text-text-muted text-sm">Loading campus map…</p>
            </div>
          </div>
        ) : (
          <CampusMap locations={locations} />
        )}
      </div>

      {/* Top bar */}
      <div className="absolute top-4 left-4 right-4 z-40 flex items-start gap-3 flex-wrap">
        {/* Back button */}
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 bg-surface/95 backdrop-blur border border-border text-text-primary text-sm font-semibold px-4 py-2.5 rounded-xl shadow-card hover:bg-surface-2 transition-colors flex-shrink-0"
        >
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          Back to Home
        </button>

        {/* Search bar */}
        <SearchBar locations={locations} />
      </div>

      {/* Chat bot */}
      <ChatBot />
    </div>
  )
}
