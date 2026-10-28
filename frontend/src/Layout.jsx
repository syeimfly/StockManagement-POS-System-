import { NavLink, Outlet } from 'react-router-dom'

const ICONS = {
  home: <path d="M3 11.5 12 4l9 7.5M5.5 10v9h13v-9" />,
  products: <path d="M12 3 4 7.5v9L12 21l8-4.5v-9L12 3Zm0 9 8-4.5M12 12v9M12 12 4 7.5" />,
  pos: <path d="M3 6h18l-1.5 9h-15L3 6Zm0 0-.5-2H1M8 19.5a1 1 0 1 0 0-2 1 1 0 0 0 0 2Zm9 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" />,
  history: <path d="M12 7v5l3.5 2M21 12a9 9 0 1 1-9-9M21 5v4h-4" />,
}

const TABS = [
  { to: '/', label: 'Home', end: true, icon: 'home' },
  { to: '/products', label: 'Products', icon: 'products' },
  { to: '/pos', label: 'POS', icon: 'pos' },
  { to: '/history', label: 'History', icon: 'history' },
]

function Layout() {
  return (
    <div className="app-shell">
      <header className="app-header">
        <svg className="app-logo" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2 2 7l10 5 10-5-10-5Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
          <path d="M2 7v10l10 5 10-5V7" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
          <path d="M12 12v10" stroke="currentColor" strokeWidth="1.6" />
        </svg>
        <span className="app-title">StockPOS</span>
      </header>
      <main className="app-content">
        <Outlet />
      </main>
      <nav className="bottom-nav">
        {TABS.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            end={tab.end}
            className={({ isActive }) => 'nav-tab' + (isActive ? ' active' : '')}
          >
            <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              {ICONS[tab.icon]}
            </svg>
            <span>{tab.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  )
}

export default Layout
