'use client'
import { useRouter } from 'next/navigation'

export default function Home() {
  const router = useRouter()

  return (
    <main className="min-h-screen bg-[#0a1628] text-white overflow-hidden relative">
      {/* Background grid */}
      <div className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: 'linear-gradient(#1e40af 1px, transparent 1px), linear-gradient(90deg, #1e40af 1px, transparent 1px)',
          backgroundSize: '60px 60px'
        }}
      />

      {/* Glow effect */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-blue-500 opacity-10 blur-[120px] rounded-full" />

      {/* Navbar */}
      <nav className="relative z-10 flex justify-between items-center px-12 py-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">M</span>
          </div>
          <span className="text-xl font-bold tracking-tight">MediShop</span>
          <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full border border-blue-500/30">B2B</span>
        </div>
        <div className="flex gap-4">
          <button
            onClick={() => router.push('/login')}
            className="px-5 py-2 text-sm text-white/70 hover:text-white transition"
          >
            Login
          </button>
          <button
            onClick={() => router.push('/signup')}
            className="px-5 py-2 text-sm bg-blue-600 hover:bg-blue-500 rounded-lg transition font-medium"
          >
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero */}
      <div className="relative z-10 max-w-5xl mx-auto px-12 pt-24 pb-20 text-center">
        <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-4 py-2 mb-8">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          <span className="text-sm text-blue-300">Trusted by 500+ hospitals across India</span>
        </div>

        <h1 className="text-6xl font-bold leading-tight mb-6 tracking-tight">
          Medical Equipment
          <br />
          <span className="text-blue-400">Procurement Made Simple</span>
        </h1>

        <p className="text-lg text-white/50 max-w-2xl mx-auto mb-12 leading-relaxed">
          Browse certified surgical instruments, diagnostic equipment, and orthopedic implants.
          Order in bulk directly from verified manufacturers.
        </p>

        <div className="flex gap-4 justify-center">
          <button
            onClick={() => router.push('/signup')}
            className="px-8 py-4 bg-blue-600 hover:bg-blue-500 rounded-xl font-semibold text-lg transition shadow-lg shadow-blue-500/25"
          >
            Start Ordering →
          </button>
          <button
            onClick={() => router.push('/login')}
            className="px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl font-semibold text-lg transition"
          >
            Login to Account
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="relative z-10 max-w-4xl mx-auto px-12 pb-24">
        <div className="grid grid-cols-3 gap-6">
          {[
            { number: '2,500+', label: 'Products Available' },
            { number: '500+', label: 'Hospitals Served' },
            { number: '99.8%', label: 'Order Accuracy' },
          ].map((stat) => (
            <div key={stat.label} className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center">
              <p className="text-4xl font-bold text-blue-400 mb-2">{stat.number}</p>
              <p className="text-white/50 text-sm">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}