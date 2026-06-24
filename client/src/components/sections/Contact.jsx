import { useEffect, useRef } from 'react'

const CONTACT_ITEMS = [
  {
    icon: '📍',
    title: 'Address',
    content: 'SRM Institute of Science & Technology\nTiruchirappalli — Chennai Highway,\nIrungalur, Trichy — 621105, Tamil Nadu',
  },
  {
    icon: '📞',
    title: 'Phone',
    content: '+91 431 225 8000',
  },
  {
    icon: '✉️',
    title: 'Email',
    content: 'info@srmtrichy.edu.in',
  },
  {
    icon: '🕐',
    title: 'Office Hours',
    content: 'Mon – Sat: 9:00 AM – 5:00 PM',
  },
]

export default function Contact() {
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
    <section id="contact" className="py-20" ref={ref}>
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12 reveal">
          <h2 className="font-heading text-3xl sm:text-4xl font-bold text-text-primary section-title">Contact Details</h2>
          <p className="mt-4 text-text-secondary max-w-xl mx-auto">Get in touch with us for any queries about campus navigation.</p>
        </div>

        <div className="max-w-2xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-5 reveal">
          {CONTACT_ITEMS.map((item) => (
            <div
              key={item.title}
              className="flex items-start gap-4 p-5 bg-surface rounded-xl2 border border-border shadow-card"
            >
              <div className="w-11 h-11 flex items-center justify-center rounded-xl bg-primary/10 text-xl flex-shrink-0">
                {item.icon}
              </div>
              <div>
                <h4 className="font-heading font-bold text-text-primary mb-1">{item.title}</h4>
                <p className="text-sm text-text-secondary whitespace-pre-line leading-relaxed">{item.content}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
