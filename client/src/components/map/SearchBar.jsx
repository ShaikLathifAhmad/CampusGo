import { useState, useRef, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { setSelectedStart, setSelectedEnd, setRoute, clearRoute } from '../../redux/slices/mapSlice'
import { useGetCampusRouteMutation } from '../../redux/api/campusApi'

/* ── Custom styled dropdown ─────────────────────────────────── */
function LocationDropdown({ value, onChange, placeholder, locations, dropUp = false }) {
  const [open, setOpen]   = useState(false)
  const [query, setQuery] = useState(value || '')
  const ref = useRef(null)

  // Sync when value changes externally (e.g. swap button, location list click)
  useEffect(() => { setQuery(value || '') }, [value])

  // Close on outside click / touch
  useEffect(() => {
    const close = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', close)
    document.addEventListener('touchstart', close)
    return () => {
      document.removeEventListener('mousedown', close)
      document.removeEventListener('touchstart', close)
    }
  }, [])

  const filtered = query
    ? locations.filter((n) => n.toLowerCase().includes(query.toLowerCase()))
    : locations

  const handleInput = (e) => {
    setQuery(e.target.value)
    onChange(e.target.value)
    setOpen(true)
  }

  const handleSelect = (name) => {
    setQuery(name)
    onChange(name)
    setOpen(false)
    document.activeElement?.blur() // close mobile keyboard after selection
  }

  return (
    <div ref={ref} className="relative flex-1 min-w-0">

      {/* Input row */}
      <div className="flex items-center bg-surface-2 border border-border rounded-xl px-3 py-2 gap-2 focus-within:ring-2 focus-within:ring-secondary/40 focus-within:border-secondary/40 transition-all">
        <input
          value={query}
          onChange={handleInput}
          onFocus={() => setOpen(true)}
          placeholder={placeholder}
          className="flex-1 min-w-0 text-sm bg-transparent text-text-primary placeholder:text-text-muted focus:outline-none"
        />
        {/* Dropdown arrow toggle */}
        <button
          type="button"
          onPointerDown={(e) => { e.preventDefault(); setOpen((o) => !o) }}
          className="text-text-muted hover:text-secondary transition-colors flex-shrink-0 p-0.5"
        >
          <svg
            width="12" height="12" fill="currentColor" viewBox="0 0 20 20"
            className={`transition-transform duration-150 ${open ? 'rotate-180' : ''}`}
          >
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd"/>
          </svg>
        </button>
      </div>

      {/* Dropdown list */}
      {open && filtered.length > 0 && (
        <ul
          className={`absolute ${dropUp ? 'bottom-full mb-1' : 'top-full mt-1'} left-0 right-0 bg-[#1c2333] border border-border rounded-xl shadow-nav z-[200] max-h-56 overflow-y-auto`}
        >
          {filtered.map((name) => (
            <li key={name}>
              <button
                type="button"
                onPointerDown={(e) => { e.preventDefault(); handleSelect(name) }}
                className="w-full text-left px-4 py-2.5 text-sm text-text-primary hover:bg-white/5 active:bg-white/10 transition-colors border-b border-white/5 last:border-0"
              >
                {name}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

/* ── SearchBar ───────────────────────────────────────────────── */
export default function SearchBar({ locations = [], embedded = false, dropUp = false }) {
  const dispatch = useDispatch()
  const start    = useSelector((s) => s.map.selectedStart)
  const end      = useSelector((s) => s.map.selectedEnd)
  const route    = useSelector((s) => s.map.route)
  const [getRoute, { isLoading }] = useGetCampusRouteMutation()
  const [error, setError] = useState('')

  const locationNames = locations.map((l) => l.name)

  const handleStartChange = (v) => {
    if (v && end && v.trim().toLowerCase() === end.trim().toLowerCase()) {
      setError('Start and destination cannot be the same location.')
    } else {
      setError('')
    }
    dispatch(setSelectedStart(v))
  }

  const handleEndChange = (v) => {
    if (v && start && v.trim().toLowerCase() === start.trim().toLowerCase()) {
      setError('Start and destination cannot be the same location.')
    } else {
      setError('')
    }
    dispatch(setSelectedEnd(v))
  }

  const handleGetRoute = async () => {
    if (!start.trim() || !end.trim()) { setError('Please enter both start and destination.'); return }
    if (start.trim().toLowerCase() === end.trim().toLowerCase()) { setError('Start and destination cannot be the same location.'); return }
    setError('')
    try {
      const result = await getRoute({ start, end }).unwrap()
      dispatch(setRoute(result))
    } catch (err) {
      setError(err?.data?.error || 'Could not find route. Try exact location names.')
    }
  }

  const handleClear = () => { dispatch(clearRoute()); setError('') }

  const handleSwap = () => {
    const temp = start
    dispatch(setSelectedStart(end))
    dispatch(setSelectedEnd(temp))
    setError('')
  }

  /* ── Route-active view: compact summary replaces inputs ── */
  const routeView = route && (
    <div className="flex flex-col gap-2.5">

      {/* From → To */}
      <div className="flex items-center gap-2 px-1">
        <div className="flex flex-col items-center gap-0.5 flex-shrink-0">
          <span className="w-2 h-2 rounded-full bg-success" />
          <div className="w-px h-3 bg-border" />
          <span className="w-2 h-2 rounded-full bg-error" />
        </div>
        <div className="flex flex-col gap-0.5 min-w-0 flex-1">
          <p className="text-xs font-semibold text-text-primary truncate">{start}</p>
          <p className="text-xs text-text-muted truncate">{end}</p>
        </div>
        <button
          onClick={handleClear}
          title="Clear route"
          className="w-7 h-7 flex items-center justify-center rounded-lg border border-border text-text-muted hover:text-error hover:border-error/30 hover:bg-surface-2 transition-all flex-shrink-0"
        >
          <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>

      {/* Stats row */}
      <div className="flex items-center bg-secondary/10 border border-secondary/20 rounded-xl px-3 py-2.5 text-xs">
        <div className="flex items-center gap-1.5 text-text-secondary flex-1">
          <span className="text-base leading-none">📍</span>
          <span><span className="font-semibold text-text-primary">{route.path?.length}</span> stops</span>
        </div>
        <div className="w-px h-4 bg-border/60 mx-2" />
        <div className="flex items-center gap-1.5 text-text-secondary flex-1">
          <span className="text-base leading-none">🚶</span>
          <span><span className="font-semibold text-text-primary">{route.walkingTime}</span> min</span>
        </div>
        <div className="w-px h-4 bg-border/60 mx-2" />
        <div className="flex items-center gap-1.5 text-text-secondary flex-1">
          <span className="text-base leading-none">📏</span>
          <span><span className="font-semibold text-text-primary">{route.distance}</span>m</span>
        </div>
      </div>

      {/* Clear full button */}
      <button
        onClick={handleClear}
        className="w-full flex items-center justify-center gap-2 border border-border text-text-secondary text-sm font-medium py-2 rounded-xl hover:bg-surface-2 hover:text-error hover:border-error/30 transition-all"
      >
        <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
        Clear Route
      </button>
    </div>
  )

  /* ── Search inputs view ── */
  const searchView = !route && (
    <>
      <div className={embedded ? '' : 'px-4 pt-3 pb-2'}>

        {/* Start */}
        <div className="flex items-center gap-2.5">
          <span className="w-2.5 h-2.5 rounded-full bg-success ring-2 ring-success/25 flex-shrink-0" />
          <LocationDropdown
            value={start}
            onChange={handleStartChange}
            placeholder="Choose starting point…"
            locations={locationNames.filter((n) => n.toLowerCase() !== end.trim().toLowerCase())}
            dropUp={dropUp}
          />
        </div>

        {/* Connector + swap */}
        <div className="flex items-center my-1.5" style={{ paddingLeft: '5px' }}>
          <div className="flex flex-col gap-[3px]">
            <div className="w-px h-2 bg-border rounded-full mx-auto" />
            <div className="w-px h-2 bg-border rounded-full mx-auto" />
          </div>
          <div className="flex-1" />
          <button
            onClick={handleSwap}
            title="Swap start and destination"
            className="w-7 h-7 flex items-center justify-center rounded-lg border border-border bg-surface-2 text-text-muted hover:text-secondary hover:border-secondary/50 hover:bg-secondary/5 transition-all"
          >
            <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4"/>
            </svg>
          </button>
        </div>

        {/* End */}
        <div className="flex items-center gap-2.5">
          <span className="w-2.5 h-2.5 rounded-full bg-error ring-2 ring-error/25 flex-shrink-0" />
          <LocationDropdown
            value={end}
            onChange={handleEndChange}
            placeholder="Choose destination…"
            locations={locationNames.filter((n) => n.toLowerCase() !== start.trim().toLowerCase())}
            dropUp={dropUp}
          />
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2 mt-2.5">
            <svg width="13" height="13" fill="currentColor" className="text-error flex-shrink-0 mt-px" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
            </svg>
            <p className="text-xs text-error leading-snug">{error}</p>
          </div>
        )}
      </div>

      {/* Get Route button */}
      <div className={embedded ? 'mt-2.5' : 'px-4 pb-4 mt-2'}>
        <button
          onClick={handleGetRoute}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-2 bg-secondary text-white text-sm font-semibold py-2.5 rounded-xl hover:opacity-90 active:scale-[0.97] transition-all disabled:opacity-60"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
              Finding…
            </>
          ) : (
            <>
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"/>
              </svg>
              Get Route
            </>
          )}
        </button>
      </div>
    </>
  )

  const inner = route ? routeView : searchView

  /* Embedded (inside sidebar or bottom sheet — no card wrapper) */
  if (embedded) return <div className="w-full">{inner}</div>

  /* Standalone floating card */
  return (
    <div className="w-72 bg-surface border border-border rounded-2xl shadow-nav">
      <div className="flex items-center gap-2.5 px-4 pt-4 pb-3 border-b border-border">
        <div className="w-7 h-7 rounded-lg bg-secondary/15 flex items-center justify-center flex-shrink-0">
          <svg width="14" height="14" className="text-secondary" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"/>
          </svg>
        </div>
        <span className="text-sm font-bold text-text-primary">Find Route</span>
        <span className="ml-auto text-xs text-text-muted">{locations.length} locations</span>
      </div>
      <div className="px-4 pt-3 pb-4">{inner}</div>
    </div>
  )
}
