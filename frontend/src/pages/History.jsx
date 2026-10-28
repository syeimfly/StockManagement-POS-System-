import { useEffect, useState } from 'react'
import { API_BASE } from '../api'
import './History.css'

const TABS = [
  { label: 'All', reason: null },
  { label: 'Sales', reason: 'sale' },
  { label: 'Restocks', reason: 'restock' },
]

function dateLabel(isoString) {
  const date = new Date(isoString)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(today.getDate() - 1)
  if (date.toDateString() === today.toDateString()) return 'Today'
  if (date.toDateString() === yesterday.toDateString()) return 'Yesterday'
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}

function groupByDate(entries) {
  const groups = []
  for (const entry of entries) {
    const label = dateLabel(entry.created_at)
    const last = groups[groups.length - 1]
    if (last && last.label === label) {
      last.entries.push(entry)
    } else {
      groups.push({ label, entries: [entry] })
    }
  }
  return groups
}

function History() {
  const [entries, setEntries] = useState([])
  const [error, setError] = useState('')
  const [tab, setTab] = useState('All')

  useEffect(() => {
    fetch(`${API_BASE}/history`)
      .then((res) => res.json())
      .then(setEntries)
      .catch(() => setError('Could not load history'))
  }, [])

  const activeReason = TABS.find((t) => t.label === tab).reason
  const filtered = activeReason ? entries.filter((e) => e.reason === activeReason) : entries
  const groups = groupByDate(filtered)

  return (
    <div className="history-page">
      <h1>History</h1>
      {error && <p className="error-text">{error}</p>}

      <div className="filter-tabs">
        {TABS.map((t) => (
          <button
            key={t.label}
            className={'filter-tab' + (t.label === tab ? ' active' : '')}
            onClick={() => setTab(t.label)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {groups.length === 0 && <p className="empty-state">No history yet</p>}
      {groups.map((group) => (
        <div className="history-group" key={group.label}>
          <div className="group-label">{group.label}</div>
          <ul className="entry-list">
            {group.entries.map((entry) => (
              <li className="entry-row" key={entry.id}>
                <span className={`entry-icon ${entry.reason}`}>{entry.reason === 'sale' ? '↓' : '↑'}</span>
                <div className="entry-info">
                  <div className="entry-name">{entry.product_name}</div>
                  <div className="entry-sub">
                    {entry.quantity_before} → {entry.quantity_after} ·{' '}
                    {new Date(entry.created_at).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}
                  </div>
                </div>
                <span className="entry-qty">{entry.reason === 'sale' ? '-' : '+'}{entry.quantity}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  )
}

export default History
