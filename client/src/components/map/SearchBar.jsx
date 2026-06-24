import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { setSelectedStart, setSelectedEnd, setRoute, clearRoute } from '../../redux/slices/mapSlice'
import { useGetCampusRouteMutation } from '../../redux/api/campusApi'

export default function SearchBar({ locations = [] }) {
  const dispatch  = useDispatch()
  const start     = useSelector((s) => s.map.selectedStart)
  const end       = useSelector((s) => s.map.selectedEnd)
  const route     = useSelector((s) => s.map.route)
  const [getRoute, { isLoading }] = useGetCampusRouteMutation()
  const [error,    setError]      = useState('')

  const locationNames = locations.map((l) => l.name)

  const handleGetRoute = async () => {
    if (!start.trim() || !end.trim()) {
      setError('Please enter both start and destination.')
      return
    }
    setError('')
    try {
      const result = await getRoute({ start, end }).unwrap()
      dispatch(setRoute(result))
    } catch (err) {
      setError(err?.data?.error || 'Could not find route. Try exact location names.')
    }
  }

  const handleClear = () => {
    dispatch(clearRoute())
    setError('')
  }

  return (
    <div className="bg-surface/95 backdrop-blur rounded-xl2 shadow-nav p-4 w-full max-w-sm">
      {/* Start input */}
      <div className="flex items-center gap-2 mb-2">
        <span className="w-3 h-3 rounded-full bg-success flex-shrink-0" />
        <input
          list="start-list"
          value={start}
          onChange={(e) => { dispatch(setSelectedStart(e.target.value)); setError('') }}
          placeholder="Start location"
          className="flex-1 text-sm bg-surface-2 border border-border rounded-xl px-3 py-2 text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-secondary/50"
        />
        <datalist id="start-list">
          {locationNames.map((n) => <option key={n} value={n} />)}
        </datalist>
      </div>

      {/* Divider */}
      <div className="flex items-center gap-2 mb-2">
        <div className="w-3 flex justify-center">
          <div className="w-0.5 h-4 bg-border" />
        </div>
      </div>

      {/* End input */}
      <div className="flex items-center gap-2 mb-3">
        <span className="w-3 h-3 rounded-full bg-error flex-shrink-0" />
        <input
          list="end-list"
          value={end}
          onChange={(e) => { dispatch(setSelectedEnd(e.target.value)); setError('') }}
          placeholder="Destination"
          className="flex-1 text-sm bg-surface-2 border border-border rounded-xl px-3 py-2 text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-secondary/50"
          onKeyDown={(e) => e.key === 'Enter' && handleGetRoute()}
        />
        <datalist id="end-list">
          {locationNames.map((n) => <option key={n} value={n} />)}
        </datalist>
      </div>

      {/* Error */}
      {error && <p className="text-xs text-error mb-2">{error}</p>}

      {/* Route info */}
      {route && (
        <div className="text-xs text-text-secondary bg-surface-2 rounded-xl px-3 py-2 mb-3 border border-border">
          📍 {route.path?.length} stops · 🚶 {route.walkingTime} min · {route.distance}m
        </div>
      )}

      {/* Buttons */}
      <div className="flex gap-2">
        <button
          onClick={handleGetRoute}
          disabled={isLoading}
          className="flex-1 flex items-center justify-center gap-1.5 bg-secondary text-white text-sm font-semibold py-2 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-60"
        >
          {isLoading ? (
            <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
          ) : (
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          )}
          {isLoading ? 'Finding...' : 'Get Route'}
        </button>

        {route && (
          <button
            onClick={handleClear}
            className="flex items-center justify-center gap-1 border border-border text-text-secondary text-sm py-2 px-3 rounded-xl hover:bg-surface-2 transition-colors"
          >
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
            Clear
          </button>
        )}
      </div>
    </div>
  )
}
