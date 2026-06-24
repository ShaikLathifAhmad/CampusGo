import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { logout } from '../../redux/slices/authSlice'

const NAV_LINKS = [
  { label: 'Home',             href: '#home' },
  { label: 'Events',           href: '#events' },
  { label: 'University Blocks',href: '#blocks' },
  { label: 'Hostels',          href: '#hostels' },
  { label: 'Food Courts',      href: '#foodcourts' },
  { label: 'Amenities',        href: '#amenities' },
  { label: 'Contact',          href: '#contact' },
]

export default function Header() {
  const [scrolled,    setScrolled]    = useState(false)
  const [menuOpen,    setMenuOpen]    = useState(false)
  const { isAuthenticated, user }     = useSelector((s) => s.auth)
  const dispatch  = useDispatch()
  const navigate  = useNavigate()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const handleNav = (href) => {
    setMenuOpen(false)
    const el = document.querySelector(href)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-primary-dark shadow-nav py-3' : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">

        {/* Logo */}
        <a href="#home" className="flex items-center gap-3" onClick={() => handleNav('#home')}>
          <img src="/icons/srmlogo.png" alt="SRM" className="h-9 w-9 object-contain" />
          <div className="leading-tight">
            <span className="block font-heading font-bold text-lg text-white">CampusGO</span>
            <span className="block text-xs text-text-muted">SRM Trichy Navigator</span>
          </div>
        </a>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-1">
          {NAV_LINKS.map((l) => (
            <button
              key={l.label}
              onClick={() => handleNav(l.href)}
              className="text-sm text-text-muted hover:text-white px-3 py-2 rounded-lg hover:bg-white/10 transition-colors"
            >
              {l.label}
            </button>
          ))}
        </nav>

        {/* Auth */}
        <div className="hidden lg:flex items-center gap-3">
          {isAuthenticated ? (
            <>
              <span className="text-sm text-text-muted">Hi, {user?.name?.split(' ')[0]}</span>
              <button
                onClick={() => dispatch(logout())}
                className="text-sm text-error hover:text-white border border-error hover:bg-error px-4 py-2 rounded-xl transition-colors"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login"    className="text-sm text-text-muted hover:text-white transition-colors">Login</Link>
              <Link to="/register" className="text-sm bg-secondary text-white px-4 py-2 rounded-xl hover:opacity-90 transition-opacity">Register</Link>
            </>
          )}
        </div>

        {/* Hamburger */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="lg:hidden flex flex-col gap-1.5 p-2"
          aria-label="Menu"
        >
          <span className={`block w-6 h-0.5 bg-white transition-all duration-300 ${menuOpen ? 'rotate-45 translate-y-2' : ''}`} />
          <span className={`block w-6 h-0.5 bg-white transition-all duration-300 ${menuOpen ? 'opacity-0' : ''}`} />
          <span className={`block w-6 h-0.5 bg-white transition-all duration-300 ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="lg:hidden bg-primary-dark border-t border-white/10 px-4 py-4 flex flex-col gap-1">
          {NAV_LINKS.map((l) => (
            <button
              key={l.label}
              onClick={() => handleNav(l.href)}
              className="text-sm text-text-muted hover:text-white text-left px-3 py-2.5 rounded-lg hover:bg-white/10 transition-colors"
            >
              {l.label}
            </button>
          ))}
          <div className="flex gap-3 mt-3 pt-3 border-t border-white/10">
            {isAuthenticated ? (
              <button onClick={() => { dispatch(logout()); setMenuOpen(false) }} className="text-sm text-error">Logout</button>
            ) : (
              <>
                <Link to="/login"    onClick={() => setMenuOpen(false)} className="text-sm text-text-muted">Login</Link>
                <Link to="/register" onClick={() => setMenuOpen(false)} className="text-sm text-secondary">Register</Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
