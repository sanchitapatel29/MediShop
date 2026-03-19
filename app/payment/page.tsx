'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function Payment() {
  const router = useRouter()
  const [step, setStep] = useState<'details' | 'processing' | 'success'>('details')
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'upi'>('card')
  const [amount] = useState(() => {
    if (typeof window === 'undefined') return 0
    const pendingPayment = JSON.parse(localStorage.getItem('pendingPayment') || '{}')
    return pendingPayment.amount || 0
  })
  const [orderId] = useState(() => {
    if (typeof window === 'undefined') return ''
    const pendingPayment = JSON.parse(localStorage.getItem('pendingPayment') || '{}')
    return pendingPayment.orderId || ''
  })
  const [formData, setFormData] = useState({
    cardNumber: '', expiry: '', cvv: '', name: '', upi: ''
  })

  useEffect(() => {
    if (!amount) {
      router.push('/cart')
    }
  }, [amount, router])

  const handlePayment = async () => {
    setStep('processing')
    await new Promise((resolve) => setTimeout(resolve, 2500))
    localStorage.removeItem('pendingPayment')
    localStorage.removeItem('cart')
    setStep('success')
  }

  const formatCardNumber = (value: string) => {
    return value.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim().slice(0, 19)
  }

  const formatExpiry = (value: string) => {
    return value.replace(/\D/g, '').replace(/(\d{2})(\d)/, '$1/$2').slice(0, 5)
  }

  if (step === 'processing') {
    return (
      <main className="app-shell flex min-h-screen items-center justify-center px-4 text-slate-100">
        <div className="text-center">
          <div className="mx-auto mb-6 h-16 w-16 animate-spin rounded-full border-4 border-slate-300 border-t-transparent" />
          <h2 className="text-2xl font-semibold tracking-tight">Processing Payment</h2>
          <p className="mt-2 text-slate-400">Please wait while your transaction is being confirmed.</p>
        </div>
      </main>
    )
  }

  if (step === 'success') {
    return (
      <main className="app-shell flex min-h-screen items-center justify-center px-4 text-slate-100">
        <div className="w-full max-w-md rounded-[32px] border border-slate-800 bg-slate-950/55 p-8 text-center shadow-[0_30px_80px_rgba(2,6,23,0.28)]">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full border border-emerald-500/20 bg-emerald-500/10 text-sm font-semibold tracking-[0.3em] text-emerald-200">
            OK
          </div>
          <h2 className="text-3xl font-semibold tracking-tight text-slate-100">Payment Successful</h2>
          <p className="mt-2 text-slate-400">Order #{orderId} confirmed</p>
          <p className="mt-2 text-slate-300">₹{amount.toLocaleString()} paid successfully</p>
          <button
            onClick={() => router.push('/orders')}
            className="mt-8 w-full rounded-xl bg-slate-100 py-4 font-semibold text-slate-950 transition hover:bg-white"
          >
            View My Orders
          </button>
        </div>
      </main>
    )
  }

  return (
    <main className="app-shell min-h-screen text-slate-100">
      <nav className="border-b border-white/10 bg-[#0b1623]/90 px-4 py-4 backdrop-blur-xl md:px-8">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-700 bg-slate-100 text-sm font-bold text-slate-900">
              M
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-[0.28em] text-slate-500">Secure Checkout</p>
              <span className="text-xl font-semibold tracking-tight">Payment</span>
            </div>
          </div>
          <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-emerald-200">
            Secure Session
          </span>
        </div>
      </nav>

      <div className="mx-auto max-w-4xl px-4 py-8 md:px-8">
        <section className="mb-8 rounded-[32px] border border-white/10 bg-[linear-gradient(135deg,rgba(15,23,42,0.92),rgba(9,18,29,0.78))] p-6 shadow-[0_32px_90px_rgba(2,6,23,0.34)] md:p-8">
          <p className="text-xs uppercase tracking-[0.34em] text-slate-400">Payment Confirmation</p>
          <div className="mt-3 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">Complete payment for your confirmed order.</h1>
              <p className="mt-3 text-sm leading-relaxed text-slate-400 md:text-base">
                Order #{orderId} is ready for payment. Choose card or UPI and confirm the due amount securely.
              </p>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-950/40 px-4 py-3 text-sm text-slate-300">
              Amount due: <span className="font-semibold text-slate-100">₹{amount.toLocaleString()}</span>
            </div>
          </div>
        </section>

        <div className="rounded-[32px] border border-slate-800 bg-slate-950/45 p-6 shadow-[0_24px_70px_rgba(2,6,23,0.2)] md:p-7">
          <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <button
              onClick={() => setPaymentMethod('card')}
              className={`rounded-2xl border p-4 text-left transition ${
                paymentMethod === 'card'
                  ? 'border-slate-600 bg-slate-100 text-slate-950'
                  : 'border-slate-800 bg-[#09111a] text-slate-300 hover:border-slate-700'
              }`}
            >
              <p className="text-sm font-semibold">Card Payment</p>
              <p className={`mt-1 text-xs ${paymentMethod === 'card' ? 'text-slate-700' : 'text-slate-500'}`}>Use debit or credit card</p>
            </button>
            <button
              onClick={() => setPaymentMethod('upi')}
              className={`rounded-2xl border p-4 text-left transition ${
                paymentMethod === 'upi'
                  ? 'border-slate-600 bg-slate-100 text-slate-950'
                  : 'border-slate-800 bg-[#09111a] text-slate-300 hover:border-slate-700'
              }`}
            >
              <p className="text-sm font-semibold">UPI</p>
              <p className={`mt-1 text-xs ${paymentMethod === 'upi' ? 'text-slate-700' : 'text-slate-500'}`}>Pay using UPI ID</p>
            </button>
          </div>

          {paymentMethod === 'card' && (
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Card Number"
                className="w-full rounded-xl border border-slate-800 bg-[#09111a] px-4 py-3 text-slate-100 placeholder-slate-500 transition focus:border-slate-600 focus:outline-none"
                value={formData.cardNumber}
                onChange={(e) => setFormData({ ...formData, cardNumber: formatCardNumber(e.target.value) })}
              />
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <input
                  type="text"
                  placeholder="MM/YY"
                  className="w-full rounded-xl border border-slate-800 bg-[#09111a] px-4 py-3 text-slate-100 placeholder-slate-500 transition focus:border-slate-600 focus:outline-none"
                  value={formData.expiry}
                  onChange={(e) => setFormData({ ...formData, expiry: formatExpiry(e.target.value) })}
                />
                <input
                  type="password"
                  placeholder="CVV"
                  maxLength={3}
                  className="w-full rounded-xl border border-slate-800 bg-[#09111a] px-4 py-3 text-slate-100 placeholder-slate-500 transition focus:border-slate-600 focus:outline-none"
                  value={formData.cvv}
                  onChange={(e) => setFormData({ ...formData, cvv: e.target.value })}
                />
              </div>
              <input
                type="text"
                placeholder="Name on Card"
                className="w-full rounded-xl border border-slate-800 bg-[#09111a] px-4 py-3 text-slate-100 placeholder-slate-500 transition focus:border-slate-600 focus:outline-none"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
          )}

          {paymentMethod === 'upi' && (
            <div className="space-y-3">
              <input
                type="text"
                placeholder="yourname@upi"
                className="w-full rounded-xl border border-slate-800 bg-[#09111a] px-4 py-3 text-slate-100 placeholder-slate-500 transition focus:border-slate-600 focus:outline-none"
                value={formData.upi}
                onChange={(e) => setFormData({ ...formData, upi: e.target.value })}
              />
              <p className="text-xs text-slate-500">Enter your UPI ID to proceed with payment.</p>
            </div>
          )}

          <div className="mt-6 rounded-[28px] border border-slate-800 bg-[#09111a] p-5">
            <p className="text-[11px] uppercase tracking-[0.24em] text-slate-500">Amount to Pay</p>
            <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-100">₹{amount.toLocaleString()}</p>
            <button
              onClick={handlePayment}
              className="mt-5 w-full rounded-xl bg-slate-100 py-4 text-base font-semibold text-slate-950 transition hover:bg-white"
            >
              Pay ₹{amount.toLocaleString()}
            </button>
          </div>
        </div>
      </div>
    </main>
  )
}
