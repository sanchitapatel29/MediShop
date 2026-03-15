'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Cookies from 'js-cookie'

export default function RequestProduct() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: '', description: '', quantity: '', urgency: 'normal'
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async () => {
    const token = Cookies.get('token')
    if (!token) { router.push('/login'); return }

    setLoading(true)
    const res = await fetch('/api/requests', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(formData)
    })

    setLoading(false)
    if (res.ok) {
      setSuccess(true)
    } else {
      const data = await res.json()
      setError(data.error)
    }
  }

  return (
    <main className="min-h-screen bg-[#0a1628] text-white">
      <nav className="bg-[#0d1f3c] border-b border-white/10 px-4 md:px-8 py-4 flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">M</span>
          </div>
          <span className="text-xl font-bold">MediShop</span>
        </div>
        <button
          onClick={() => router.push('/products')}
          className="text-white/60 hover:text-white text-sm transition"
        >
          ← Back to Products
        </button>
      </nav>

      <div className="max-w-2xl mx-auto px-4 md:px-8 py-8 md:py-12">
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">Request a Product</h1>
          <p className="text-white/40">Can&apos;t find what you need? Let us know and we&apos;ll source it for you.</p>
        </div>

        {success ? (
          <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-12 text-center">
            <p className="text-5xl mb-4">✅</p>
            <h2 className="text-2xl font-bold text-green-400 mb-2">Request Submitted!</h2>
            <p className="text-white/40 mb-6">Our team will review your request and get back to you within 24 hours.</p>
            <button
              onClick={() => router.push('/products')}
              className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-medium transition"
            >
              Back to Products
            </button>
          </div>
        ) : (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 md:p-8">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl mb-6 text-sm">
                {error}
              </div>
            )}

            <div className="space-y-5">
              <div>
                <label className="text-white/60 text-sm mb-2 block">Product Name</label>
                <input
                  type="text"
                  placeholder="e.g. Arthroscopic Shaver System"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-blue-500 transition"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>

              <div>
                <label className="text-white/60 text-sm mb-2 block">Description & Specifications</label>
                <textarea
                  placeholder="Describe the product, brand preference, specifications, or any other details..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-blue-500 transition"
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-white/60 text-sm mb-2 block">Quantity Required</label>
                  <input
                    type="number"
                    placeholder="e.g. 10"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-blue-500 transition"
                    value={formData.quantity}
                    onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-white/60 text-sm mb-2 block">Urgency</label>
                  <select
                    className="w-full bg-[#0a1628] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition"
                    value={formData.urgency}
                    onChange={(e) => setFormData({...formData, urgency: e.target.value})}
                  >
                    <option value="low">Low — Within a month</option>
                    <option value="normal">Normal — Within 2 weeks</option>
                    <option value="high">High — Within a week</option>
                    <option value="urgent">Urgent — Within 48 hours</option>
                  </select>
                </div>
              </div>

              <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white py-4 rounded-xl font-semibold transition shadow-lg shadow-blue-500/25"
              >
                {loading ? 'Submitting...' : 'Submit Request →'}
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
