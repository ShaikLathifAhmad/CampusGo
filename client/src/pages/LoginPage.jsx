import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { setCredentials } from '../redux/slices/authSlice'
import { useLoginMutation } from '../redux/api/campusApi'
import Button from '../components/ui/Button'

export default function LoginPage() {
  const dispatch  = useDispatch()
  const navigate  = useNavigate()
  const [login, { isLoading }] = useLoginMutation()
  const [form, setForm]     = useState({ email: '', password: '' })
  const [error, setError]   = useState('')

  const handleChange = (e) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }))
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.email || !form.password) { setError('All fields are required.'); return }
    try {
      const res = await login(form).unwrap()
      dispatch(setCredentials(res))
      navigate('/')
    } catch (err) {
      setError(err?.data?.error || 'Login failed. Please try again.')
    }
  }

  return (
    <div className="min-h-screen hero-gradient flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-surface rounded-xl3 shadow-nav border border-border p-8">
        {/* Logo */}
        <div className="text-center mb-8">
          <img src="/icons/srmlogo.png" alt="SRM" className="w-12 h-12 object-contain mx-auto mb-3" />
          <h1 className="font-heading font-bold text-2xl text-text-primary">Welcome back</h1>
          <p className="text-sm text-text-muted mt-1">Sign in to your CampusGO account</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
              placeholder="••••••••"
              className="w-full bg-surface-2 border border-border rounded-xl px-4 py-3 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-secondary/50"
            />
          </div>

          {error && (
            <p className="text-sm text-error bg-error/10 border border-error/20 rounded-xl px-3 py-2">{error}</p>
          )}

          <Button type="submit" disabled={isLoading} className="w-full mt-2">
            {isLoading ? 'Signing in…' : 'Sign in'}
          </Button>
        </form>

        <div className="flex flex-col gap-2 mt-6 text-center text-sm text-text-muted">
          <Link to="/login" className="text-secondary hover:underline">Forgot password?</Link>
          <p>Don't have an account? <Link to="/register" className="text-secondary font-medium hover:underline">Register</Link></p>
          <Link to="/" className="hover:text-text-primary transition-colors">← Back to Home</Link>
        </div>
      </div>
    </div>
  )
}
