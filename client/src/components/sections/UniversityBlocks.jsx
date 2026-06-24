import { useEffect, useRef } from 'react'
import Card, { CardImage, CardBody } from '../ui/Card'

const BLOCKS = [
  {
    title: 'SRM-IST Engineering Block',
    img:   'https://images.shiksha.com/mediadata/images/1680003008phppd7550_270x200.jpg',
    desc:  'Premier engineering campus featuring cutting-edge laboratories, smart classrooms, and innovation centers for CS, Electronics, Mechanical, and Civil Engineering.',
  },
  {
    title: 'Medical College',
    img:   '/icons/medical collge.jpeg',
    desc:  'World-class medical education facility with modern anatomy labs, simulation centers, clinical training units, and a teaching hospital.',
  },
  {
    title: 'TRP Engineering',
    img:   'https://s3.ap-south-1.amazonaws.com/townscript-production/images/011899ab-77f0-49c7-8c5b-c4c7c9122a8a.jpg',
    desc:  'Specialized engineering block with advanced robotics labs, IoT research facilities, and project development centers fostering innovation.',
  },
  {
    title: 'Arts and Science College',
    img:   'https://s3.ap-south-1.amazonaws.com/townscript-production/images/011899ab-77f0-49c7-8c5b-c4c7c9122a8a.jpg',
    desc:  'Vibrant academic hub offering diverse programs in humanities, social sciences, mathematics, and pure sciences.',
  },
  {
    title: 'Nursing College',
    img:   '/icons/medical collge.jpeg',
    desc:  'Comprehensive nursing education center with clinical skill labs, patient care simulation rooms, and practical training facilities.',
  },
  {
    title: 'Central Library',
    img:   '/icons/central library.jpeg',
    desc:  'Expansive knowledge center with 100,000+ books, digital resources, e-journals, quiet study zones, and high-speed internet access.',
  },
]

export default function UniversityBlocks() {
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
    <section id="blocks" className="py-20" ref={ref}>
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12 reveal">
          <h2 className="font-heading text-3xl sm:text-4xl font-bold text-text-primary section-title">University Blocks</h2>
          <p className="mt-4 text-text-secondary max-w-xl mx-auto">Explore the key academic and administrative buildings across the SRM Trichy campus.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {BLOCKS.map((b) => (
            <div key={b.title} className="reveal">
              <Card>
                <CardImage src={b.img} alt={b.title} />
                <CardBody>
                  <h3 className="font-heading font-bold text-text-primary text-lg mb-2">{b.title}</h3>
                  <p className="text-sm text-text-secondary leading-relaxed">{b.desc}</p>
                </CardBody>
              </Card>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
