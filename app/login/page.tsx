'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Cookies from 'js-cookie'

export default function Login() {
  const router = useRouter()
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    setLoading(true)
    setError('')

    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    })

    const data = await res.json()
    setLoading(false)

    if (res.ok) {
      Cookies.set('token', data.token)
      Cookies.set('role', data.user.role)
      if (data.user.role === 'admin') {
        router.push('/admin')
      } else {
        router.push('/products')
      }
    } else {
      setError(data.error)
    }
  }

  return (
    <main className="min-h-screen bg-[#0a1628] flex items-center justify-center relative overflow-hidden px-4 py-8">
      {/* Background grid */}
      <div className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: 'linear-gradient(#1e40af 1px, transparent 1px), linear-gradient(90deg, #1e40af 1px, transparent 1px)',
          backgroundSize: '60px 60px'
        }}
      />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-blue-500 opacity-10 blur-[120px] rounded-full" />

      <div className="relative z-10 w-full max-w-md px-2 sm:px-6 md:px-8">
        {/* Logo */}
        <div className="text-center mb-6 md:mb-8">
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold">M</span>
            </div>
            <span className="text-2xl font-bold text-white">MediShop</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">Welcome back</h2>
          <p className="text-white/50">Sign in to your procurement account</p>
        </div>

        {/* Form */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 sm:p-6 md:p-8 backdrop-blur-sm">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl mb-6 text-sm">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="text-white/60 text-sm mb-2 block">Email Address</label>
              <input
                type="email"
                placeholder="doctor@hospital.com"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-blue-500 transition"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>
            <div>
              <label className="text-white/60 text-sm mb-2 block">Password</label>
              <input
                type="password"
                placeholder="••••••••"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-blue-500 transition"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
              />
            </div>

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-xl font-semibold transition shadow-lg shadow-blue-500/25 mt-2"
            >
              {loading ? 'Signing in...' : 'Sign In →'}
            </button>
          </div>
        </div>

        <p className="text-center text-white/40 mt-6 text-sm">
          Don&apos;t have an account?{' '}
          <span
            onClick={() => router.push('/signup')}
            className="text-blue-400 cursor-pointer hover:text-blue-300 transition"
          >
            Create one
          </span>
        </p>
      </div>
    </main>
  )
}
