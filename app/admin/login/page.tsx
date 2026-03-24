'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getProviders, signIn } from 'next-auth/react'
import { BrandLogo } from '../../brand-logo'

type ProviderMap = Awaited<ReturnType<typeof getProviders>>

export default function AdminLogin() {
  const router = useRouter()
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [providers, setProviders] = useState<ProviderMap>(null)

  useEffect(() => {
    getProviders().then((availableProviders) => setProviders(availableProviders))
  }, [])

  const handleSubmit = async () => {
    setLoading(true)
    setError('')

    const result = await signIn('credentials', {
      email: formData.email,
      password: formData.password,
      portal: 'admin',
      redirect: false
    })

    setLoading(false)

    if (!result?.error) {
      router.push('/admin')
      router.refresh()
    } else {
      setError(result.error)
    }
  }

  return (
    <main className="app-shell min-h-screen px-4 py-8 text-slate-100">
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl items-center gap-8 lg:grid-cols-[1.05fr_0.95fr]">
        <section className="rounded-[32px] border border-white/10 bg-[linear-gradient(135deg,rgba(11,22,35,0.96),rgba(8,17,27,0.82))] p-8 shadow-[0_40px_100px_rgba(2,6,23,0.4)] md:p-10">
          <p className="text-xs uppercase tracking-[0.34em] text-slate-400">Restricted Access</p>
          <h1 className="mt-4 max-w-xl text-4xl font-semibold tracking-tight md:text-5xl">
            Supplier and operations access for marketplace management.
          </h1>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-slate-400">
            Use the admin portal to manage listings, orders, notifications, and procurement requests. Public buyer accounts should use the customer login instead.
          </p>

          <div className="mt-10 space-y-4">
            {[
              'Monitor active inventory and stock movement',
              'Review and fulfill institutional orders',
              'Respond to incoming sourcing requests',
            ].map((item) => (
              <div key={item} className="flex items-center gap-3 rounded-2xl border border-slate-800 bg-slate-950/35 px-4 py-4">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-700 bg-slate-900 text-[11px] font-semibold tracking-[0.18em] text-slate-300">
                  AD
                </span>
                <p className="text-sm text-slate-200">{item}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-[32px] border border-slate-800 bg-slate-950/55 p-6 shadow-[0_24px_70px_rgba(2,6,23,0.26)] sm:p-8">
          <div className="mb-8 flex items-center gap-3">
            <BrandLogo />
            <p className="font-display text-xl font-semibold tracking-[-0.04em] text-slate-100">MedEquip</p>
          </div>

          {error && (
            <div className="mb-6 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {error}
            </div>
          )}

          <div className="space-y-4">
            {providers?.google && (
              <button
                onClick={() => signIn('google', { callbackUrl: '/admin' })}
                className="w-full rounded-xl border border-slate-700 bg-transparent py-3 font-semibold text-slate-100 transition hover:border-slate-500 hover:bg-slate-900/60"
              >
                Continue with Google
              </button>
            )}
            <div>
              <label className="mb-2 block text-sm text-slate-400">Admin Email</label>
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
              {loading ? 'Signing in...' : 'Enter Admin Dashboard'}
            </button>
          </div>

          <div className="mt-8 space-y-3 text-sm">
            <p className="text-slate-400">
              Customer account?{' '}
              <button onClick={() => router.push('/login')} className="text-slate-100 transition hover:text-white">
                Use customer login
              </button>
            </p>
          </div>
        </section>
      </div>
    </main>
  )
}
