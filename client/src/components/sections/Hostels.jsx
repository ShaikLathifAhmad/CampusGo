import { useEffect, useRef } from 'react'
import Card, { CardImage, CardBody, CardTag } from '../ui/Card'

const HOSTELS = [
  {
    title: 'Girls Hostel (G-Block)',
    img:   'https://trp.srmtrichy.edu.in/wp-content/uploads/2024/05/Boys-Hostel-300x300.png',
    desc:  'Three-storey hostel with spacious twin-sharing rooms, common study area, and 24/7 Wi-Fi connectivity.',
    tag:   'Women',
  },
  {
    title: 'Medical Girls Hostel',
    img:   '/icons/medical girls hostel.jpeg',
    desc:  'Modern hostel facility with attached bathrooms, laundry services, and recreational room for residents.',
    tag:   'Women',
  },
  {
    title: 'Boys Hostel (S-Block)',
    img:   '/icons/boys hostel.jpeg',
    desc:  'Secure residential block with CCTV surveillance, in-house mess, and dedicated warden quarters.',
    tag:   'Men',
  },
  {
    title: 'Nilgiris Hostel',
    img:   '/icons/nilgiris.jpeg',
    desc:  'Premium accommodation with AC rooms, hot water facility, and a well-maintained garden area.',
    tag:   'Men',
  },
]

export default function Hostels() {
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
    <section id="hostels" className="py-20 bg-surface-2" ref={ref}>
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12 reveal">
          <h2 className="font-heading text-3xl sm:text-4xl font-bold text-text-primary section-title">Hostels</h2>
          <p className="mt-4 text-text-secondary max-w-xl mx-auto">Comfortable and secure residential facilities for students on campus.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {HOSTELS.map((h) => (
            <div key={h.title} className="reveal">
              <Card>
                <CardImage src={h.img} alt={h.title} />
                <CardBody>
                  <h3 className="font-heading font-bold text-text-primary text-base mb-2">{h.title}</h3>
                  <p className="text-sm text-text-secondary leading-relaxed">{h.desc}</p>
                  <CardTag>{h.tag}</CardTag>
                </CardBody>
              </Card>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
