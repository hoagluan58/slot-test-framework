import { Outlet, NavLink } from 'react-router-dom'
import { LayoutDashboard, Bug, Grid3X3, Activity } from 'lucide-react'

export default function App() {
  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <h1>🎰 Slot Test</h1>
          <p>Automation Dashboard</p>
        </div>
        <nav>
          <NavLink to="/" end className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <LayoutDashboard size={16} /> Overview
          </NavLink>
          <NavLink to="/bugs" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <Bug size={16} /> Bug Feed
          </NavLink>
          <NavLink to="/matrix" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <Grid3X3 size={16} /> Matrix
          </NavLink>
        </nav>
        <div style={{ marginTop: 'auto', padding: '16px 20px', borderTop: '1px solid var(--border)' }}>
          <a
            href="#"
            onClick={(e) => { e.preventDefault(); window.location.reload(); }}
            className="nav-item"
            style={{ margin: 0, padding: '8px 0' }}
          >
            <Activity size={14} /> Refresh Data
          </a>
        </div>
      </aside>
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  )
}
