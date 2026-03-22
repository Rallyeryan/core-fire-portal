import { NavLink, Outlet } from 'react-router-dom'
import './Layout.css'

export default function Layout() {
  return (
    <div className="layout">
      <header className="top-nav">
        <div className="top-nav-inner">
          <div className="nav-brand">
            <div className="brand-icon">&#x1F525;</div>
            <div className="brand-text">
              <span className="brand-name">CORE FIRE</span>
              <span className="brand-sub">PROTECTION</span>
            </div>
          </div>
          <nav className="nav-links">
            <NavLink to="/" end className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <span className="nav-icon">&#x1F3E0;</span>
              Home
            </NavLink>
            <NavLink to="/agreement" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <span className="nav-icon">&#x1F4C4;</span>
              Agreement
            </NavLink>
            <NavLink to="/history" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <span className="nav-icon">&#x1F4CB;</span>
              History
            </NavLink>
          </nav>
          <div className="nav-badge">
            <span className="badge-dot"></span>
            BAFE SP203-1
          </div>
        </div>
        <div className="gradient-bar"></div>
      </header>
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  )
}
