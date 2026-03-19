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
      body: JSON.stringify({ ...formData, portal: 'doctor' })
    })

    const data = await res.json()
    setLoading(false)

    if (res.ok) {
      Cookies.set('token', data.token)
      Cookies.set('role', data.user.role)
      router.push('/products')
    } else {
      setError(data.error)
    }
  }

  return (
    <main className="app-shell min-h-screen px-4 py-8 text-slate-100">
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl items-center gap-8 lg:grid-cols-[1.08fr_0.92fr]">
        <section className="rounded-[32px] border border-white/10 bg-[linear-gradient(135deg,rgba(15,23,42,0.94),rgba(9,18,29,0.78))] p-8 shadow-[0_40px_100px_rgba(2,6,23,0.38)] md:p-10">
          <p className="text-xs uppercase tracking-[0.34em] text-slate-400">Buyer Access</p>
          <h1 className="mt-4 max-w-xl text-4xl font-semibold tracking-tight md:text-5xl">
            Procurement sign in built for healthcare teams.
          </h1>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-slate-400">
            Access your procurement workspace, manage repeat purchases, and review institutional orders from a cleaner B2B console.
          </p>

          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {[
              { label: 'Orders', value: 'Live tracking' },
              { label: 'Catalog', value: 'Verified supply' },
              { label: 'Payments', value: 'Institution ready' },
            ].map((item) => (
              <div key={item.label} className="rounded-2xl border border-slate-800 bg-slate-950/35 p-4">
                <p className="text-[11px] uppercase tracking-[0.24em] text-slate-500">{item.label}</p>
                <p className="mt-2 text-sm font-medium text-slate-100">{item.value}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-[32px] border border-slate-800 bg-slate-950/55 p-6 shadow-[0_24px_70px_rgba(2,6,23,0.26)] sm:p-8">
          <div className="mb-8 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-700 bg-slate-100 text-sm font-bold text-slate-900">
              M
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-[0.28em] text-slate-500">MediShop</p>
              <p className="text-xl font-semibold text-slate-100">Customer Sign In</p>
            </div>
          </div>

          {error && (
            <div className="mb-6 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm text-slate-400">Email Address</label>
              <input
                type="email"
                placeholder="doctor@hospital.com"
                className="w-full rounded-xl border border-slate-800 bg-[#09111a] px-4 py-3 text-slate-100 placeholder-slate-500 transition focus:border-slate-600 focus:outline-none"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div>
              <label className="mb-2 block text-sm text-slate-400">Password</label>
              <input
                type="password"
                placeholder="Enter your password"
                className="w-full rounded-xl border border-slate-800 bg-[#09111a] px-4 py-3 text-slate-100 placeholder-slate-500 transition focus:border-slate-600 focus:outline-none"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="mt-2 w-full rounded-xl bg-slate-100 py-3 font-semibold text-slate-950 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </div>

          <div className="mt-8 space-y-3 text-sm">
            <p className="text-slate-400">
              Don&apos;t have an account?{' '}
              <button onClick={() => router.push('/signup')} className="text-slate-100 transition hover:text-white">
                Create one
              </button>
            </p>
            <p className="text-slate-500">
              Supplier or admin?{' '}
              <button onClick={() => router.push('/admin/login')} className="text-slate-300 transition hover:text-white">
                Open admin portal
              </button>
            </p>
          </div>
        </section>
      </div>
    </main>
  )
}
