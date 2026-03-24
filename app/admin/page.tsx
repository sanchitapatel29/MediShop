'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { BrandLogo } from '../brand-logo'

interface Product {
  id: number
  name: string
  category: string
  price: number
  stock: number
}

interface OrderItem {
  id: number
  quantity: number
  price: number
  product: { name: string }
}

interface Order {
  id: number
  total_price: number
  status: string
  created_at: string
  payment_type: string
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

interface Notification {
  id: number
  title: string
  message: string
  type: string
  is_read: boolean
  created_at: string
}

interface ProductRequest {
  id: number
  name: string
  description: string
  quantity: number
  urgency: string
  status: string
  created_at: string
  user: {
    name: string
    email: string
    hospital_name: string | null
  }
}

const categories = ['Surgical Instruments', 'Diagnostic Equipment', 'Orthopedic Implants', 'ICU Equipment']

const statusColor: Record<string, string> = {
  pending: 'bg-amber-500/10 text-amber-200 border-amber-500/20',
  shipped: 'bg-sky-500/10 text-sky-200 border-sky-500/20',
  delivered: 'bg-emerald-500/10 text-emerald-200 border-emerald-500/20',
}

const urgencyColor: Record<string, string> = {
  urgent: 'bg-red-500/12 text-red-200 border-red-500/20',
  high: 'bg-orange-500/12 text-orange-200 border-orange-500/20',
  normal: 'bg-blue-500/12 text-blue-200 border-blue-500/20',
}

const notificationBadge: Record<string, string> = {
  order: 'OR',
  request: 'RQ',
  order_update: 'UP',
  info: 'IN',
}

export default function Admin() {
  const router = useRouter()
  const [tab, setTab] = useState<'products' | 'orders' | 'requests'>('products')
  const [products, setProducts] = useState<Product[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [requests, setRequests] = useState<ProductRequest[]>([])
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

  useEffect(() => {
    fetch('/api/products?myProducts=true', { cache: 'no-store' })
      .then((response) => response.json())
      .then((data) => setProducts(Array.isArray(data) ? data : []))
      .catch(() => setProducts([]))

    fetch('/api/orders/admin', { cache: 'no-store' })
      .then((response) => (response.ok ? response.json() : []))
      .then((data) => setOrders(Array.isArray(data) ? data : []))
      .catch(() => setOrders([]))

    fetch('/api/requests', { cache: 'no-store' })
      .then((response) => (response.ok ? response.json() : []))
      .then((data) => setRequests(Array.isArray(data) ? data : []))
      .catch(() => setRequests([]))

    fetch('/api/notifications', { cache: 'no-store' })
      .then((response) => (response.ok ? response.json() : []))
      .then((data) => setNotifications(Array.isArray(data) ? data : []))
      .catch(() => setNotifications([]))
  }, [router])

  const unreadCount = notifications.filter((notification) => !notification.is_read).length

  const markAllRead = async () => {
    await fetch('/api/notifications', {
      method: 'PATCH'
    })
    setNotifications(notifications.map((notification) => ({ ...notification, is_read: true })))
  }

  const handleAddProduct = async () => {
    const res = await fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...formData,
        imageUrls: formData.imageUrlsText
          .split(/\r?\n|,/)
          .map((url) => url.trim())
          .filter(Boolean)
      })
    })

    if (res.ok) {
      setMessage('Product added successfully.')
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

      fetch('/api/products?myProducts=true')
        .then((response) => response.json())
        .then((data) => setProducts(Array.isArray(data) ? data : []))
        .catch(() => setProducts([]))

      setTimeout(() => setMessage(''), 3000)
    }
  }

  const handleDelete = async (id: number) => {
    await fetch(`/api/products/${id}`, { method: 'DELETE' })
    setProducts(products.filter((product) => product.id !== id))
  }

  const updateOrderStatus = async (orderId: number, status: string) => {
    await fetch('/api/orders/admin', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId, status })
    })
    setOrders(orders.map((order) => (order.id === orderId ? { ...order, status } : order)))
  }

  const deleteOrder = async (orderId: number) => {
    if (!confirm('Delete this order permanently?')) return
    await fetch('/api/orders/admin', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId })
    })
    setOrders(orders.filter((order) => order.id !== orderId))
  }

  return (
    <main className="app-shell min-h-screen text-slate-100" suppressHydrationWarning>
      <nav className="sticky top-0 z-50 flex flex-col gap-3 border-b border-white/10 bg-[#0b1623]/90 px-4 py-4 backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between md:px-8">
        <div className="flex items-center gap-3">
          <BrandLogo size='sm' />
          <p className="font-display text-xl font-semibold tracking-[-0.04em] text-slate-100">MedEquip Supplier Desk</p>
        </div>

        <div className="flex items-center gap-3 self-end sm:self-auto">
          <div className="relative">
            <button
              onClick={() => {
                setShowNotifications(!showNotifications)
                if (!showNotifications) markAllRead()
              }}
              className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-slate-800 bg-slate-900/70 text-[11px] font-semibold tracking-[0.18em] text-slate-300 transition hover:border-slate-700 hover:bg-slate-800"
            >
              AL
              {unreadCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 top-12 z-50 w-[calc(100vw-2rem)] max-w-96 overflow-hidden rounded-2xl border border-slate-800 bg-[#0b1623] shadow-2xl">
                <div className="flex items-center justify-between border-b border-white/10 p-4">
                  <h3 className="font-semibold">Notifications</h3>
                  <button onClick={() => setShowNotifications(false)} className="text-sm text-slate-400 hover:text-white">
                    Close
                  </button>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <p className="py-8 text-center text-sm text-slate-500">No notifications yet</p>
                  ) : (
                    notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`border-b border-white/5 p-4 ${!notification.is_read ? 'bg-blue-500/5' : ''}`}
                      >
                        <div className="flex gap-3">
                          <span className="mt-0.5 inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-700 bg-slate-900 text-[10px] font-semibold tracking-[0.18em] text-slate-300">
                            {notificationBadge[notification.type] || 'IN'}
                          </span>
                          <div>
                            <p className="text-sm font-medium text-white">{notification.title}</p>
                            <p className="mt-1 text-xs leading-relaxed text-slate-400">{notification.message}</p>
                            <p className="mt-1 text-xs text-slate-500">
                              {new Date(notification.created_at).toLocaleDateString('en-IN', {
                                day: 'numeric',
                                month: 'short',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
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
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-800 bg-slate-900/70 text-[11px] font-semibold tracking-[0.18em] text-slate-300 transition hover:border-slate-700 hover:bg-slate-800"
            title="Profile"
          >
            PF
          </button>

          <button
            onClick={() => router.push('/products')}
            className="rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-2 text-sm text-slate-300 transition hover:border-slate-700 hover:text-white"
          >
            View Store
          </button>
        </div>
      </nav>

      <div className="mx-auto max-w-7xl px-4 py-8 md:px-8">
        <div className="mb-8 rounded-[28px] border border-white/10 bg-[linear-gradient(135deg,rgba(15,23,42,0.94),rgba(11,24,35,0.86))] p-6 shadow-[0_30px_80px_rgba(2,6,23,0.35)] md:p-8">
          <p className="mb-3 text-xs uppercase tracking-[0.34em] text-slate-400">Operations Overview</p>
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="font-display text-3xl font-semibold tracking-[-0.04em] md:text-4xl">Supplier Operations</h1>
              <p className="mt-2 max-w-2xl text-sm text-slate-400 md:text-base">
                Manage inventory, monitor orders, and respond to procurement requests from a single workspace.
              </p>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-950/40 px-4 py-3 text-sm text-slate-300">
              Active portfolio: <span className="font-semibold text-slate-100">{products.length}</span> products
            </div>
          </div>
        </div>

        <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
          {[
            { label: 'My Products', value: products.length },
            { label: 'Total Stock', value: products.reduce((sum, product) => sum + product.stock, 0) },
            { label: 'Orders to Fulfill', value: orders.filter((order) => order.status === 'pending').length },
            { label: 'Pending Requests', value: requests.filter((request) => request.status === 'pending').length },
          ].map((stat) => (
            <div key={stat.label} className="rounded-2xl border border-slate-800 bg-slate-950/40 p-4 shadow-[0_18px_36px_rgba(2,6,23,0.18)] md:p-6">
              <p className="mb-1 text-[11px] uppercase tracking-[0.28em] text-slate-500">{stat.label}</p>
              <p className="text-2xl font-semibold tracking-tight text-slate-100 md:text-3xl">{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="mb-6 flex gap-2 overflow-x-auto pb-1">
          {(['products', 'orders', 'requests'] as const).map((value) => (
            <button
              key={value}
              onClick={() => setTab(value)}
              className={`rounded-xl px-5 py-2.5 text-sm font-medium capitalize transition ${
                tab === value
                  ? 'border border-slate-700 bg-slate-100 text-slate-950'
                  : 'border border-slate-800 bg-slate-950/30 text-slate-400 hover:border-slate-700 hover:text-slate-200'
              }`}
            >
              {value === 'orders' ? `Orders (${orders.length})` : value === 'requests' ? `Requests (${requests.length})` : 'Products'}
            </button>
          ))}
        </div>

        {tab === 'products' && (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-[1.08fr_0.92fr]">
            <div className="rounded-[32px] border border-slate-800 bg-[linear-gradient(180deg,rgba(10,17,26,0.96),rgba(8,15,24,0.88))] p-6 shadow-[0_28px_80px_rgba(2,6,23,0.25)] md:p-7">
              <div className="mb-6 flex flex-col gap-3 border-b border-white/8 pb-5 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.3em] text-slate-500">Inventory Entry</p>
                  <h2 className="mt-2 text-2xl font-semibold tracking-tight">Add New Product</h2>
                  <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-400">
                    Use structured details so buyers see a cleaner catalog entry with better category, stock, and certification data.
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-800 bg-slate-950/50 px-4 py-3 text-sm text-slate-300">
                  Required: name, category, description, price, stock
                </div>
              </div>
              {message && (
                <div className="mb-4 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-sm text-emerald-300">
                  {message}
                </div>
              )}

              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Product Name"
                  className="w-full rounded-xl border border-slate-800 bg-[#09111a] px-4 py-3 text-slate-100 placeholder-slate-500 transition focus:border-slate-600 focus:outline-none"
                  value={formData.name}
                  onChange={(event) => setFormData({ ...formData, name: event.target.value })}
                />
                <select
                  className="w-full rounded-xl border border-slate-800 bg-[#09111a] px-4 py-3 text-slate-100 transition focus:border-slate-600 focus:outline-none"
                  value={formData.category}
                  onChange={(event) => setFormData({ ...formData, category: event.target.value })}
                >
                  <option value="" className="bg-[#09111a]">Select Category</option>
                  {categories.map((category) => (
                    <option key={category} value={category} className="bg-[#09111a]">
                      {category}
                    </option>
                  ))}
                </select>
                <textarea
                  placeholder="Description"
                  rows={3}
                  className="w-full rounded-xl border border-slate-800 bg-[#09111a] px-4 py-3 text-slate-100 placeholder-slate-500 transition focus:border-slate-600 focus:outline-none"
                  value={formData.description}
                  onChange={(event) => setFormData({ ...formData, description: event.target.value })}
                />
                <textarea
                  placeholder="Detailed instrument description"
                  rows={5}
                  className="w-full rounded-xl border border-slate-800 bg-[#09111a] px-4 py-3 text-slate-100 placeholder-slate-500 transition focus:border-slate-600 focus:outline-none"
                  value={formData.detailedDescription}
                  onChange={(event) => setFormData({ ...formData, detailedDescription: event.target.value })}
                />
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <input
                    type="number"
                    placeholder="Price (INR)"
                    className="w-full rounded-xl border border-slate-800 bg-[#09111a] px-4 py-3 text-slate-100 placeholder-slate-500 transition focus:border-slate-600 focus:outline-none"
                    value={formData.price}
                    onChange={(event) => setFormData({ ...formData, price: event.target.value })}
                  />
                  <input
                    type="number"
                    placeholder="Stock"
                    className="w-full rounded-xl border border-slate-800 bg-[#09111a] px-4 py-3 text-slate-100 placeholder-slate-500 transition focus:border-slate-600 focus:outline-none"
                    value={formData.stock}
                    onChange={(event) => setFormData({ ...formData, stock: event.target.value })}
                  />
                </div>
                <input
                  type="text"
                  placeholder="Certification (optional)"
                  className="w-full rounded-xl border border-slate-800 bg-[#09111a] px-4 py-3 text-slate-100 placeholder-slate-500 transition focus:border-slate-600 focus:outline-none"
                  value={formData.certification}
                  onChange={(event) => setFormData({ ...formData, certification: event.target.value })}
                />
                <textarea
                  placeholder="Image URLs separated by commas or new lines"
                  rows={4}
                  className="w-full rounded-xl border border-slate-800 bg-[#09111a] px-4 py-3 text-slate-100 placeholder-slate-500 transition focus:border-slate-600 focus:outline-none"
                  value={formData.imageUrlsText}
                  onChange={(event) => setFormData({ ...formData, imageUrlsText: event.target.value })}
                />
                <div className="rounded-2xl border border-slate-800 bg-slate-950/50 p-4">
                  <p className="text-[11px] uppercase tracking-[0.24em] text-slate-500">Submission</p>
                  <p className="mt-2 text-sm text-slate-400">
                    Review pricing and stock before publishing. Products appear immediately in the supplier catalog after submission.
                  </p>
                  <button
                    onClick={handleAddProduct}
                    className="mt-4 w-full rounded-xl bg-slate-100 py-3 font-semibold text-slate-950 transition hover:bg-white"
                  >
                    Publish Product
                  </button>
                </div>
              </div>
            </div>

            <div className="rounded-[32px] border border-slate-800 bg-slate-950/40 p-6 shadow-[0_24px_70px_rgba(2,6,23,0.2)]">
              <h2 className="mb-6 text-xl font-semibold">Product Portfolio ({products.length})</h2>
              <div className="max-h-[600px] space-y-3 overflow-y-auto">
                {products.length === 0 ? (
                  <p className="py-8 text-center text-slate-500">No products yet</p>
                ) : (
                  products.map((product) => (
                    <div key={product.id} className="flex flex-col gap-3 rounded-2xl border border-slate-800 bg-[#09111a] p-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="font-medium text-slate-100">{product.name}</p>
                        <p className="mt-0.5 text-xs text-slate-500">
                          {product.category} · ₹{product.price.toLocaleString()} · {product.stock <= 0 ? 'Out of stock' : `${product.stock} in stock`}
                        </p>
                      </div>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-1 text-sm text-red-300 transition hover:bg-red-500/20"
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

        {tab === 'orders' && (
          <div className="space-y-4">
            {orders.length === 0 ? (
              <div className="rounded-[28px] border border-slate-800 bg-slate-950/40 p-16 text-center">
                <p className="mb-4 text-sm uppercase tracking-[0.3em] text-slate-500">Orders</p>
                <p className="text-slate-400">No orders yet</p>
              </div>
            ) : (
              orders.map((order) => (
                <div key={order.id} className="rounded-[28px] border border-slate-800 bg-slate-950/40 p-6">
                  <div className="mb-4 flex flex-col items-start justify-between gap-4 md:flex-row">
                    <div>
                      <p className="text-lg font-semibold">
                        {order.items.length === 1
                          ? order.items[0].product.name
                          : `${order.items[0].product.name} + ${order.items.length - 1} more`}
                      </p>
                      <p className="mt-0.5 text-xs text-slate-500">Order #{order.id}</p>
                      <p className="mt-2 text-sm text-slate-400">
                        {order.user.name} · {order.user.hospital_name || order.user.email}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {new Date(order.created_at).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </p>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      <span className={`rounded-full border px-3 py-1 text-xs font-medium ${statusColor[order.status] || statusColor.pending}`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                      <p className="font-semibold text-slate-100">₹{order.total_price.toLocaleString()}</p>
                      {order.payment_type === 'split' && (
                        <span className="text-xs text-amber-200">Split Payment</span>
                      )}
                    </div>
                  </div>

                  <div className="mb-4 space-y-2 border-t border-white/10 pt-4">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span className="text-slate-400">{item.product.name} × {item.quantity}</span>
                        <span className="text-slate-100">₹{(item.price * item.quantity).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>

                  {order.deliveryDetails && (
                    <div className="mb-4 grid gap-4 border-t border-white/10 pt-4 text-sm md:grid-cols-2">
                      <div>
                        <p className="mb-2 text-xs uppercase tracking-[0.24em] text-slate-500">Delivery</p>
                        <p>{order.deliveryDetails.fullName}</p>
                        <p className="text-slate-400">{order.deliveryDetails.phone}</p>
                        <p className="text-slate-400">{order.deliveryDetails.email}</p>
                        <p className="text-slate-400">
                          {order.deliveryDetails.addressLine1}
                          {order.deliveryDetails.addressLine2 ? `, ${order.deliveryDetails.addressLine2}` : ''}
                        </p>
                        <p className="text-slate-400">
                          {order.deliveryDetails.city}, {order.deliveryDetails.state} {order.deliveryDetails.postalCode}
                        </p>
                        <p className="text-slate-400">{order.deliveryDetails.country}</p>
                      </div>

                      <div>
                        <p className="mb-2 text-xs uppercase tracking-[0.24em] text-slate-500">Billing</p>
                        <p>{order.deliveryDetails.billingName}</p>
                        {order.deliveryDetails.billingGstin && (
                          <p className="text-slate-400">GSTIN: {order.deliveryDetails.billingGstin}</p>
                        )}
                        <p className="whitespace-pre-line text-slate-400">{order.deliveryDetails.billingAddress}</p>
                      </div>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2">
                    {['pending', 'shipped', 'delivered'].map((status) => (
                      <button
                        key={status}
                        onClick={() => updateOrderStatus(order.id, status)}
                        className={`rounded-lg px-4 py-2 text-sm font-medium capitalize transition ${
                          order.status === status
                            ? 'border border-slate-700 bg-slate-100 text-slate-950'
                            : 'border border-slate-800 bg-[#09111a] text-slate-400 hover:border-slate-700 hover:text-slate-200'
                        }`}
                      >
                        {status === 'pending' ? 'Pending' : status === 'shipped' ? 'Mark Shipped' : 'Mark Delivered'}
                      </button>
                    ))}

                    <button
                      onClick={() => deleteOrder(order.id)}
                      className="w-full rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-2 text-sm font-medium text-red-300 transition hover:bg-red-500/20 sm:ml-auto sm:w-auto"
                    >
                      Delete Order
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {tab === 'requests' && (
          <div className="space-y-4">
            {requests.length === 0 ? (
              <div className="rounded-[28px] border border-slate-800 bg-slate-950/40 p-16 text-center">
                <p className="mb-4 text-sm uppercase tracking-[0.3em] text-slate-500">Requests</p>
                <p className="text-slate-400">No product requests yet</p>
              </div>
            ) : (
              requests.map((request) => (
                <div key={request.id} className="rounded-[28px] border border-slate-800 bg-slate-950/40 p-6">
                  <div className="flex flex-col items-start justify-between gap-3 md:flex-row">
                    <div className="flex-1">
                      <p className="text-lg font-semibold text-white">{request.name}</p>
                      <p className="mt-1 text-sm text-slate-400">{request.description}</p>
                      <p className="mt-3 text-xs text-slate-500">
                        {request.user.name} · {request.user.hospital_name || request.user.email} · Qty: {request.quantity}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {new Date(request.created_at).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                    <span className={`shrink-0 rounded-full border px-3 py-1 text-xs font-medium ${urgencyColor[request.urgency] || 'bg-slate-800 text-slate-300 border-slate-700'}`}>
                      {request.urgency.charAt(0).toUpperCase() + request.urgency.slice(1)} Priority
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
