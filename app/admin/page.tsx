'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Cookies from 'js-cookie'

interface Product {
  id: number
  name: string
  category: string
  price: number
  stock: number
  imageUrls?: string[]
}
interface OrderItem { id: number; quantity: number; price: number; product: { name: string } }
interface Order {
  id: number; total_price: number; status: string; created_at: string; payment_type: string;
  user: { name: string; email: string; hospital_name: string }
  items: OrderItem[]
  deliveryDetails?: {
    fullName: string
    phone: string
    email: string
    companyName: string
    addressLine1: string
    addressLine2: string
    city: string
    state: string
    postalCode: string
    country: string
    billingName: string
    billingGstin: string
    billingAddress: string
  } | null
}
interface Notification { id: number; title: string; message: string; type: string; is_read: boolean; created_at: string }

export default function Admin() {
  const router = useRouter()
  const [tab, setTab] = useState<'products' | 'orders' | 'requests'>('products')
  const [products, setProducts] = useState<Product[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [requests, setRequests] = useState<any[]>([])
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [showNotifications, setShowNotifications] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    description: '',
    detailedDescription: '',
    imageUrlsText: '',
    price: '',
    stock: '',
    certification: ''
  })
  const [message, setMessage] = useState('')

  const token = Cookies.get('token')

  const fetchAll = () => {
    // Fetch only this admin's products
    if (token) {
      fetch('/api/products?myProducts=true', { headers: { 'Authorization': `Bearer ${token}` } })
        .then(r => r.json())
        .then(data => setProducts(Array.isArray(data) ? data : []))
        .catch(() => setProducts([]))

      fetch('/api/orders/admin', { headers: { 'Authorization': `Bearer ${token}` } })
        .then(r => r.ok ? r.json() : [])
        .then(data => setOrders(Array.isArray(data) ? data : []))
        .catch(() => setOrders([]))

      fetch('/api/requests', { headers: { 'Authorization': `Bearer ${token}` } })
        .then(r => r.ok ? r.json() : [])
        .then(data => setRequests(Array.isArray(data) ? data : []))
        .catch(() => setRequests([]))

      fetch('/api/notifications', { headers: { 'Authorization': `Bearer ${token}` } })
        .then(r => r.ok ? r.json() : [])
        .then(data => setNotifications(Array.isArray(data) ? data : []))
        .catch(() => setNotifications([]))
    }
  }

  useEffect(() => { fetchAll() }, [])

  const unreadCount = notifications.filter(n => !n.is_read).length

  const markAllRead = async () => {
    await fetch('/api/notifications', {
      method: 'PATCH',
      headers: { 'Authorization': `Bearer ${token}` }
    })
    setNotifications(notifications.map(n => ({ ...n, is_read: true })))
  }

  const handleAddProduct = async () => {
    const res = await fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({
        ...formData,
        imageUrls: formData.imageUrlsText
          .split(/\r?\n|,/)
          .map((url) => url.trim())
          .filter(Boolean)
      })
    })
    if (res.ok) {
      setMessage('Product added!')
      setFormData({
        name: '',
        category: '',
        description: '',
        detailedDescription: '',
        imageUrlsText: '',
        price: '',
        stock: '',
        certification: ''
      })
      fetchAll()
      setTimeout(() => setMessage(''), 3000)
    }
  }

  const handleDelete = async (id: number) => {
    await fetch(`/api/products/${id}`, { method: 'DELETE' })
    setProducts(products.filter(p => p.id !== id))
  }

  const updateOrderStatus = async (orderId: number, status: string) => {
    await fetch('/api/orders/admin', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ orderId, status })
    })
    setOrders(orders.map(o => o.id === orderId ? { ...o, status } : o))
  }

  const deleteOrder = async (orderId: number) => {
    if (!confirm('Delete this order permanently?')) return
    await fetch('/api/orders/admin', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ orderId })
    })
    setOrders(orders.filter(o => o.id !== orderId))
  }

  const statusColor: Record<string, string> = {
    pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/20',
    shipped: 'bg-blue-500/20 text-blue-400 border-blue-500/20',
    delivered: 'bg-green-500/20 text-green-400 border-green-500/20',
  }

  const notifIcon: Record<string, string> = {
    order: '🛒', request: '📋', order_update: '📦', info: 'ℹ️'
  }

  const categories = ['Surgical Instruments', 'Diagnostic Equipment', 'Orthopedic Implants', 'ICU Equipment']

  return (
    <main className="min-h-screen bg-[#0a1628] text-white" suppressHydrationWarning>

      {/* Navbar */}
      <nav className="bg-[#0d1f3c] border-b border-white/10 px-4 md:px-8 py-4 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">M</span>
          </div>
          <span className="text-xl font-bold">MediShop</span>
          <span className="text-xs bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full border border-red-500/30">Admin</span>
        </div>
        <div className="flex items-center gap-3">

          {/* Notifications Bell */}
          <div className="relative">
            <button
              onClick={() => { setShowNotifications(!showNotifications); if (!showNotifications) markAllRead() }}
              className="relative w-10 h-10 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl flex items-center justify-center transition"
            >
              🔔
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 top-12 w-80 md:w-96 bg-[#0d1f3c] border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden">
                <div className="p-4 border-b border-white/10 flex justify-between items-center">
                  <h3 className="font-semibold">Notifications</h3>
                  <button onClick={() => setShowNotifications(false)} className="text-white/40 hover:text-white">✕</button>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <p className="text-white/40 text-center py-8 text-sm">No notifications yet</p>
                  ) : (
                    notifications.map(n => (
                      <div key={n.id} className={`p-4 border-b border-white/5 ${!n.is_read ? 'bg-blue-500/5' : ''}`}>
                        <div className="flex gap-3">
                          <span className="text-xl">{notifIcon[n.type] || 'ℹ️'}</span>
                          <div>
                            <p className="font-medium text-sm text-white">{n.title}</p>
                            <p className="text-white/50 text-xs mt-1 leading-relaxed">{n.message}</p>
                            <p className="text-white/30 text-xs mt-1">
                              {new Date(n.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          <button 
            onClick={() => router.push('/profile')} 
            className="w-10 h-10 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl flex items-center justify-center transition"
            title="Profile"
          >
            👤
          </button>

          <button onClick={() => router.push('/products')} className="text-white/60 hover:text-white text-sm transition">
            View Store →
          </button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-1">Admin Dashboard</h1>
          <p className="text-white/40">Manage inventory, orders, and requests</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'My Products', value: products.length },
            { label: 'Total Stock', value: products.reduce((s, p) => s + p.stock, 0) },
            { label: 'Orders to Fulfill', value: orders.filter(o => o.status === 'pending').length },
            { label: 'Pending Requests', value: requests.filter((r: any) => r.status === 'pending').length },
          ].map(stat => (
            <div key={stat.label} className="bg-white/5 border border-white/10 rounded-2xl p-4 md:p-6">
              <p className="text-2xl md:text-3xl font-bold text-blue-400 mb-1">{stat.value}</p>
              <p className="text-white/40 text-xs md:text-sm">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {(['products', 'orders', 'requests'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-5 py-2.5 rounded-xl text-sm font-medium transition capitalize ${
                tab === t ? 'bg-blue-600 text-white' : 'bg-white/5 text-white/50 hover:bg-white/10 border border-white/10'
              }`}
            >
              {t === 'orders' ? `Orders (${orders.length})` : t === 'requests' ? `Requests (${requests.length})` : 'Products'}
            </button>
          ))}
        </div>

        {/* PRODUCTS TAB */}
        {tab === 'products' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <h2 className="text-xl font-bold mb-6">Add New Product</h2>
              {message && (
                <div className="bg-green-500/10 border border-green-500/20 text-green-400 p-3 rounded-xl mb-4 text-sm">
                  ✓ {message}
                </div>
              )}
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Product Name"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-blue-500 transition"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
                <select
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition"
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                >
                  <option value="" className="bg-[#0a1628]">Select Category</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat} className="bg-[#0a1628]">{cat}</option>
                  ))}
                </select>
                <textarea
                  placeholder="Description"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-blue-500 transition"
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                />
                <textarea
                  placeholder="Detailed instrument description"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-blue-500 transition"
                  rows={5}
                  value={formData.detailedDescription}
                  onChange={(e) => setFormData({...formData, detailedDescription: e.target.value})}
                />
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="number"
                    placeholder="Price (₹)"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-blue-500 transition"
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                  />
                  <input
                    type="number"
                    placeholder="Stock"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-blue-500 transition"
                    value={formData.stock}
                    onChange={(e) => setFormData({...formData, stock: e.target.value})}
                  />
                </div>
                <input
                  type="text"
                  placeholder="Certification (optional)"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-blue-500 transition"
                  value={formData.certification}
                  onChange={(e) => setFormData({...formData, certification: e.target.value})}
                />
                <textarea
                  placeholder="Image URLs separated by commas or new lines"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-blue-500 transition"
                  rows={4}
                  value={formData.imageUrlsText}
                  onChange={(e) => setFormData({...formData, imageUrlsText: e.target.value})}
                />
                <button
                  onClick={handleAddProduct}
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-xl font-semibold transition"
                >
                  Add Product →
                </button>
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <h2 className="text-xl font-bold mb-6">All Products ({products.length})</h2>
              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {products.length === 0 ? (
                  <p className="text-white/40 text-center py-8">No products yet</p>
                ) : (
                  products.map(product => (
                    <div key={product.id} className="flex justify-between items-center bg-white/5 border border-white/10 rounded-xl p-4">
                      <div>
                        <p className="font-medium text-white">{product.name}</p>
                        <p className="text-xs text-white/40 mt-0.5">
                          {product.category} · ₹{product.price.toLocaleString()} · {product.stock} in stock
                        </p>
                      </div>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="text-red-400 hover:text-red-300 text-sm transition px-3 py-1 bg-red-500/10 rounded-lg hover:bg-red-500/20"
                      >
                        Delete
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* ORDERS TAB */}
        {tab === 'orders' && (
          <div className="space-y-4">
            {orders.length === 0 ? (
              <div className="bg-white/5 border border-white/10 rounded-2xl p-16 text-center">
                <p className="text-5xl mb-4">📦</p>
                <p className="text-white/40">No orders yet</p>
              </div>
            ) : (
              orders.map(order => (
                <div key={order.id} className="bg-white/5 border border-white/10 rounded-2xl p-6">
                  <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-4">
                    <div>
                      <p className="font-bold text-lg">
                        {order.items.length === 1
                          ? order.items[0].product.name
                          : `${order.items[0].product.name} + ${order.items.length - 1} more`}
                      </p>
                      <p className="text-white/30 text-xs mt-0.5">Order #{order.id}</p>
                      <p className="text-white/50 text-sm mt-2">
                        👤 {order.user.name} · {order.user.hospital_name || order.user.email}
                      </p>
                      <p className="text-white/30 text-xs mt-1">
                        {new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${statusColor[order.status] || statusColor.pending}`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                      <p className="font-bold text-blue-400">₹{order.total_price.toLocaleString()}</p>
                      {order.payment_type === 'split' && (
                        <span className="text-xs text-yellow-400">Split Payment</span>
                      )}
                    </div>
                  </div>

                  <div className="border-t border-white/10 pt-4 mb-4 space-y-2">
                    {order.items.map(item => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span className="text-white/60">{item.product.name} × {item.quantity}</span>
                        <span className="text-white">₹{(item.price * item.quantity).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>

                  {order.deliveryDetails && (
                    <div className="border-t border-white/10 pt-4 mb-4 grid gap-4 md:grid-cols-2 text-sm">
                      <div>
                        <p className="text-white/40 text-xs uppercase tracking-wider mb-2">Delivery</p>
                        <p className="text-white">{order.deliveryDetails.fullName}</p>
                        <p className="text-white/60">{order.deliveryDetails.phone}</p>
                        <p className="text-white/60">{order.deliveryDetails.email}</p>
                        <p className="text-white/60">
                          {order.deliveryDetails.addressLine1}
                          {order.deliveryDetails.addressLine2 ? `, ${order.deliveryDetails.addressLine2}` : ''}
                        </p>
                        <p className="text-white/60">
                          {order.deliveryDetails.city}, {order.deliveryDetails.state} {order.deliveryDetails.postalCode}
                        </p>
                        <p className="text-white/60">{order.deliveryDetails.country}</p>
                      </div>
                      <div>
                        <p className="text-white/40 text-xs uppercase tracking-wider mb-2">Billing</p>
                        <p className="text-white">{order.deliveryDetails.billingName}</p>
                        {order.deliveryDetails.billingGstin && (
                          <p className="text-white/60">GSTIN: {order.deliveryDetails.billingGstin}</p>
                        )}
                        <p className="text-white/60 whitespace-pre-line">{order.deliveryDetails.billingAddress}</p>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2 flex-wrap">
                    {['pending', 'shipped', 'delivered'].map(s => (
                      <button
                        key={s}
                        onClick={() => updateOrderStatus(order.id, s)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition capitalize ${
                          order.status === s
                            ? 'bg-blue-600 text-white'
                            : 'bg-white/5 border border-white/10 text-white/60 hover:bg-white/10'
                        }`}
                      >
                        {s === 'pending' ? '⏳ Pending' : s === 'shipped' ? '🚚 Mark Shipped' : '✅ Mark Delivered'}
                      </button>
                    ))}
                    <button
                      onClick={() => deleteOrder(order.id)}
                      className="px-4 py-2 rounded-lg text-sm font-medium bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition ml-auto"
                    >
                      🗑 Delete Order
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* REQUESTS TAB */}
        {tab === 'requests' && (
          <div className="space-y-4">
            {requests.length === 0 ? (
              <div className="bg-white/5 border border-white/10 rounded-2xl p-16 text-center">
                <p className="text-5xl mb-4">📋</p>
                <p className="text-white/40">No product requests yet</p>
              </div>
            ) : (
              requests.map((req: any) => (
                <div key={req.id} className="bg-white/5 border border-white/10 rounded-2xl p-6">
                  <div className="flex flex-col md:flex-row justify-between items-start gap-3">
                    <div className="flex-1">
                      <p className="font-bold text-white text-lg">{req.name}</p>
                      <p className="text-white/50 text-sm mt-1">{req.description}</p>
                      <p className="text-white/30 text-xs mt-3">
                        👤 {req.user.name} · {req.user.hospital_name || req.user.email} · Qty: {req.quantity}
                      </p>
                      <p className="text-white/30 text-xs mt-1">
                        {new Date(req.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border shrink-0 ${
                      req.urgency === 'urgent' ? 'bg-red-500/20 text-red-400 border-red-500/20' :
                      req.urgency === 'high' ? 'bg-orange-500/20 text-orange-400 border-orange-500/20' :
                      req.urgency === 'normal' ? 'bg-blue-500/20 text-blue-400 border-blue-500/20' :
                      'bg-white/10 text-white/40 border-white/10'
                    }`}>
                      {req.urgency.charAt(0).toUpperCase() + req.urgency.slice(1)} Priority
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

      </div>
    </main>
  )
}
