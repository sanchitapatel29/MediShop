'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function RequestProduct() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: '', description: '', quantity: '', urgency: 'normal'
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async () => {
    setLoading(true)
    const res = await fetch('/api/requests', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formData)
    })

    setLoading(false)
    if (res.status === 401) {
      router.push('/login')
    } else if (res.ok) {
      setSuccess(true)
    } else {
      const data = await res.json()
      setError(data.error)
    }
  }

  return (
    <main className="app-shell min-h-screen text-slate-100">
      <nav className="border-b border-white/10 bg-[#0b1623]/90 px-4 py-4 backdrop-blur-xl md:px-8">
        <div className="mx-auto flex max-w-4xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-700 bg-slate-100 text-sm font-bold text-slate-900">
              M
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-[0.28em] text-slate-500">Sourcing Request</p>
              <span className="text-xl font-semibold tracking-tight">Request a Product</span>
            </div>
          </div>
          <button
            onClick={() => router.push('/products')}
            className="rounded-xl border border-slate-800 bg-slate-950/45 px-4 py-2 text-sm text-slate-300 transition hover:border-slate-700 hover:text-white"
          >
            Back to Products
          </button>
        </div>
      </nav>

      <div className="mx-auto max-w-4xl px-4 py-8 md:px-8 md:py-12">
        <section className="mb-8 rounded-[32px] border border-white/10 bg-[linear-gradient(135deg,rgba(15,23,42,0.92),rgba(9,18,29,0.78))] p-6 shadow-[0_32px_90px_rgba(2,6,23,0.34)] md:p-8">
          <p className="text-xs uppercase tracking-[0.34em] text-slate-400">Custom Sourcing</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">Request equipment that is not currently listed.</h1>
          <p className="mt-3 text-sm leading-relaxed text-slate-400 md:text-base">
            Submit product requirements, specifications, required quantity, and urgency so the supplier team can review sourcing feasibility.
          </p>
        </section>

        {success ? (
          <div className="rounded-[32px] border border-emerald-500/20 bg-emerald-500/10 p-12 text-center shadow-[0_24px_70px_rgba(2,6,23,0.2)]">
            <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full border border-emerald-500/20 bg-slate-950/30 text-sm font-semibold tracking-[0.3em] text-emerald-200">
              OK
            </div>
            <h2 className="text-3xl font-semibold tracking-tight text-emerald-100">Request Submitted</h2>
            <p className="mt-3 text-slate-200">Our team will review your request and respond as soon as possible.</p>
            <button
              onClick={() => router.push('/products')}
              className="mt-8 rounded-xl bg-slate-100 px-6 py-3 font-semibold text-slate-950 transition hover:bg-white"
            >
              Back to Products
            </button>
          </div>
        ) : (
          <div className="rounded-[32px] border border-slate-800 bg-slate-950/45 p-6 shadow-[0_24px_70px_rgba(2,6,23,0.2)] md:p-8">
            {error && (
              <div className="mb-6 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                {error}
              </div>
            )}

            <div className="space-y-5">
              <div>
                <label className="mb-2 block text-sm text-slate-400">Product Name</label>
                <input
                  type="text"
                  placeholder="e.g. Arthroscopic Shaver System"
                  className="w-full rounded-xl border border-slate-800 bg-[#09111a] px-4 py-3 text-slate-100 placeholder-slate-500 transition focus:border-slate-600 focus:outline-none"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm text-slate-400">Description and Specifications</label>
                <textarea
                  placeholder="Describe the product, brand preference, specifications, or any other procurement requirements."
                  className="w-full rounded-xl border border-slate-800 bg-[#09111a] px-4 py-3 text-slate-100 placeholder-slate-500 transition focus:border-slate-600 focus:outline-none"
                  rows={5}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm text-slate-400">Quantity Required</label>
                  <input
                    type="number"
                    placeholder="e.g. 10"
                    className="w-full rounded-xl border border-slate-800 bg-[#09111a] px-4 py-3 text-slate-100 placeholder-slate-500 transition focus:border-slate-600 focus:outline-none"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm text-slate-400">Urgency</label>
                  <select
                    className="w-full rounded-xl border border-slate-800 bg-[#09111a] px-4 py-3 text-slate-100 transition focus:border-slate-600 focus:outline-none"
                    value={formData.urgency}
                    onChange={(e) => setFormData({ ...formData, urgency: e.target.value })}
                  >
                    <option value="low" className="bg-[#09111a]">Low, within a month</option>
                    <option value="normal" className="bg-[#09111a]">Normal, within 2 weeks</option>
                    <option value="high" className="bg-[#09111a]">High, within a week</option>
                    <option value="urgent" className="bg-[#09111a]">Urgent, within 48 hours</option>
                  </select>
                </div>
              </div>

              <div className="rounded-[28px] border border-slate-800 bg-[#09111a] p-5">
                <p className="text-[11px] uppercase tracking-[0.24em] text-slate-500">Submission</p>
                <p className="mt-2 text-sm text-slate-400">
                  Submit as much detail as possible so suppliers can assess sourcing speed, quantity availability, and specification match.
                </p>
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="mt-5 w-full rounded-xl bg-slate-100 py-4 font-semibold text-slate-950 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {loading ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
