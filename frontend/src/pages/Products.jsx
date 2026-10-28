import { useEffect, useState } from 'react'
import { API_BASE } from '../api'
import './Products.css'

const LOW_STOCK_THRESHOLD = 5
const EMPTY_FORM = { name: '', price: '', barcode: '', category: '', stock_quantity: '' }

function stockStatus(qty) {
  if (qty === 0) return 'out'
  if (qty <= LOW_STOCK_THRESHOLD) return 'low'
  return 'good'
}

function Products() {
  const [products, setProducts] = useState([])
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [menuOpenId, setMenuOpenId] = useState(null)
  const [form, setForm] = useState(null) // { mode: 'add' | 'edit', data, productId }
  const [restockTarget, setRestockTarget] = useState(null)
  const [restockQty, setRestockQty] = useState('')

  function loadProducts() {
    fetch(`${API_BASE}/products`)
      .then((res) => res.json())
      .then(setProducts)
      .catch(() => setError('Could not load products'))
  }

  useEffect(loadProducts, [])

  const categories = ['All', ...new Set(products.map((p) => p.category))]
  const filtered = products.filter(
    (p) =>
      (category === 'All' || p.category === category) &&
      (p.name.toLowerCase().includes(search.toLowerCase()) || p.barcode.includes(search))
  )

  function openAdd() {
    setForm({ mode: 'add', data: EMPTY_FORM })
  }

  function openEdit(p) {
    setMenuOpenId(null)
    setForm({
      mode: 'edit',
      productId: p.id,
      data: { name: p.name, price: p.price, barcode: p.barcode, category: p.category },
    })
  }

  async function submitForm(e) {
    e.preventDefault()
    const { mode, productId, data } = form
    const body =
      mode === 'add'
        ? { ...data, price: Number(data.price), stock_quantity: Number(data.stock_quantity) || 0 }
        : { ...data, price: Number(data.price) }
    const res = await fetch(`${API_BASE}/products${mode === 'edit' ? `/${productId}` : ''}`, {
      method: mode === 'add' ? 'POST' : 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    if (!res.ok) {
      setError('Could not save product')
      return
    }
    setForm(null)
    setError('')
    loadProducts()
  }

  async function handleDelete(p) {
    setMenuOpenId(null)
    if (!confirm(`Delete ${p.name}?`)) return
    const res = await fetch(`${API_BASE}/products/${p.id}`, { method: 'DELETE' })
    if (res.status === 409) {
      setError(`${p.name} has sale/stock history and can't be deleted`)
      return
    }
    if (!res.ok) {
      setError('Could not delete product')
      return
    }
    setError('')
    loadProducts()
  }

  function openRestock(p) {
    setMenuOpenId(null)
    setRestockTarget(p)
    setRestockQty('')
  }

  async function submitRestock(e) {
    e.preventDefault()
    const res = await fetch(`${API_BASE}/products/${restockTarget.id}/restock`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quantity: Number(restockQty) }),
    })
    if (!res.ok) {
      setError('Could not restock product')
      return
    }
    setRestockTarget(null)
    setError('')
    loadProducts()
  }

  return (
    <div className="products-page">
      <div className="products-header">
        <h1>Products</h1>
        <button className="btn-accent" onClick={openAdd}>+ Add product</button>
      </div>

      {error && <p className="error-text">{error}</p>}

      <input
        className="search-bar"
        placeholder="Search by name or barcode"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="category-pills">
        {categories.map((c) => (
          <button
            key={c}
            className={'pill' + (c === category ? ' active' : '')}
            onClick={() => setCategory(c)}
          >
            {c}
          </button>
        ))}
      </div>

      <ul className="product-list">
        {filtered.map((p) => (
          <li className="product-row" key={p.id}>
            <div className="product-info">
              <div className="product-name">{p.name}</div>
              <div className="product-sub">${Number(p.price).toFixed(2)} · {p.barcode} · {p.category}</div>
            </div>
            <span className={`stock-badge ${stockStatus(p.stock_quantity)}`}>{p.stock_quantity}</span>
            <div className="row-menu">
              <button className="menu-btn" onClick={() => setMenuOpenId(menuOpenId === p.id ? null : p.id)}>⋮</button>
              {menuOpenId === p.id && (
                <div className="menu-dropdown">
                  <button onClick={() => openEdit(p)}>Edit</button>
                  <button onClick={() => openRestock(p)}>Restock</button>
                  <button onClick={() => handleDelete(p)}>Delete</button>
                </div>
              )}
            </div>
          </li>
        ))}
        {filtered.length === 0 && <li className="empty-state">No products found</li>}
      </ul>

      {form && (
        <div className="modal-overlay" onClick={() => setForm(null)}>
          <form className="modal" onClick={(e) => e.stopPropagation()} onSubmit={submitForm}>
            <h2>{form.mode === 'add' ? 'Add product' : 'Edit product'}</h2>
            <input
              placeholder="Name"
              required
              value={form.data.name}
              onChange={(e) => setForm({ ...form, data: { ...form.data, name: e.target.value } })}
            />
            <input
              placeholder="Price"
              type="number"
              step="0.01"
              required
              value={form.data.price}
              onChange={(e) => setForm({ ...form, data: { ...form.data, price: e.target.value } })}
            />
            <input
              placeholder="Barcode"
              required
              value={form.data.barcode}
              onChange={(e) => setForm({ ...form, data: { ...form.data, barcode: e.target.value } })}
            />
            <input
              placeholder="Category"
              required
              value={form.data.category}
              onChange={(e) => setForm({ ...form, data: { ...form.data, category: e.target.value } })}
            />
            {form.mode === 'add' && (
              <input
                placeholder="Starting stock"
                type="number"
                value={form.data.stock_quantity}
                onChange={(e) => setForm({ ...form, data: { ...form.data, stock_quantity: e.target.value } })}
              />
            )}
            <div className="modal-actions">
              <button type="button" onClick={() => setForm(null)}>Cancel</button>
              <button type="submit" className="btn-accent">Save</button>
            </div>
          </form>
        </div>
      )}

      {restockTarget && (
        <div className="modal-overlay" onClick={() => setRestockTarget(null)}>
          <form className="modal" onClick={(e) => e.stopPropagation()} onSubmit={submitRestock}>
            <h2>Restock {restockTarget.name}</h2>
            <input
              placeholder="Quantity to add"
              type="number"
              min="1"
              required
              value={restockQty}
              onChange={(e) => setRestockQty(e.target.value)}
            />
            <div className="modal-actions">
              <button type="button" onClick={() => setRestockTarget(null)}>Cancel</button>
              <button type="submit" className="btn-accent">Confirm</button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}

export default Products
