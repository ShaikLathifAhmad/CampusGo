import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { setCredentials } from '../redux/slices/authSlice'
import { useRegisterMutation } from '../redux/api/campusApi'
import Button from '../components/ui/Button'

export default function RegisterPage() {
  const dispatch  = useDispatch()
  const navigate  = useNavigate()
  const [register, { isLoading }] = useRegisterMutation()
  const [form, setForm]   = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState('')

  const handleChange = (e) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }))
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.password) { setError('All fields are required.'); return }
    if (form.password.length < 8) { setError('Password must be at least 8 characters.'); return }
    try {
      const res = await register(form).unwrap()
      dispatch(setCredentials(res))
      navigate('/')
    } catch (err) {
      setError(err?.data?.error || 'Registration failed. Please try again.')
    }
  }

  return (
    <div className="min-h-screen hero-gradient flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-surface rounded-xl3 shadow-nav border border-border p-8">
        {/* Logo */}
        <div className="text-center mb-8">
          <img src="/icons/srmlogo.png" alt="SRM" className="w-12 h-12 object-contain mx-auto mb-3" />
          <h1 className="font-heading font-bold text-2xl text-text-primary">Create account</h1>
          <p className="text-sm text-text-muted mt-1">Join CampusGO — SRM Trichy Navigator</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">Full Name</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Your full name"
              className="w-full bg-surface-2 border border-border rounded-xl px-4 py-3 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-secondary/50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@srmtrichy.edu.in"
              className="w-full bg-surface-2 border border-border rounded-xl px-4 py-3 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-secondary/50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">Password</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Min. 8 characters"
              className="w-full bg-surface-2 border border-border rounded-xl px-4 py-3 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-secondary/50"
            />
          </div>

          {error && (
            <p className="text-sm text-error bg-error/10 border border-error/20 rounded-xl px-3 py-2">{error}</p>
          )}

          <Button type="submit" disabled={isLoading} className="w-full mt-2">
            {isLoading ? 'Creating account…' : 'Create account'}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-text-muted">
          <p>Already have an account? <Link to="/login" className="text-secondary font-medium hover:underline">Sign in</Link></p>
          <Link to="/" className="mt-2 block hover:text-text-primary transition-colors">← Back to Home</Link>
        </div>
      </div>
    </div>
  )
}
