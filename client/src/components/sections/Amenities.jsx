import { useEffect, useRef } from 'react'

const AMENITIES = [
  { icon: '/icons/medical hospital.jpeg', label: 'Medical Centre',  isImg: true },
  { icon: '/icons/sportsground.jpeg',     label: 'Sports Complex',  isImg: true },
  { icon: '/icons/ATM.jpeg',              label: 'ATM',             isImg: true },
  { icon: '/icons/Parking.jpeg',          label: 'Parking',         isImg: true },
  { icon: '/icons/bustop.jpeg',           label: 'Bus Stop',        isImg: true },
  { icon: '🏋️',                          label: 'Gym',             isImg: false },
  { icon: '/icons/auditorium.jpeg',       label: 'Auditorium',      isImg: true },
  { icon: '🖨️',                          label: 'Print & Copy',    isImg: false },
  { icon: '🛒',                           label: 'General Store',   isImg: false },
]

export default function Amenities() {
  const ref = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add('visible')),
      { threshold: 0.1 }
    )
    ref.current?.querySelectorAll('.reveal').forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  return (
    <section id="amenities" className="py-20 bg-surface-2" ref={ref}>
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12 reveal">
          <h2 className="font-heading text-3xl sm:text-4xl font-bold text-text-primary section-title">Amenities</h2>
          <p className="mt-4 text-text-secondary max-w-xl mx-auto">Everything you need, right on campus.</p>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-9 gap-4">
          {AMENITIES.map((a) => (
            <div
              key={a.label}
              className="reveal flex flex-col items-center gap-3 p-4 bg-surface rounded-xl2 border border-border shadow-card card-hover text-center"
            >
              <div className="w-14 h-14 rounded-xl overflow-hidden flex items-center justify-center bg-surface-2">
                {a.isImg
                  ? <img src={a.icon} alt={a.label} className="w-full h-full object-cover" />
                  : <span className="text-3xl">{a.icon}</span>
                }
              </div>
              <span className="text-xs font-semibold text-text-secondary leading-tight">{a.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
