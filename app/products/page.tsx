'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface Product {
  id: number
  name: string
  category: string
  description: string
  price: number
  stock: number
  certification: string
}

export default function Products() {
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [cartCount, setCartCount] = useState(0)

  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(data => {
        setProducts(data)
        setLoading(false)
      })
    const cart = JSON.parse(localStorage.getItem('cart') || '[]')
    setCartCount(cart.reduce((sum: number, item: any) => sum + item.quantity, 0))
  }, [])

  const filtered = products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase())
    const matchCategory = category ? p.category === category : true
    return matchSearch && matchCategory
  })

  const addToCart = (product: Product) => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]')
    const existing = cart.find((i: any) => i.id === product.id)
    if (existing) {
      existing.quantity += 1
    } else {
      cart.push({ ...product, quantity: 1 })
    }
    localStorage.setItem('cart', JSON.stringify(cart))
    setCartCount(cart.reduce((sum: number, item: any) => sum + item.quantity, 0))
  }

  const categories = ['Surgical Instruments', 'Diagnostic Equipment', 'Orthopedic Implants', 'ICU Equipment']

  return (
    <main className="min-h-screen bg-[#0a1628] text-white">
      {/* Navbar */}
      <nav className="bg-[#0d1f3c] border-b border-white/10 px-8 py-4 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">M</span>
          </div>
          <span className="text-xl font-bold">MediShop</span>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/orders')}
            className="text-white/60 hover:text-white text-sm transition"
          >
            My Orders
          </button>
          <button
            onClick={() => router.push('/cart')}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-lg text-sm font-medium transition"
          >
            🛒 Cart
            {cartCount > 0 && (
              <span className="bg-white text-blue-600 text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
  <div>
    <h1 className="text-3xl font-bold mb-1">Product Catalog</h1>
    <p className="text-white/40">Browse certified medical equipment</p>
  </div>
  <button
    onClick={() => router.push('/request')}
    className="bg-white/5 border border-white/10 hover:border-blue-500/50 text-white px-5 py-3 rounded-xl text-sm font-medium transition"
  >
    + Request a Product
  </button>
</div>

        {/* Search and Filter */}
        <div className="flex gap-4 mb-6">
          <input
            type="text"
            placeholder="Search products..."
            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-blue-500 transition"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="" className="bg-[#0a1628]">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat} className="bg-[#0a1628]">{cat}</option>
            ))}
          </select>
        </div>

        {/* Category Pills */}
        <div className="flex gap-2 mb-8 flex-wrap">
          <button
            onClick={() => setCategory('')}
            className={`px-4 py-2 rounded-full text-sm transition ${category === '' ? 'bg-blue-600 text-white' : 'bg-white/5 text-white/50 hover:bg-white/10'}`}
          >
            All
          </button>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm transition ${category === cat ? 'bg-blue-600 text-white' : 'bg-white/5 text-white/50 hover:bg-white/10'}`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="text-center text-white/40 py-20">Loading products...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center text-white/40 py-20">No products found</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {filtered.map(product => (
              <div
                key={product.id}
                className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-blue-500/50 hover:bg-white/8 transition cursor-pointer group"
              >
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-6 mb-4 text-center">
                  <span className="text-4xl">🏥</span>
                </div>
                <span className="text-xs bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full border border-blue-500/20">
                  {product.category}
                </span>
                <h3 className="font-semibold text-white mt-3 mb-1 group-hover:text-blue-400 transition">
                  {product.name}
                </h3>
                <p className="text-white/40 text-sm mb-4 line-clamp-2">{product.description}</p>
                {product.certification && (
                  <p className="text-xs text-green-400/70 mb-3">✓ {product.certification}</p>
                )}
                <div className="flex justify-between items-center mb-4">
                  <span className="text-blue-400 font-bold text-xl">₹{product.price}</span>
                  <span className="text-white/30 text-sm">{product.stock} in stock</span>
                </div>
                <button
                  onClick={() => addToCart(product)}
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white py-2.5 rounded-xl text-sm font-medium transition"
                >
                  Add to Cart
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}