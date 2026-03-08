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
}

export default function Admin() {
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [requests, setRequests] = useState<any[]>([])
  const [formData, setFormData] = useState({
    name: '', category: '', description: '',
    price: '', stock: '', certification: ''
  })
  const [message, setMessage] = useState('')

  const fetchProducts = () => {
    fetch('/api/products')
      .then(res => res.json())
      .then(data => setProducts(data))
  }

  const fetchRequests = () => {
    const token = Cookies.get('token')
    if (token) {
      fetch('/api/requests', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => setRequests(data))
    }
  }

  useEffect(() => {
    fetchProducts()
    fetchRequests()
  }, [])

  const handleAddProduct = async () => {
    const res = await fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    })
    if (res.ok) {
      setMessage('Product added successfully!')
      setFormData({ name: '', category: '', description: '', price: '', stock: '', certification: '' })
      fetchProducts()
      setTimeout(() => setMessage(''), 3000)
    }
  }

  const handleDelete = async (id: number) => {
    const res = await fetch(`/api/products/${id}`, { method: 'DELETE' })
    if (res.ok) setProducts(products.filter(p => p.id !== id))
  }

  const categories = ['Surgical Instruments', 'Diagnostic Equipment', 'Orthopedic Implants', 'ICU Equipment']

  return (
    <main className="min-h-screen bg-[#0a1628] text-white">
      <nav className="bg-[#0d1f3c] border-b border-white/10 px-8 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">M</span>
          </div>
          <span className="text-xl font-bold">MediShop</span>
          <span className="text-xs bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full border border-red-500/30">Admin</span>
        </div>
        <button
          onClick={() => router.push('/products')}
          className="text-white/60 hover:text-white text-sm transition"
        >
          View Store →
        </button>
      </nav>

      <div className="max-w-7xl mx-auto px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-1">Admin Dashboard</h1>
          <p className="text-white/40">Manage your product inventory</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Total Products', value: products.length },
            { label: 'Total Stock', value: products.reduce((s, p) => s + p.stock, 0) },
            { label: 'Categories', value: new Set(products.map(p => p.category)).size },
          ].map(stat => (
            <div key={stat.label} className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <p className="text-3xl font-bold text-blue-400 mb-1">{stat.value}</p>
              <p className="text-white/40 text-sm">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Add Product Form */}
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
              <button
                onClick={handleAddProduct}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-xl font-semibold transition"
              >
                Add Product →
              </button>
            </div>
          </div>

          {/* Products List */}
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

        {/* Product Requests */}
        <div className="mt-8 bg-white/5 border border-white/10 rounded-2xl p-6">
          <h2 className="text-xl font-bold mb-6">Product Requests ({requests.length})</h2>
          <div className="space-y-3">
            {requests.length === 0 ? (
              <p className="text-white/40 text-center py-8">No requests yet</p>
            ) : (
              requests.map((req: any) => (
                <div key={req.id} className="bg-white/5 border border-white/10 rounded-xl p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-white">{req.name}</p>
                      <p className="text-white/40 text-sm mt-1">{req.description}</p>
                      <p className="text-white/30 text-xs mt-2">
                        By {req.user.name} ({req.user.hospital_name || req.user.email}) · Qty: {req.quantity}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${
                      req.urgency === 'urgent' ? 'bg-red-500/20 text-red-400 border-red-500/20' :
                      req.urgency === 'high' ? 'bg-orange-500/20 text-orange-400 border-orange-500/20' :
                      req.urgency === 'normal' ? 'bg-blue-500/20 text-blue-400 border-blue-500/20' :
                      'bg-white/10 text-white/40 border-white/10'
                    }`}>
                      {req.urgency.charAt(0).toUpperCase() + req.urgency.slice(1)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </main>
  )
}