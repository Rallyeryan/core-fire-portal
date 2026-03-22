import { useNavigate } from 'react-router-dom'
import './HomePage.css'

export default function HomePage() {
  const navigate = useNavigate()
  const refNo = `CFP-${Math.floor(100000 + Math.random() * 900000)}`

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-inner container">
          <div className="hero-content animate-fade-in-up">
            <div className="hero-badge">
              <span className="hero-badge-dot"></span>
              INTERACTIVE SERVICE AGREEMENT
            </div>
            <h1 className="hero-title">
              <span className="hero-title-light">CORE FIRE</span>
              <span className="hero-title-bold gradient-text">PROTECTION</span>
            </h1>
            <p className="hero-desc">
              Fire &amp; Security Service Agreement Builder. Select services from our comprehensive catalog, 
              configure pricing with automatic discount calculations, and execute agreements digitally — 
              all in one streamlined workflow.
            </p>
            <div className="hero-certs">
              <span className="cert-badge"><span className="cert-dot green"></span>BAFE SP203-1</span>
              <span className="cert-badge"><span className="cert-dot gold"></span>NSI GOLD</span>
              <span className="cert-badge"><span className="cert-dot green"></span>BS 5839-1:2025</span>
              <span className="cert-badge"><span className="cert-dot green"></span>BS EN ISO 9001</span>
            </div>
            <div className="hero-actions">
              <button className="btn-primary" onClick={() => navigate('/agreement')}>
                Start New Agreement
                <span className="btn-arrow">&rarr;</span>
              </button>
              <button className="btn-secondary" onClick={() => navigate('/history')}>
                View History
              </button>
            </div>
            <div className="hero-ref mono">REF: {refNo}</div>
          </div>
          <div className="hero-stats animate-fade-in-up delay-3">
            <div className="stat-card glass-card">
              <div className="stat-number gradient-text">60+</div>
              <div className="stat-label">Fire Protection Services</div>
            </div>
            <div className="stat-card glass-card">
              <div className="stat-number gradient-text">13</div>
              <div className="stat-label">Service Categories</div>
            </div>
            <div className="stat-card glass-card">
              <div className="stat-number gradient-text">24/7</div>
              <div className="stat-label">Emergency Response</div>
            </div>
            <div className="stat-card glass-card">
              <div className="stat-number gradient-text">4hr</div>
              <div className="stat-label">Max Response Time</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <div className="container">
          <div className="features-grid">
            <div className="feature-card glass-card animate-fade-in-up delay-4">
              <div className="feature-icon-wrap" style={{ background: 'rgba(232,52,10,0.1)' }}>
                <span className="feature-icon">&#x1F6E1;&#xFE0F;</span>
              </div>
              <h3 className="feature-title">SERVICE STANDARDS</h3>
              <h2 className="feature-heading">BAFE &amp; NSI Gold Approved</h2>
              <p className="feature-desc">
                All services delivered by BAFE-registered, NSI Gold-approved engineers to applicable British Standards. 
                Every engineer carries appropriate certification and authorisation.
              </p>
            </div>
            <div className="feature-card glass-card animate-fade-in-up delay-5">
              <div className="feature-icon-wrap" style={{ background: 'rgba(20,184,166,0.1)' }}>
                <span className="feature-icon">&#x23F1;&#xFE0F;</span>
              </div>
              <h3 className="feature-title">EMERGENCY RESPONSE</h3>
              <h2 className="feature-heading">4 Hour Max Response</h2>
              <p className="feature-desc">
                24/7, 365-day emergency call-out service with guaranteed maximum 4-hour response for critical faults. 
                Priority faults attended next business day.
              </p>
            </div>
            <div className="feature-card glass-card animate-fade-in-up delay-6">
              <div className="feature-icon-wrap" style={{ background: 'rgba(184,168,130,0.1)' }}>
                <span className="feature-icon">&#x1F4B0;</span>
              </div>
              <h3 className="feature-title">MULTI-SERVICE DISCOUNT</h3>
              <h2 className="feature-heading">10% Bundle Savings</h2>
              <p className="feature-desc">
                Select 5+ services across 3+ categories to automatically qualify for a 10% multi-service discount. 
                5-year cost projection with configurable escalation rates.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="process">
        <div className="container">
          <div className="process-header animate-fade-in-up delay-4">
            <h3 className="section-label">HOW IT WORKS</h3>
            <h2 className="section-title">Six-Step Agreement Process</h2>
          </div>
          <div className="process-steps">
            {[
              { num: '01', title: 'Client Details', desc: 'Enter company information, site address, and contract terms.' },
              { num: '02', title: 'Service Catalog', desc: 'Browse 13 categories and select from 60+ fire protection services.' },
              { num: '03', title: 'Pricing Summary', desc: 'Review pricing with automatic discounts and 5-year projection.' },
              { num: '04', title: 'Terms & Conditions', desc: 'Review and accept the 10 contractual clauses.' },
              { num: '05', title: 'Digital Signatures', desc: 'Both parties sign digitally with printed name confirmation.' },
              { num: '06', title: 'Confirmation', desc: 'Agreement saved with onboarding timeline and next steps.' },
            ].map((s, i) => (
              <div key={s.num} className={`process-step glass-card animate-fade-in-up delay-${i + 4}`}>
                <div className="step-num gradient-text mono">{s.num}</div>
                <h4 className="step-title">{s.title}</h4>
                <p className="step-desc">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
