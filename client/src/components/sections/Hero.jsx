import { useNavigate } from 'react-router-dom'
import Button from '../ui/Button'

export default function Hero() {
  const navigate = useNavigate()

  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center hero-gradient overflow-hidden">
      {/* Background particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <span
            key={i}
            className="absolute rounded-full bg-white/5 animate-pulse"
            style={{
              width:  `${[200, 150, 100, 300, 80, 250][i]}px`,
              height: `${[200, 150, 100, 300, 80, 250][i]}px`,
              top:    `${[10, 60, 30, 70, 20, 80][i]}%`,
              left:   `${[5, 80, 50, 15, 70, 40][i]}%`,
              animationDelay: `${i * 0.5}s`,
              opacity: 0.04,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 text-center px-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-2 mb-8 text-sm text-white/80">
          <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
          SRM Institute of Science &amp; Technology — Trichy
        </div>

        <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
          Navigate Your Campus<br />
          <span className="text-secondary">Like Never Before</span>
        </h1>

        <p className="text-base sm:text-lg text-white/70 mb-10 leading-relaxed max-w-xl mx-auto">
          CampusGO is your smart companion for exploring every corner of SRM Trichy —
          from academic blocks and hostels to food courts and amenities.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button variant="hero" onClick={() => navigate('/map')}>
            Explore Campus
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </Button>
          <Button
            variant="outline"
            className="border-white/30 text-white hover:bg-white/10"
            onClick={() => document.querySelector('#blocks')?.scrollIntoView({ behavior: 'smooth' })}
          >
            View Campus
          </Button>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-white/40">
        <span className="text-xs">Scroll</span>
        <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </section>
  )
}
