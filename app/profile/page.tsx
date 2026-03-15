'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Cookies from 'js-cookie'

interface UserProfile {
  id: number
  name: string
  email: string
  hospital_name: string | null
  role: string
  created_at: string
  orders: {
    id: number
    total_price: number
    status: string
    created_at: string
  }[]
  products?: {
    id: number
    name: string
    category: string
    price: number
    stock: number
    created_at: string
  }[]
  adminOrders?: {
    id: number
    total_price: number
    status: string
    created_at: string
  }[]
}

export default function Profile() {
  const router = useRouter()
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    const token = Cookies.get('token')
    if (!token) { router.push('/login'); return }

    fetch('/api/profile', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setUser(data)
        setLoading(false)
      })
  }, [router])

  const handleLogout = () => {
    Cookies.remove('token')
    Cookies.remove('role')
    router.push('/')
  }

  const handleDeleteProfile = async () => {
    const token = Cookies.get('token')
    if (!token || deleting) return

    const confirmed = window.confirm(
      'Delete your profile permanently? Your account details, personal orders, requests, and notifications will be removed.'
    )

    if (!confirmed) return

    setDeleting(true)

    try {
      const response = await fetch('/api/profile', {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete profile')
      }

      Cookies.remove('token')
      Cookies.remove('role')
      router.push('/')
      router.refresh()
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to delete profile')
      setDeleting(false)
    }
  }

  const totalSpent = user?.orders.reduce((sum, o) => sum + o.total_price, 0) || 0
  const totalRevenue = user?.adminOrders?.reduce((sum, o) => sum + o.total_price, 0) || 0
  const totalStock = user?.products?.reduce((sum, p) => sum + p.stock, 0) || 0

  if (loading) {
    return (
      <main className="min-h-screen bg-[#0a1628] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#0a1628] text-white">
      <nav className="bg-[#0d1f3c] border-b border-white/10 px-4 md:px-8 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">M</span>
          </div>
          <span className="text-xl font-bold">MediShop</span>
        </div>
        <button
          onClick={() => router.push(user?.role === 'admin' ? '/admin' : '/products')}
          className="text-white/60 hover:text-white text-sm transition"
        >
          ← Back to {user?.role === 'admin' ? 'Dashboard' : 'Products'}
        </button>
      </nav>

      <div className="max-w-2xl mx-auto px-4 md:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-1">My Profile</h1>
          <p className="text-white/40">Manage your account details</p>
        </div>

        {/* Avatar + Name */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-4 flex items-center gap-5">
          <div className="w-16 h-16 bg-blue-500/20 border border-blue-500/30 rounded-2xl flex items-center justify-center flex-shrink-0">
            <span className="text-2xl font-bold text-blue-400">
              {user?.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">{user?.name}</h2>
            <p className="text-white/40 text-sm">{user?.email}</p>
            <span className={`inline-block mt-2 px-3 py-0.5 rounded-full text-xs font-medium border ${
              user?.role === 'admin'
                ? 'bg-red-500/20 text-red-400 border-red-500/20'
                : 'bg-blue-500/20 text-blue-400 border-blue-500/20'
            }`}>
              {user?.role === 'admin' ? 'Administrator' : 'Doctor'}
            </span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          {user?.role === 'admin' ? (
            <>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                <p className="text-3xl font-bold text-blue-400 mb-1">{user?.products?.length || 0}</p>
                <p className="text-white/40 text-sm">Products Listed</p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                <p className="text-3xl font-bold text-blue-400 mb-1">{totalStock}</p>
                <p className="text-white/40 text-sm">Total Stock</p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                <p className="text-3xl font-bold text-green-400 mb-1">{user?.adminOrders?.length || 0}</p>
                <p className="text-white/40 text-sm">Orders Received</p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                <p className="text-2xl font-bold text-green-400 mb-1">₹{totalRevenue.toLocaleString()}</p>
                <p className="text-white/40 text-sm">Total Revenue</p>
              </div>
            </>
          ) : (
            <>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                <p className="text-3xl font-bold text-blue-400 mb-1">{user?.orders.length}</p>
                <p className="text-white/40 text-sm">Total Orders</p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                <p className="text-2xl font-bold text-blue-400 mb-1">₹{totalSpent.toLocaleString()}</p>
                <p className="text-white/40 text-sm">Total Spent</p>
              </div>
            </>
          )}
        </div>

        {/* Details */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-4 space-y-4">
          <h3 className="font-semibold text-white/60 text-sm uppercase tracking-wider">Account Details</h3>
          <div className="flex justify-between items-center py-3 border-b border-white/5">
            <span className="text-white/40 text-sm">Full Name</span>
            <span className="text-white font-medium">{user?.name}</span>
          </div>
          <div className="flex justify-between items-center py-3 border-b border-white/5">
            <span className="text-white/40 text-sm">Email</span>
            <span className="text-white font-medium">{user?.email}</span>
          </div>
          <div className="flex justify-between items-center py-3 border-b border-white/5">
            <span className="text-white/40 text-sm">{user?.role === 'admin' ? 'Company/Store' : 'Hospital'}</span>
            <span className="text-white font-medium">{user?.hospital_name || '—'}</span>
          </div>
          <div className="flex justify-between items-center py-3">
            <span className="text-white/40 text-sm">Member Since</span>
            <span className="text-white font-medium">
              {user?.created_at && new Date(user.created_at).toLocaleDateString('en-IN', {
                day: 'numeric', month: 'long', year: 'numeric'
              })}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          {user?.role === 'admin' ? (
            <button
              onClick={() => router.push('/admin')}
              className="w-full bg-white/5 border border-white/10 hover:border-blue-500/40 text-white py-4 rounded-xl font-medium transition flex justify-between items-center px-6"
            >
              <span>Admin Dashboard</span>
              <span className="text-white/40">→</span>
            </button>
          ) : (
            <button
              onClick={() => router.push('/orders')}
              className="w-full bg-white/5 border border-white/10 hover:border-blue-500/40 text-white py-4 rounded-xl font-medium transition flex justify-between items-center px-6"
            >
              <span>View My Orders</span>
              <span className="text-white/40">→</span>
            </button>
          )}
          <button
            onClick={() => router.push('/products')}
            className="w-full bg-white/5 border border-white/10 hover:border-blue-500/40 text-white py-4 rounded-xl font-medium transition flex justify-between items-center px-6"
          >
            <span>{user?.role === 'admin' ? 'View Store' : 'Browse Products'}</span>
            <span className="text-white/40">→</span>
          </button>
          <button
            onClick={handleLogout}
            className="w-full bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 text-red-400 py-4 rounded-xl font-medium transition"
          >
            Log Out
          </button>
          <button
            onClick={handleDeleteProfile}
            disabled={deleting}
            className="w-full bg-red-600/15 border border-red-600/30 hover:bg-red-600/25 text-red-300 py-4 rounded-xl font-medium transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {deleting ? 'Deleting Profile...' : 'Delete Profile'}
          </button>
        </div>
      </div>
    </main>
  )
}
