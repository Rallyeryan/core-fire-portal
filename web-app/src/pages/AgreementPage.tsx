import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAgreement, type ClientInfo } from '../context/AgreementContext'
import { CATALOG, calcPricing, type FrequencyKey, type ServiceCategory, type Service } from '../data/serviceCatalog'
import { TERMS_CLAUSES } from '../data/termsData'
import './AgreementPage.css'

const STEPS = [
  { num: 1, label: 'Client Details' },
  { num: 2, label: 'Service Catalog' },
  { num: 3, label: 'Pricing Summary' },
  { num: 4, label: 'Terms & Conditions' },
  { num: 5, label: 'Signatures' },
  { num: 6, label: 'Confirmation' },
]

export default function AgreementPage() {
  const { state, dispatch } = useAgreement()
  const navigate = useNavigate()

  const goNext = () => dispatch({ type: 'SET_STEP', step: Math.min(state.step + 1, 5) })
  const goPrev = () => dispatch({ type: 'SET_STEP', step: Math.max(state.step - 1, 0) })

  return (
    <div className="agreement-page">
      <div className="container">
        {/* Progress Bar */}
        <div className="progress-bar">
          {STEPS.map((s, i) => (
            <button
              key={s.num}
              className={`progress-step ${state.step === i ? 'active' : ''} ${state.step > i ? 'done' : ''}`}
              onClick={() => dispatch({ type: 'SET_STEP', step: i })}
            >
              <span className="progress-num">{state.step > i ? '\u2713' : s.num}</span>
              <span className="progress-label">{s.label}</span>
            </button>
          ))}
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${(state.step / 5) * 100}%` }}></div>
          </div>
        </div>

        {/* Step Content */}
        <div className="step-content">
          {state.step === 0 && <StepClientDetails />}
          {state.step === 1 && <StepServiceCatalog />}
          {state.step === 2 && <StepPricing />}
          {state.step === 3 && <StepTerms />}
          {state.step === 4 && <StepSignatures />}
          {state.step === 5 && <StepSuccess />}
        </div>

        {/* Navigation */}
        {state.step < 5 && (
          <div className="step-nav">
            {state.step > 0 && (
              <button className="btn-secondary" onClick={goPrev}>&larr; Previous</button>
            )}
            <div style={{ flex: 1 }}></div>
            <button className="btn-primary" onClick={goNext}>
              {state.step === 4 ? 'Submit Agreement' : 'Continue'} &rarr;
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════
   STEP 1: Client Details
   ═══════════════════════════════════════════════════════════ */
function StepClientDetails() {
  const { state, dispatch } = useAgreement()
  const ci = state.clientInfo

  const update = (field: keyof ClientInfo, value: string | boolean) =>
    dispatch({ type: 'UPDATE_CLIENT', field, value })

  return (
    <div className="step-client animate-fade-in">
      <div className="step-header">
        <h2 className="step-title">Client Details</h2>
        <p className="step-subtitle">Enter the client company information and contract parameters.</p>
      </div>

      <div className="form-section">
        <h3 className="form-section-title">Company Information</h3>
        <div className="form-grid-3">
          <div className="form-field">
            <label className="form-label">Company Name *</label>
            <input className="form-input" value={ci.companyName} onChange={e => update('companyName', e.target.value)} placeholder="Enter company name" />
          </div>
          <div className="form-field">
            <label className="form-label">Registration No.</label>
            <input className="form-input" value={ci.registrationNo} onChange={e => update('registrationNo', e.target.value)} placeholder="SC123456" />
          </div>
          <div className="form-field">
            <label className="form-label">Contact Name *</label>
            <input className="form-input" value={ci.contactName} onChange={e => update('contactName', e.target.value)} placeholder="Full name" />
          </div>
        </div>
        <div className="form-grid-3">
          <div className="form-field">
            <label className="form-label">Position / Title</label>
            <input className="form-input" value={ci.position} onChange={e => update('position', e.target.value)} placeholder="e.g. Facilities Manager" />
          </div>
          <div className="form-field">
            <label className="form-label">Telephone *</label>
            <input className="form-input" value={ci.telephone} onChange={e => update('telephone', e.target.value)} placeholder="+44 ..." />
          </div>
          <div className="form-field">
            <label className="form-label">Email *</label>
            <input className="form-input" type="email" value={ci.email} onChange={e => update('email', e.target.value)} placeholder="email@company.com" />
          </div>
        </div>
      </div>

      <div className="form-section">
        <h3 className="form-section-title">Site Address</h3>
        <div className="form-grid-3">
          <div className="form-field" style={{ gridColumn: 'span 2' }}>
            <label className="form-label">Street Address *</label>
            <input className="form-input" value={ci.siteAddress} onChange={e => update('siteAddress', e.target.value)} placeholder="Building name, street" />
          </div>
          <div className="form-field">
            <label className="form-label">City</label>
            <input className="form-input" value={ci.city} onChange={e => update('city', e.target.value)} placeholder="City" />
          </div>
        </div>
        <div className="form-grid-3">
          <div className="form-field">
            <label className="form-label">Postcode</label>
            <input className="form-input" value={ci.postcode} onChange={e => update('postcode', e.target.value)} placeholder="AB1 2CD" />
          </div>
        </div>
      </div>

      <div className="form-section">
        <h3 className="form-section-title">Contract Parameters</h3>
        <div className="form-grid-3">
          <div className="form-field">
            <label className="form-label">Start Date *</label>
            <input className="form-input" type="date" value={ci.startDate} onChange={e => update('startDate', e.target.value)} />
          </div>
          <div className="form-field">
            <label className="form-label">End Date</label>
            <input className="form-input" type="date" value={ci.endDate} onChange={e => update('endDate', e.target.value)} disabled={ci.isRolling} />
          </div>
          <div className="form-field">
            <label className="form-label">Rolling Contract</label>
            <div className="toggle-row">
              <button
                className={`toggle-btn ${ci.isRolling ? 'active' : ''}`}
                onClick={() => update('isRolling', !ci.isRolling)}
              >
                <span className="toggle-knob"></span>
              </button>
              <span className="toggle-label">{ci.isRolling ? 'Yes — Auto-renews annually' : 'No — Fixed term'}</span>
            </div>
          </div>
        </div>
        <div className="form-grid-3">
          <div className="form-field">
            <label className="form-label">Payment Terms</label>
            <select className="form-input" value={ci.paymentTerms} onChange={e => update('paymentTerms', e.target.value)}>
              <option>Net 14 Days</option>
              <option>Net 30 Days</option>
              <option>Net 45 Days</option>
              <option>Net 60 Days</option>
            </select>
          </div>
          <div className="form-field">
            <label className="form-label">Annual Escalation Rate (%)</label>
            <input className="form-input" type="number" step="0.5" min="0" max="15" value={ci.escalationRate} onChange={e => update('escalationRate', e.target.value)} />
          </div>
        </div>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════
   STEP 2: Service Catalog
   ═══════════════════════════════════════════════════════════ */
function StepServiceCatalog() {
  const { state, dispatch } = useAgreement()
  const [expandedCat, setExpandedCat] = useState<string | null>(null)
  const selCount = Object.keys(state.selections).length

  const toggleService = (svc: Service, cat: ServiceCategory) => {
    dispatch({
      type: 'TOGGLE_SERVICE',
      serviceId: svc.id,
      categoryId: cat.id,
      freq: 'annual' as FrequencyKey,
      unitPrice: svc.annual || 0,
    })
  }

  return (
    <div className="step-catalog animate-fade-in">
      <div className="step-header">
        <div className="step-header-row">
          <div>
            <h2 className="step-title">Service Catalog</h2>
            <p className="step-subtitle">Select services from 13 categories. Choose 5+ services across 3+ categories for 10% discount.</p>
          </div>
          <div className="sel-count-badge">
            <span className="sel-count-num">{selCount}</span>
            <span className="sel-count-label">Selected</span>
          </div>
        </div>
      </div>

      <div className="catalog-grid">
        {CATALOG.map(cat => {
          const isExpanded = expandedCat === cat.id
          const catSelCount = cat.services.filter(s => state.selections[s.id]).length
          return (
            <div key={cat.id} className={`catalog-category glass-card ${isExpanded ? 'expanded' : ''}`}>
              <button className="cat-header" onClick={() => setExpandedCat(isExpanded ? null : cat.id)}>
                <div className="cat-icon-wrap" style={{ background: `${cat.color}20` }}>
                  <span className="cat-icon">{cat.icon}</span>
                </div>
                <div className="cat-info">
                  <div className="cat-name">{cat.name}</div>
                  <div className="cat-std mono">{cat.std}</div>
                </div>
                <div className="cat-meta">
                  {catSelCount > 0 && <span className="cat-sel-badge">{catSelCount}</span>}
                  <span className="cat-count">{cat.services.length} services</span>
                  <span className={`cat-chevron ${isExpanded ? 'open' : ''}`}>&#x25BC;</span>
                </div>
              </button>
              {isExpanded && (
                <div className="cat-services">
                  <div className="svc-table-header">
                    <span className="svc-th" style={{ flex: 3 }}>Service</span>
                    <span className="svc-th" style={{ flex: 1, textAlign: 'center' }}>Qty</span>
                    <span className="svc-th" style={{ flex: 1, textAlign: 'right' }}>Unit Price (&pound;)</span>
                    <span className="svc-th" style={{ flex: 1, textAlign: 'center' }}>Select</span>
                  </div>
                  {cat.services.map(svc => {
                    const sel = state.selections[svc.id]
                    return (
                      <div key={svc.id} className={`svc-row ${sel ? 'selected' : ''}`}>
                        <div className="svc-name" style={{ flex: 3 }}>
                          <span className="svc-id mono">{svc.id}</span>
                          {svc.name}
                        </div>
                        <div style={{ flex: 1, textAlign: 'center' }}>
                          {sel && (
                            <input
                              className="svc-qty-input"
                              type="number"
                              min={1}
                              value={sel.qty}
                              onChange={e => dispatch({ type: 'UPDATE_SERVICE_QTY', serviceId: svc.id, qty: parseInt(e.target.value) || 1 })}
                              onClick={e => e.stopPropagation()}
                            />
                          )}
                        </div>
                        <div style={{ flex: 1, textAlign: 'right' }}>
                          {sel ? (
                            <input
                              className="svc-price-input"
                              type="number"
                              min={0}
                              step={0.01}
                              value={sel.unitPrice || ''}
                              onChange={e => dispatch({ type: 'UPDATE_SERVICE_PRICE', serviceId: svc.id, price: parseFloat(e.target.value) || 0 })}
                              onClick={e => e.stopPropagation()}
                              placeholder="0.00"
                            />
                          ) : (
                            <span className="svc-price-placeholder">&mdash;</span>
                          )}
                        </div>
                        <div style={{ flex: 1, textAlign: 'center' }}>
                          <button
                            className={`svc-toggle ${sel ? 'active' : ''}`}
                            onClick={() => toggleService(svc, cat)}
                          >
                            {sel ? '\u2713' : '+'}
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════
   STEP 3: Pricing Summary
   ═══════════════════════════════════════════════════════════ */
function StepPricing() {
  const { state } = useAgreement()
  const esc = parseFloat(state.clientInfo.escalationRate) || 3.5
  const pricing = calcPricing(state.selections, esc)
  const selList = Object.values(state.selections)

  return (
    <div className="step-pricing animate-fade-in">
      <div className="step-header">
        <h2 className="step-title">Pricing Summary</h2>
        <p className="step-subtitle">Review your pricing breakdown, discounts, and 5-year cost projection.</p>
      </div>

      <div className="pricing-layout">
        {/* Left: Breakdown */}
        <div className="pricing-breakdown glass-card">
          <h3 className="pricing-section-title">Cost Breakdown</h3>

          {selList.length === 0 ? (
            <p className="pricing-empty">No services selected. Go back to the Service Catalog to select services.</p>
          ) : (
            <>
              <div className="pricing-lines">
                {selList.map(sel => {
                  const cat = CATALOG.find(c => c.id === sel.categoryId)
                  const svc = cat?.services.find(s => s.id === sel.serviceId)
                  return (
                    <div key={sel.serviceId} className="pricing-line">
                      <div className="pl-name">
                        <span className="pl-id mono">{sel.serviceId}</span>
                        {svc?.name || sel.serviceId}
                        {sel.qty > 1 && <span className="pl-qty">&times;{sel.qty}</span>}
                      </div>
                      <div className="pl-amount mono gold-text">&pound;{(sel.unitPrice * sel.qty).toFixed(2)}</div>
                    </div>
                  )
                })}
              </div>

              <div className="pricing-totals">
                <div className="pt-row">
                  <span>Subtotal ({selList.length} services)</span>
                  <span className="mono">&pound;{pricing.base.toFixed(2)}</span>
                </div>
                {pricing.discRate > 0 && (
                  <div className="pt-row discount">
                    <span>Multi-Service Discount ({(pricing.discRate * 100).toFixed(0)}%)</span>
                    <span className="mono" style={{ color: '#22C55E' }}>-&pound;{pricing.discAmt.toFixed(2)}</span>
                  </div>
                )}
                <div className="pt-row">
                  <span>Net Total</span>
                  <span className="mono">&pound;{pricing.net.toFixed(2)}</span>
                </div>
                <div className="pt-row">
                  <span>VAT (20%)</span>
                  <span className="mono">&pound;{pricing.vat.toFixed(2)}</span>
                </div>
                <div className="pt-row total">
                  <span>Year 1 Total (Inc. VAT)</span>
                  <span className="mono gold-text">&pound;{pricing.year1.toFixed(2)}</span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Right: 5-Year Projection */}
        <div className="pricing-projection glass-card">
          <h3 className="pricing-section-title">5-Year Cost Projection</h3>
          <p className="projection-esc">Annual escalation: <strong>{esc}%</strong></p>

          {pricing.projection.length > 0 ? (
            <>
              <div className="proj-table">
                <div className="proj-header">
                  <span style={{ flex: 1 }}>Year</span>
                  <span style={{ flex: 2, textAlign: 'right' }}>Ex. VAT</span>
                  <span style={{ flex: 2, textAlign: 'right' }}>VAT</span>
                  <span style={{ flex: 2, textAlign: 'right' }}>Inc. VAT</span>
                </div>
                {pricing.projection.map(p => (
                  <div key={p.year} className={`proj-row ${p.year === 1 ? 'highlight' : ''}`}>
                    <span style={{ flex: 1 }} className="mono">Y{p.year}</span>
                    <span style={{ flex: 2, textAlign: 'right' }} className="mono">&pound;{p.exVat.toFixed(2)}</span>
                    <span style={{ flex: 2, textAlign: 'right' }} className="mono">&pound;{p.vat.toFixed(2)}</span>
                    <span style={{ flex: 2, textAlign: 'right' }} className="mono gold-text">&pound;{p.incVat.toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="proj-total">
                <span>5-Year Total</span>
                <span className="mono gold-text" style={{ fontSize: 18 }}>&pound;{pricing.projTotal.toFixed(2)}</span>
              </div>
            </>
          ) : (
            <p className="pricing-empty">Select services to see projection.</p>
          )}
        </div>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════
   STEP 4: Terms & Conditions
   ═══════════════════════════════════════════════════════════ */
function StepTerms() {
  const { state, dispatch } = useAgreement()
  const [expandedClause, setExpandedClause] = useState<string | null>(null)

  return (
    <div className="step-terms animate-fade-in">
      <div className="step-header">
        <h2 className="step-title">Terms &amp; Conditions</h2>
        <p className="step-subtitle">Review and accept the contractual terms. Click each clause to expand.</p>
      </div>

      <div className="terms-grid">
        {TERMS_CLAUSES.map(clause => {
          const isOpen = expandedClause === clause.num
          return (
            <div key={clause.num} className={`terms-clause glass-card ${isOpen ? 'open' : ''}`}>
              <button className="clause-header" onClick={() => setExpandedClause(isOpen ? null : clause.num)}>
                <span className="clause-num gradient-text mono">{clause.num.padStart(2, '0')}</span>
                <span className="clause-title">{clause.title}</span>
                <span className={`clause-chevron ${isOpen ? 'open' : ''}`}>&#x25BC;</span>
              </button>
              {isOpen && (
                <div className="clause-body">
                  <p>{clause.body}</p>
                </div>
              )}
            </div>
          )
        })}
      </div>

      <div className="terms-accept glass-card">
        <label className="accept-label">
          <input
            type="checkbox"
            checked={state.termsAccepted}
            onChange={e => dispatch({ type: 'SET_TERMS_ACCEPTED', accepted: e.target.checked })}
            className="accept-checkbox"
          />
          <span>
            I have read, understood, and agree to all terms and conditions outlined above. 
            I confirm I am authorised to enter into this agreement on behalf of the client company.
          </span>
        </label>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════
   STEP 5: Signatures
   ═══════════════════════════════════════════════════════════ */
function StepSignatures() {
  const { state, dispatch } = useAgreement()

  return (
    <div className="step-signatures animate-fade-in">
      <div className="step-header">
        <h2 className="step-title">Digital Signatures</h2>
        <p className="step-subtitle">Both parties must sign to execute this agreement.</p>
      </div>

      <div className="sig-grid">
        <div className="sig-panel glass-card">
          <h3 className="sig-panel-title">Client Signature</h3>
          <div className="sig-pad">
            <p className="sig-pad-text">Click or draw to sign</p>
          </div>
          <div className="form-field">
            <label className="form-label">Print Name *</label>
            <input
              className="form-input"
              value={state.clientPrintName}
              onChange={e => dispatch({ type: 'SET_CLIENT_PRINT_NAME', name: e.target.value })}
              placeholder="Full name"
            />
          </div>
          <div className="sig-meta">
            <span>Date: {new Date().toLocaleDateString('en-GB')}</span>
            <span>Position: {state.clientInfo.position || 'N/A'}</span>
          </div>
        </div>

        <div className="sig-panel glass-card">
          <h3 className="sig-panel-title">Core Fire Protection</h3>
          <div className="sig-pad">
            <p className="sig-pad-text">Click or draw to sign</p>
          </div>
          <div className="form-field">
            <label className="form-label">Print Name *</label>
            <input
              className="form-input"
              value={state.cfPrintName}
              onChange={e => dispatch({ type: 'SET_CF_PRINT_NAME', name: e.target.value })}
              placeholder="Full name"
            />
          </div>
          <div className="sig-meta">
            <span>Date: {new Date().toLocaleDateString('en-GB')}</span>
            <span>Position: Account Manager</span>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════
   STEP 6: Success / Confirmation
   ═══════════════════════════════════════════════════════════ */
function StepSuccess() {
  const { state, dispatch } = useAgreement()
  const navigate = useNavigate()
  const pricing = calcPricing(state.selections, parseFloat(state.clientInfo.escalationRate) || 3.5)

  // Save to localStorage
  useEffect(() => {
    try {
      const existing = JSON.parse(localStorage.getItem('corefire_agreements') || '[]')
      const entry = {
        id: `AG-${Date.now()}`,
        clientName: state.clientInfo.companyName || 'Unnamed',
        siteAddress: state.clientInfo.siteAddress,
        date: new Date().toLocaleDateString('en-GB'),
        serviceCount: Object.keys(state.selections).length,
        totalValue: pricing.year1,
        status: 'Signed',
      }
      existing.unshift(entry)
      localStorage.setItem('corefire_agreements', JSON.stringify(existing))
    } catch { /* ignore */ }
  }, [])

  const timeline = [
    { day: 'Day 1', title: 'Agreement Executed', desc: 'Digital agreement signed and filed.', done: true },
    { day: 'Day 2-3', title: 'Account Setup', desc: 'Client portal access and engineer assignment.', done: false },
    { day: 'Day 5-7', title: 'Initial Site Survey', desc: 'Comprehensive asset audit and condition assessment.', done: false },
    { day: 'Day 10-14', title: 'PPM Schedule Published', desc: 'Annual maintenance calendar issued to client.', done: false },
    { day: 'Day 14-21', title: 'First Service Visit', desc: 'First planned preventative maintenance visit.', done: false },
  ]

  return (
    <div className="step-success animate-fade-in">
      <div className="success-hero">
        <div className="success-check">&#x2713;</div>
        <h2 className="success-title">Agreement Executed Successfully</h2>
        <p className="success-subtitle">
          Service agreement for <strong>{state.clientInfo.companyName || 'Client'}</strong> has been signed and saved.
        </p>
      </div>

      <div className="success-layout">
        <div className="success-summary glass-card">
          <h3 className="pricing-section-title">Agreement Summary</h3>
          <div className="summary-rows">
            <div className="summary-row">
              <span className="summary-label">Client</span>
              <span className="summary-value">{state.clientInfo.companyName || 'N/A'}</span>
            </div>
            <div className="summary-row">
              <span className="summary-label">Site</span>
              <span className="summary-value">{state.clientInfo.siteAddress || 'N/A'}</span>
            </div>
            <div className="summary-row">
              <span className="summary-label">Services</span>
              <span className="summary-value">{Object.keys(state.selections).length} selected</span>
            </div>
            <div className="summary-row">
              <span className="summary-label">Year 1 Total</span>
              <span className="summary-value mono gold-text">&pound;{pricing.year1.toFixed(2)}</span>
            </div>
            <div className="summary-row">
              <span className="summary-label">5-Year Total</span>
              <span className="summary-value mono gold-text">&pound;{pricing.projTotal.toFixed(2)}</span>
            </div>
            <div className="summary-row">
              <span className="summary-label">Contract Type</span>
              <span className="summary-value">{state.clientInfo.isRolling ? 'Rolling' : 'Fixed Term'}</span>
            </div>
          </div>
        </div>

        <div className="success-timeline glass-card">
          <h3 className="pricing-section-title">Onboarding Timeline</h3>
          <div className="timeline-items">
            {timeline.map((t, i) => (
              <div key={i} className={`timeline-item ${t.done ? 'done' : ''}`}>
                <div className="timeline-dot"></div>
                <div className="timeline-content">
                  <span className="timeline-day mono">{t.day}</span>
                  <span className="timeline-title">{t.title}</span>
                  <span className="timeline-desc">{t.desc}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="success-actions">
        <button className="btn-primary" onClick={() => { dispatch({ type: 'RESET' }); navigate('/') }}>
          &#x1F3E0; Return Home
        </button>
        <button className="btn-secondary" onClick={() => navigate('/history')}>
          View History
        </button>
      </div>
    </div>
  )
}
