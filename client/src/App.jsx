import { Routes, Route } from 'react-router-dom'
import Home       from './pages/Home'
import MapPage    from './pages/MapPage'
import LoginPage  from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'

export default function App() {
  return (
    <Routes>
      <Route path="/"         element={<Home />} />
      <Route path="/map"      element={<MapPage />} />
      <Route path="/login"    element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
    </Routes>
  )
}
