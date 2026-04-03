'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { BrandLogo } from '../../brand-logo'

export default function AdminSignup() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    company_name: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    setLoading(true)
    setError('')

    const res = await fetch('/api/auth/admin-signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    })

    const data = await res.json()
    setLoading(false)

    if (res.ok) {
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        portal: 'admin',
        redirect: false
      })

      if (!result?.error) {
        router.push('/admin')
        router.refresh()
        return
      }

      router.push('/admin/login')
    } else {
      setError(data.error)
    }
  }

  return (
    <main className="app-shell min-h-screen px-4 py-8 text-slate-100">
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl items-center gap-8 lg:grid-cols-[1.05fr_0.95fr]">
        <section className="rounded-[32px] border border-white/10 bg-[linear-gradient(135deg,rgba(11,22,35,0.96),rgba(8,17,27,0.82))] p-8 shadow-[0_40px_100px_rgba(2,6,23,0.4)] md:p-10">
          <p className="text-xs uppercase tracking-[0.34em] text-slate-400">Supplier Onboarding</p>
          <h1 className="mt-4 max-w-xl text-4xl font-semibold tracking-tight md:text-5xl">
            Create supplier access for the VitalOps operations portal.
          </h1>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-slate-400">
            Set up your supplier account to manage listings, review incoming orders, and respond to sourcing requests.
          </p>

          <div className="mt-10 space-y-4">
            {[
              'Publish and manage inventory',
              'Track institutional orders',
              'Respond to custom sourcing requests',
            ].map((item) => (
              <div key={item} className="flex items-center gap-3 rounded-2xl border border-slate-800 bg-slate-950/35 px-4 py-4">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-700 bg-slate-900 text-[11px] font-semibold tracking-[0.18em] text-slate-300">
                  VO
                </span>
                <p className="text-sm text-slate-200">{item}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-[32px] border border-slate-800 bg-slate-950/55 p-6 shadow-[0_24px_70px_rgba(2,6,23,0.26)] sm:p-8">
          <div className="mb-8 flex items-center gap-3">
            <BrandLogo />
            <p className="font-display text-xl font-semibold tracking-[-0.04em] text-slate-100">VitalOps</p>
          </div>

          {error && (
            <div className="mb-6 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm text-slate-400">Full Name</label>
              <input
                type="text"
                placeholder="Alex Johnson"
                className="w-full rounded-xl border border-slate-800 bg-[#09111a] px-4 py-3 text-slate-100 placeholder-slate-500 transition focus:border-slate-600 focus:outline-none"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div>
              <label className="mb-2 block text-sm text-slate-400">Work Email</label>
              <input
                type="email"
                placeholder="supplier@company.com"
                className="w-full rounded-xl border border-slate-800 bg-[#09111a] px-4 py-3 text-slate-100 placeholder-slate-500 transition focus:border-slate-600 focus:outline-none"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div>
              <label className="mb-2 block text-sm text-slate-400">Password</label>
              <input
                type="password"
                placeholder="Create a secure password"
                className="w-full rounded-xl border border-slate-800 bg-[#09111a] px-4 py-3 text-slate-100 placeholder-slate-500 transition focus:border-slate-600 focus:outline-none"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>
            <div>
              <label className="mb-2 block text-sm text-slate-400">Company Name</label>
              <input
                type="text"
                placeholder="Acme Medical Supplies"
                className="w-full rounded-xl border border-slate-800 bg-[#09111a] px-4 py-3 text-slate-100 placeholder-slate-500 transition focus:border-slate-600 focus:outline-none"
                value={formData.company_name}
                onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
              />
            </div>

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="mt-2 w-full rounded-xl bg-slate-100 py-3 font-semibold text-slate-950 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? 'Creating account...' : 'Create Supplier Account'}
            </button>
          </div>

          <div className="mt-8 space-y-3 text-sm">
            <p className="text-slate-400">
              Already have supplier access?{' '}
              <button onClick={() => router.push('/admin/login')} className="text-slate-100 transition hover:text-white">
                Sign in
              </button>
            </p>
            <p className="text-slate-400">
              Buyer account?{' '}
              <button onClick={() => router.push('/signup')} className="text-slate-100 transition hover:text-white">
                Use buyer signup
              </button>
            </p>
          </div>
        </section>
      </div>
    </main>
  )
}
