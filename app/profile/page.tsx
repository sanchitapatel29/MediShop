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
    if (!token) {
      router.push('/login')
      return
    }

    fetch('/api/profile', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((res) => res.json())
      .then((data) => {
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

  const totalSpent = user?.orders.reduce((sum, order) => sum + order.total_price, 0) || 0
  const totalRevenue = user?.adminOrders?.reduce((sum, order) => sum + order.total_price, 0) || 0
  const totalStock = user?.products?.reduce((sum, product) => sum + product.stock, 0) || 0

  if (loading) {
    return (
      <main className="app-shell flex min-h-screen items-center justify-center text-slate-100">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-300 border-t-transparent" />
      </main>
    )
  }

  return (
    <main className="app-shell min-h-screen text-slate-100">
      <nav className="border-b border-white/10 bg-[#0b1623]/90 px-4 py-4 backdrop-blur-xl md:px-8">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-700 bg-slate-100 text-sm font-bold text-slate-900">
              M
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-[0.28em] text-slate-500">Account Center</p>
              <span className="text-xl font-semibold tracking-tight">My Profile</span>
            </div>
          </div>
          <button
            onClick={() => router.push(user?.role === 'admin' ? '/admin' : '/products')}
            className="rounded-xl border border-slate-800 bg-slate-950/45 px-4 py-2 text-sm text-slate-300 transition hover:border-slate-700 hover:text-white"
          >
            Back to {user?.role === 'admin' ? 'Dashboard' : 'Products'}
          </button>
        </div>
      </nav>

      <div className="mx-auto max-w-5xl px-4 py-8 md:px-8">
        <section className="mb-8 rounded-[32px] border border-white/10 bg-[linear-gradient(135deg,rgba(15,23,42,0.92),rgba(9,18,29,0.78))] p-6 shadow-[0_32px_90px_rgba(2,6,23,0.34)] md:p-8">
          <p className="text-xs uppercase tracking-[0.34em] text-slate-400">Profile Summary</p>
          <div className="mt-4 flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-5">
              <div className="flex h-20 w-20 items-center justify-center rounded-[24px] border border-slate-700 bg-slate-100 text-3xl font-semibold text-slate-900">
                {user?.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h1 className="text-3xl font-semibold tracking-tight">{user?.name}</h1>
                <p className="mt-1 text-sm text-slate-400">{user?.email}</p>
                <span className={`mt-3 inline-block rounded-full border px-3 py-1 text-xs font-medium ${
                  user?.role === 'admin'
                    ? 'border-red-500/20 bg-red-500/10 text-red-200'
                    : 'border-slate-700 bg-slate-900/70 text-slate-300'
                }`}>
                  {user?.role === 'admin' ? 'Administrator' : 'Buyer Account'}
                </span>
              </div>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-950/40 px-4 py-3 text-sm text-slate-300">
              Member since{' '}
              <span className="font-semibold text-slate-100">
                {user?.created_at && new Date(user.created_at).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}
              </span>
            </div>
          </div>
        </section>

        <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
          {user?.role === 'admin' ? (
            <>
              <div className="rounded-2xl border border-slate-800 bg-slate-950/45 p-5">
                <p className="text-[11px] uppercase tracking-[0.24em] text-slate-500">Products Listed</p>
                <p className="mt-2 text-3xl font-semibold tracking-tight">{user?.products?.length || 0}</p>
              </div>
              <div className="rounded-2xl border border-slate-800 bg-slate-950/45 p-5">
                <p className="text-[11px] uppercase tracking-[0.24em] text-slate-500">Total Stock</p>
                <p className="mt-2 text-3xl font-semibold tracking-tight">{totalStock}</p>
              </div>
              <div className="rounded-2xl border border-slate-800 bg-slate-950/45 p-5">
                <p className="text-[11px] uppercase tracking-[0.24em] text-slate-500">Orders Received</p>
                <p className="mt-2 text-3xl font-semibold tracking-tight">{user?.adminOrders?.length || 0}</p>
              </div>
              <div className="rounded-2xl border border-slate-800 bg-slate-950/45 p-5">
                <p className="text-[11px] uppercase tracking-[0.24em] text-slate-500">Total Revenue</p>
                <p className="mt-2 text-2xl font-semibold tracking-tight">₹{totalRevenue.toLocaleString()}</p>
              </div>
            </>
          ) : (
            <>
              <div className="rounded-2xl border border-slate-800 bg-slate-950/45 p-5">
                <p className="text-[11px] uppercase tracking-[0.24em] text-slate-500">Total Orders</p>
                <p className="mt-2 text-3xl font-semibold tracking-tight">{user?.orders.length}</p>
              </div>
              <div className="rounded-2xl border border-slate-800 bg-slate-950/45 p-5">
                <p className="text-[11px] uppercase tracking-[0.24em] text-slate-500">Total Spend</p>
                <p className="mt-2 text-2xl font-semibold tracking-tight">₹{totalSpent.toLocaleString()}</p>
              </div>
            </>
          )}
        </div>

        <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <section className="rounded-[32px] border border-slate-800 bg-slate-950/45 p-6 shadow-[0_24px_70px_rgba(2,6,23,0.2)]">
            <h2 className="text-lg font-semibold">Account Details</h2>
            <div className="mt-5 space-y-4">
              {[
                ['Full Name', user?.name],
                ['Email', user?.email],
                [user?.role === 'admin' ? 'Company / Store' : 'Hospital / Clinic', user?.hospital_name || 'Not provided'],
              ].map(([label, value]) => (
                <div key={label} className="rounded-2xl border border-slate-800 bg-[#09111a] px-4 py-4">
                  <p className="text-[11px] uppercase tracking-[0.24em] text-slate-500">{label}</p>
                  <p className="mt-2 text-sm font-medium text-slate-100">{value}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-[32px] border border-slate-800 bg-slate-950/45 p-6 shadow-[0_24px_70px_rgba(2,6,23,0.2)]">
            <h2 className="text-lg font-semibold">Actions</h2>
            <div className="mt-5 space-y-3">
              {user?.role === 'admin' ? (
                <button
                  onClick={() => router.push('/admin')}
                  className="flex w-full items-center justify-between rounded-2xl border border-slate-800 bg-[#09111a] px-5 py-4 text-left transition hover:border-slate-700"
                >
                  <span className="font-medium text-slate-100">Open Admin Dashboard</span>
                  <span className="text-slate-500">Go</span>
                </button>
              ) : (
                <button
                  onClick={() => router.push('/orders')}
                  className="flex w-full items-center justify-between rounded-2xl border border-slate-800 bg-[#09111a] px-5 py-4 text-left transition hover:border-slate-700"
                >
                  <span className="font-medium text-slate-100">View My Orders</span>
                  <span className="text-slate-500">Go</span>
                </button>
              )}
              <button
                onClick={() => router.push('/products')}
                className="flex w-full items-center justify-between rounded-2xl border border-slate-800 bg-[#09111a] px-5 py-4 text-left transition hover:border-slate-700"
              >
                <span className="font-medium text-slate-100">{user?.role === 'admin' ? 'View Storefront' : 'Browse Products'}</span>
                <span className="text-slate-500">Go</span>
              </button>
              <button
                onClick={handleLogout}
                className="w-full rounded-2xl border border-slate-700 bg-slate-100 px-5 py-4 font-semibold text-slate-950 transition hover:bg-white"
              >
                Log Out
              </button>
              <button
                onClick={handleDeleteProfile}
                disabled={deleting}
                className="w-full rounded-2xl border border-red-500/20 bg-red-500/10 px-5 py-4 font-medium text-red-200 transition hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {deleting ? 'Deleting Profile...' : 'Delete Profile'}
              </button>
            </div>
          </section>
        </div>
      </div>
    </main>
  )
}
