import { useEffect, useRef } from 'react'
import Card, { CardImage, CardBody, CardTag } from '../ui/Card'

const FOOD_COURTS = [
  {
    title: 'Basil',
    img:   '/icons/basil.jpeg',
    desc:  'The central dining hall offering a variety of South Indian, North Indian, and continental meals at affordable prices.',
    tag:   'Veg & Non-Veg',
  },
  {
    title: 'Kaapi 2.0',
    img:   '/icons/kaapi.jpeg',
    desc:  'A cozy café serving freshly brewed coffee, tea, juices, and light snacks — the perfect study break spot.',
    tag:   'Beverages',
  },
  {
    title: 'Mr. Burger',
    img:   '/icons/mrburger.jpeg',
    desc:  'Quick bites including pizza, burgers, sandwiches, and chaat — ideal for between-class hunger pangs.',
    tag:   'Quick Bites',
  },
  {
    title: 'TRP Canteen',
    img:   '/icons/trp canteen.jpeg',
    desc:  'Fresh fruit juices, smoothies, salads, and healthy snack bowls for the health-conscious crowd.',
    tag:   'Healthy',
  },
]

export default function FoodCourts() {
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
    <section id="foodcourts" className="py-20" ref={ref}>
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12 reveal">
          <h2 className="font-heading text-3xl sm:text-4xl font-bold text-text-primary section-title">Food Courts</h2>
          <p className="mt-4 text-text-secondary max-w-xl mx-auto">Delicious and diverse dining options spread across the campus.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {FOOD_COURTS.map((f) => (
            <div key={f.title} className="reveal">
              <Card>
                <CardImage src={f.img} alt={f.title} />
                <CardBody>
                  <h3 className="font-heading font-bold text-text-primary text-base mb-2">{f.title}</h3>
                  <p className="text-sm text-text-secondary leading-relaxed">{f.desc}</p>
                  <CardTag>{f.tag}</CardTag>
                </CardBody>
              </Card>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
