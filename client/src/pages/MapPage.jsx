import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { useGetCampusLocationsQuery } from '../redux/api/campusApi'
import CampusMap from '../components/map/CampusMap'
import SearchBar from '../components/map/SearchBar'
import ChatBot   from '../components/map/ChatBot'

export default function MapPage() {
  const navigate  = useNavigate()
  const { data, isLoading } = useGetCampusLocationsQuery()
  const locations = data?.locations || []
  const route     = useSelector((s) => s.map.route)

  /* ─── shared route-steps block ─── */
  const routeStepsBlock = route?.path && (
    <div className="px-4 py-3 border-b border-border bg-secondary/5 flex-shrink-0">
      <p className="text-[11px] font-semibold text-text-muted uppercase tracking-wider mb-2.5">Route Steps</p>
      {route.path.map((stop, i) => (
        <div key={i} className="flex items-stretch gap-3">
          <div className="flex flex-col items-center">
            <div className={`w-2.5 h-2.5 rounded-full ring-2 flex-shrink-0 mt-0.5 ${
              i === 0                       ? 'bg-success ring-success/20'
              : i === route.path.length - 1 ? 'bg-error   ring-error/20'
              :                               'bg-secondary ring-secondary/20'
            }`} />
            {i < route.path.length - 1 && (
              <div className="w-px flex-1 bg-border my-0.5" style={{ minHeight: 14 }} />
            )}
          </div>
          <p className={`text-xs pb-1.5 ${
            i === 0 || i === route.path.length - 1
              ? 'font-semibold text-text-primary'
              : 'text-text-secondary'
          }`}>{stop}</p>
        </div>
      ))}
    </div>
  )

  /* ─── loading overlay ─── */
  const loadingOverlay = (
    <div className="w-full h-full flex items-center justify-center bg-[#0d1117]">
      <div className="text-center">
        <div className="relative w-16 h-16 mx-auto mb-5">
          <div className="absolute inset-0 rounded-full border-4 border-secondary/20" />
          <div className="absolute inset-0 rounded-full border-4 border-t-secondary border-r-transparent border-b-transparent border-l-transparent animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center text-xl">🗺️</div>
        </div>
        <p className="text-white font-semibold text-sm font-heading">Loading Campus Map</p>
        <p className="text-text-muted text-xs mt-1">SRM Trichy · Please wait</p>
      </div>
    </div>
  )

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#0d1117]">

      {/* ══ MAP — single instance, pushed right on desktop ══ */}
      <div className="absolute inset-0 md:left-[340px]">
        {isLoading ? loadingOverlay : <CampusMap locations={locations} />}
      </div>

      {/* ══ DESKTOP sidebar (≥ md) ══════════════════════════ */}
      <div className="hidden md:flex absolute left-0 top-0 bottom-0 w-[340px] z-10 bg-[#0d1117] border-r border-border flex-col shadow-nav">

        {/* Brand header */}
        <div className="flex items-center gap-4 px-5 py-4 border-b border-border flex-shrink-0">
          <button
            onClick={() => navigate('/')}
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-surface-2 border border-border text-text-secondary hover:text-text-primary hover:bg-primary/10 transition-colors flex-shrink-0"
          >
            <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
          </button>
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-secondary/15 flex items-center justify-center flex-shrink-0">
              <span className="text-lg leading-none">🧭</span>
            </div>
            <div className="min-w-0">
              <div className="text-sm font-bold text-text-primary font-heading leading-tight">CampusGo</div>
              <div className="text-[11px] text-text-muted leading-tight truncate">SRM Trichy Navigation</div>
            </div>
          </div>
          <div className="ml-auto flex items-center gap-1.5 bg-success/10 text-success text-[11px] font-semibold px-2.5 py-1 rounded-full flex-shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
            Live
          </div>
        </div>

        {/* Search */}
        <div className="px-4 py-3 border-b border-border flex-shrink-0">
          <SearchBar locations={locations} embedded />
        </div>

        {routeStepsBlock}
      </div>

      {/* ══ MOBILE top bar (< md) ═══════════════════════════ */}
      <div className="md:hidden absolute top-0 left-0 right-0 z-40 flex items-center gap-3 px-4 py-3 bg-[#0d1117] border-b border-border">
        <button
          onClick={() => navigate('/')}
          className="w-8 h-8 flex items-center justify-center rounded-xl bg-surface-2 border border-border text-text-secondary hover:text-text-primary transition-colors flex-shrink-0"
        >
          <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
        </button>
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-secondary/15 flex items-center justify-center flex-shrink-0">
            <span className="text-sm leading-none">🧭</span>
          </div>
          <div className="min-w-0">
            <div className="text-sm font-bold text-text-primary font-heading leading-tight">CampusGo</div>
            <div className="text-[11px] text-text-muted leading-tight truncate">SRM Trichy</div>
          </div>
        </div>
        <div className="ml-auto flex items-center gap-1.5 bg-success/10 text-success text-[11px] font-semibold px-2 py-1 rounded-full flex-shrink-0">
          <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
          Live
        </div>
      </div>

      {/* ══ MOBILE bottom sheet (< md) — search only ══ */}
      <div className="md:hidden absolute bottom-0 left-0 right-0 z-40 bg-[#161b22] rounded-t-2xl border-t border-border shadow-nav">
        {/* Visual handle bar */}
        <div className="flex justify-center pt-2.5 pb-1">
          <div className="w-10 h-1 rounded-full bg-border" />
        </div>

        {/* Search inputs — dropUp so list opens above the sheet */}
        <div className="px-4 pb-5">
          <SearchBar locations={locations} embedded dropUp />
        </div>
      </div>

      {/* ChatBot */}
      <ChatBot />
    </div>
  )
}
