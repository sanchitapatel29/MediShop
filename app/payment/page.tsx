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
    // Simulate payment processing delay
    await new Promise(resolve => setTimeout(resolve, 2500))
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
      <main className="min-h-screen bg-[#0a1628] text-white flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-6" />
          <h2 className="text-2xl font-bold mb-2">Processing Payment</h2>
          <p className="text-white/40">Please wait, do not close this page...</p>
        </div>
      </main>
    )
  }

  if (step === 'success') {
    return (
      <main className="min-h-screen bg-[#0a1628] text-white flex items-center justify-center px-4">
        <div className="text-center max-w-md px-4 sm:px-8">
          <div className="w-20 h-20 bg-green-500/20 border border-green-500/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl">✓</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-green-400 mb-2">Payment Successful!</h2>
          <p className="text-white/40 mb-2">Order #{orderId} confirmed</p>
          <p className="text-white/40 mb-8">₹{amount.toLocaleString()} paid successfully</p>
          <button
            onClick={() => router.push('/orders')}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white py-4 rounded-xl font-semibold transition"
          >
            View My Orders →
          </button>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#0a1628] text-white">
      <nav className="bg-[#0d1f3c] border-b border-white/10 px-4 md:px-8 py-4 flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">M</span>
          </div>
          <span className="text-xl font-bold">MediShop</span>
          <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full border border-green-500/30">
            🔒 Secure Payment
          </span>
        </div>
      </nav>

      <div className="max-w-md mx-auto px-4 md:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-1">Complete Payment</h1>
          <p className="text-white/40 text-sm">Order #{orderId}</p>
        </div>

        {/* Amount */}
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-4 mb-6 flex flex-col gap-2 sm:flex-row sm:justify-between sm:items-center">
          <span className="text-white/60">Amount to Pay</span>
          <span className="text-2xl font-bold text-blue-400">₹{amount.toLocaleString()}</span>
        </div>

        {/* Payment Method Tabs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-6">
          <button
            onClick={() => setPaymentMethod('card')}
            className={`flex-1 py-3 rounded-xl text-sm font-medium transition border ${
              paymentMethod === 'card'
                ? 'bg-blue-600 border-blue-600 text-white'
                : 'bg-white/5 border-white/10 text-white/60 hover:border-white/20'
            }`}
          >
            💳 Card
          </button>
          <button
            onClick={() => setPaymentMethod('upi')}
            className={`flex-1 py-3 rounded-xl text-sm font-medium transition border ${
              paymentMethod === 'upi'
                ? 'bg-blue-600 border-blue-600 text-white'
                : 'bg-white/5 border-white/10 text-white/60 hover:border-white/20'
            }`}
          >
            📱 UPI
          </button>
        </div>

        {/* Card Form */}
        {paymentMethod === 'card' && (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
            <div>
              <label className="text-white/60 text-sm mb-2 block">Card Number</label>
              <input
                type="text"
                placeholder="1234 5678 9012 3456"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-blue-500 transition"
                value={formData.cardNumber}
                onChange={(e) => setFormData({...formData, cardNumber: formatCardNumber(e.target.value)})}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-white/60 text-sm mb-2 block">Expiry</label>
                <input
                  type="text"
                  placeholder="MM/YY"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-blue-500 transition"
                  value={formData.expiry}
                  onChange={(e) => setFormData({...formData, expiry: formatExpiry(e.target.value)})}
                />
              </div>
              <div>
                <label className="text-white/60 text-sm mb-2 block">CVV</label>
                <input
                  type="password"
                  placeholder="•••"
                  maxLength={3}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-blue-500 transition"
                  value={formData.cvv}
                  onChange={(e) => setFormData({...formData, cvv: e.target.value})}
                />
              </div>
            </div>
            <div>
              <label className="text-white/60 text-sm mb-2 block">Name on Card</label>
              <input
                type="text"
                placeholder="Dr. John Smith"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-blue-500 transition"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>
          </div>
        )}

        {/* UPI Form */}
        {paymentMethod === 'upi' && (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <label className="text-white/60 text-sm mb-2 block">UPI ID</label>
            <input
              type="text"
              placeholder="yourname@upi"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-blue-500 transition"
              value={formData.upi}
              onChange={(e) => setFormData({...formData, upi: e.target.value})}
            />
            <p className="text-white/30 text-xs mt-3">Enter your UPI ID to proceed with payment</p>
          </div>
        )}

        <button
          onClick={handlePayment}
          className="w-full bg-blue-600 hover:bg-blue-500 text-white py-4 rounded-xl font-semibold text-lg transition shadow-lg shadow-blue-500/25 mt-6"
        >
          Pay ₹{amount.toLocaleString()} →
        </button>

        <p className="text-center text-white/30 text-xs mt-4">
          🔒 Your payment is secured with 256-bit SSL encryption
        </p>
      </div>
    </main>
  )
}
