import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Zap, Eye, EyeOff } from 'lucide-react'
import { authApi } from '../api/client'
import { useStore } from '../store/useStore'
import toast from 'react-hot-toast'

export default function Login() {
  const [email, setEmail] = useState('admin@demo.com')
  const [password, setPassword] = useState('demo123')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { setUser, setToken } = useStore()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { data } = await authApi.login({ email, password })
      setToken(data.token)
      setUser(data.user)
      navigate('/dashboard')
      toast.success(`Welcome back, ${data.user.name}!`)
    } catch {
      toast.error('Invalid credentials')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-surface-900 flex items-center justify-center p-4">
      {/* Background Glow */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px]
                        bg-brand-600/10 rounded-full blur-[120px]" />
      </div>

      <div className="relative w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-brand-600 flex items-center justify-center mx-auto mb-3">
            <Zap size={22} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white font-display">EduCRM</h1>
          <p className="text-slate-400 text-sm mt-1">Sign in to your workspace</p>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Email</label>
              <input
                type="email"
                className="input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@institution.com"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  className="input pr-10"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="btn-primary w-full h-10 mt-2 disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-4 pt-4 border-t border-surface-700">
            <p className="text-xs text-slate-500 text-center">
              Demo: <span className="text-slate-400">admin@demo.com / demo123</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
