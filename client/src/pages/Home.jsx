import Header          from '../components/layout/Header'
import Footer          from '../components/layout/Footer'
import Hero            from '../components/sections/Hero'
import Events          from '../components/sections/Events'
import UniversityBlocks from '../components/sections/UniversityBlocks'
import Hostels         from '../components/sections/Hostels'
import FoodCourts      from '../components/sections/FoodCourts'
import Amenities       from '../components/sections/Amenities'
import Contact         from '../components/sections/Contact'
import ChatBot         from '../components/map/ChatBot'

export default function Home() {
  return (
    <div className="min-h-screen bg-bg">
      <Header />
      <main>
        <Hero />
        <Events />
        <UniversityBlocks />
        <Hostels />
        <FoodCourts />
        <Amenities />
        <Contact />
      </main>
      <Footer />
      <ChatBot />
    </div>
  )
}
