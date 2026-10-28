import { useEffect, useState } from 'react'
import { API_BASE } from '../api'
import './Dashboard.css'

function Dashboard() {
  const [data, setData] = useState(null)
  const [error, setError] = useState('')

  function loadDashboard() {
    fetch(`${API_BASE}/dashboard`)
      .then((res) => res.json())
      .then(setData)
      .catch(() => setError('Could not load dashboard'))
  }

  useEffect(loadDashboard, [])

  async function restock(product) {
    const qtyStr = prompt(`Restock ${product.name} — quantity to add:`)
    if (!qtyStr) return
    const quantity = Number(qtyStr)
    if (!quantity || quantity <= 0) return
    const res = await fetch(`${API_BASE}/products/${product.id}/restock`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quantity }),
    })
    if (!res.ok) {
      setError('Could not restock product')
      return
    }
    setError('')
    loadDashboard()
  }

  if (!data) return <h1>Dashboard</h1>

  const stats = [
    { label: "Today's sales", value: data.today_sales_count },
    { label: 'Revenue', value: `$${data.today_revenue.toFixed(2)}` },
    { label: 'Total products', value: data.total_products },
    { label: 'Low stock', value: data.low_stock_count },
  ]

  return (
    <div className="dashboard-page">
      <h1>Dashboard</h1>
      {error && <p className="error-text">{error}</p>}

      <div className="stat-grid">
        {stats.map((s) => (
          <div className="stat-card" key={s.label}>
            <div className="stat-value">{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      <h2>Low stock alerts</h2>
      {data.low_stock_products.length === 0 && <p className="empty-state">All stocked up</p>}
      <ul className="alert-list">
        {data.low_stock_products.map((p) => (
          <li className={`alert-row ${p.stock_quantity === 0 ? 'out' : 'low'}`} key={p.id}>
            <div>
              <div className="alert-name">{p.name}</div>
              <div className="alert-sub">{p.category} · {p.stock_quantity} left</div>
            </div>
            <button className="restock-btn" onClick={() => restock(p)}>Restock</button>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default Dashboard
