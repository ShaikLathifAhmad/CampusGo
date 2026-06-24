import { useEffect, useRef } from 'react'
import Card, { CardBody } from '../ui/Card'

const STATUS_STYLES = {
  upcoming:  'bg-warning/10 text-warning border border-warning/30',
  ongoing:   'bg-success/10 text-success border border-success/30',
  completed: 'bg-text-muted/10 text-text-muted border border-border',
}

const EVENTS = {
  ongoing: [],
  upcoming: [
    {
      title: 'HackerXploit CTF 2026',
      date: '07 May 2026',
      location: 'Online',
      description: '🚀 National Level 24HR Online CTF Event! SRM Trichy\'s Dept. of Cyber Security invites teams to compete. Team: 1–3 members | Prize: ₹8,000+ Cash 💵 | Reg Fee: ₹190 per team',
    },
  ],
  completed: [
    {
      title: 'Fiesta 2026 – Inhouse Project Show',
      date: 'April 15, 2026',
      location: 'FET Block (3rd floor)',
      description: 'Fostering innovative thinking in AI and computing for sustainable development, showcasing student technical expertise.',
    },
    {
      title: 'RASARANG 2026',
      date: 'April 9–10, 2026',
      location: 'Main Ground',
      description: 'Annual fest celebrating SRM Trichy with performances, dances, music, DJ, food, light works, and cultural activities.',
    },
  ],
}

function EventCard({ event, status }) {
  return (
    <Card>
      <CardBody>
        <span className={`inline-block text-xs font-semibold px-3 py-1 rounded-full mb-3 ${STATUS_STYLES[status]}`}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
        <h4 className="font-heading font-bold text-text-primary text-lg mb-3">{event.title}</h4>
        <div className="flex flex-wrap gap-3 text-sm text-text-secondary mb-3">
          <span className="flex items-center gap-1.5">📅 {event.date}</span>
          <span className="flex items-center gap-1.5">📍 {event.location}</span>
        </div>
        <p className="text-sm text-text-secondary leading-relaxed">{event.description}</p>
      </CardBody>
    </Card>
  )
}

function EventSection({ title, events, status }) {
  return (
    <div className="mb-10">
      <h3 className="font-heading font-bold text-xl text-text-primary mb-5">{title}</h3>
      {events.length === 0 ? (
        <p className="text-text-muted italic text-center py-8">Currently no {title.toLowerCase()}. Stay tuned!</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {events.map((e) => <EventCard key={e.title} event={e} status={status} />)}
        </div>
      )}
    </div>
  )
}

export default function Events() {
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
    <section id="events" className="py-20 bg-surface-2" ref={ref}>
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12 reveal">
          <h2 className="font-heading text-3xl sm:text-4xl font-bold text-text-primary section-title">Campus Events</h2>
          <p className="mt-4 text-text-secondary max-w-xl mx-auto">Stay updated with the latest happenings across SRM Trichy campus.</p>
        </div>
        <div className="reveal">
          <EventSection title="Ongoing Events"           events={EVENTS.ongoing}   status="ongoing" />
          <EventSection title="Upcoming Events"          events={EVENTS.upcoming}  status="upcoming" />
          <EventSection title="Recently Completed Events" events={EVENTS.completed} status="completed" />
        </div>
      </div>
    </section>
  )
}
