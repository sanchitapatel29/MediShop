'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getProviders, signIn } from 'next-auth/react'
import { BrandLogo } from '../brand-logo'

type ProviderMap = Awaited<ReturnType<typeof getProviders>>

export default function Signup() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    hospital_name: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [providers, setProviders] = useState<ProviderMap>(null)

  useEffect(() => {
    getProviders().then((availableProviders) => setProviders(availableProviders))
  }, [])

  const handleSubmit = async () => {
    setLoading(true)
    setError('')

    const res = await fetch('/api/auth/signup', {
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
        portal: 'doctor',
        redirect: false
      })

      if (!result?.error) {
        router.push('/products')
        router.refresh()
        return
      }

      router.push('/login')
    } else {
      setError(data.error)
    }
  }

  return (
    <main className="app-shell min-h-screen px-4 py-8 text-slate-100">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-2xl items-center">
        <section className="w-full rounded-[32px] border border-slate-800 bg-slate-950/55 p-6 shadow-[0_24px_70px_rgba(2,6,23,0.26)] sm:p-8">
          <div className="mb-8 flex items-center gap-3">
            <BrandLogo />
            <div>
              <p className="font-display text-xl font-semibold tracking-[-0.04em] text-slate-100">MedEquip</p>
              <p className="text-sm text-slate-400">Create buyer account</p>
            </div>
          </div>

          <div className="mb-8">
            <h1 className="font-display text-3xl font-semibold tracking-[-0.04em] text-slate-100 md:text-4xl">
              Set up your procurement account.
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-slate-400 md:text-base">
              Use your hospital or clinic details to create a buyer account and start placing orders.
            </p>
          </div>

          {error && (
            <div className="mb-6 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {error}
            </div>
          )}

          <div className="space-y-4">
            {providers?.google && (
              <button
                onClick={() => signIn('google', { callbackUrl: '/products' })}
                className="w-full rounded-xl border border-slate-700 bg-transparent py-3 font-semibold text-slate-100 transition hover:border-slate-500 hover:bg-slate-900/60"
              >
                Continue with Google
              </button>
            )}
            <div>
              <label className="mb-2 block text-sm text-slate-400">Full Name</label>
              <input
                type="text"
                placeholder="Dr. John Smith"
                className="w-full rounded-xl border border-slate-800 bg-[#09111a] px-4 py-3 text-slate-100 placeholder-slate-500 transition focus:border-slate-600 focus:outline-none"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
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
                placeholder="Create a secure password"
                className="w-full rounded-xl border border-slate-800 bg-[#09111a] px-4 py-3 text-slate-100 placeholder-slate-500 transition focus:border-slate-600 focus:outline-none"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>
            <div>
              <label className="mb-2 block text-sm text-slate-400">Hospital / Clinic Name</label>
              <input
                type="text"
                placeholder="City General Hospital"
                className="w-full rounded-xl border border-slate-800 bg-[#09111a] px-4 py-3 text-slate-100 placeholder-slate-500 transition focus:border-slate-600 focus:outline-none"
                value={formData.hospital_name}
                onChange={(e) => setFormData({ ...formData, hospital_name: e.target.value })}
              />
            </div>

            <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 px-4 py-4 text-sm text-amber-100">
              Supplier and admin accounts are managed separately through the admin portal.
            </div>

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="mt-2 w-full rounded-xl bg-slate-100 py-3 font-semibold text-slate-950 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </div>

          <div className="mt-8 space-y-3 text-sm">
            <p className="text-slate-400">
              Already have an account?{' '}
              <button onClick={() => router.push('/login')} className="text-slate-100 transition hover:text-white">
                Sign in
              </button>
            </p>
            <p className="text-slate-500">
              Need seller access?{' '}
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
