import { useState, useEffect } from 'react'
import './HistoryPage.css'

interface SavedAgreement {
  id: string;
  clientName: string;
  siteAddress?: string;
  date: string;
  serviceCount: number;
  totalValue: number;
  status?: string;
}

const STORAGE_KEY = 'corefire_agreements'

export default function HistoryPage() {
  const [agreements, setAgreements] = useState<SavedAgreement[]>([])

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) setAgreements(JSON.parse(raw))
    } catch { /* ignore */ }
  }, [])

  return (
    <div className="history-page">
      <div className="container">
        <div className="history-header animate-fade-in-up">
          <div>
            <h1 className="history-title">Agreement History</h1>
            <p className="history-subtitle">Previously executed service agreements.</p>
          </div>
          <div className="history-count">
            <span className="count-num gradient-text">{agreements.length}</span>
            <span className="count-label">Saved</span>
          </div>
        </div>

        {agreements.length === 0 ? (
          <div className="history-empty animate-fade-in-up delay-2">
            <div className="empty-icon">&#x1F4C4;</div>
            <h2 className="empty-title">No Agreements Yet</h2>
            <p className="empty-desc">
              Completed agreements will appear here. Start by creating a new agreement from the Home page.
            </p>
          </div>
        ) : (
          <div className="history-table glass-card animate-fade-in-up delay-2">
            <div className="ht-header">
              <span className="ht-cell" style={{ flex: 2 }}>Company</span>
              <span className="ht-cell" style={{ flex: 2 }}>Site Address</span>
              <span className="ht-cell" style={{ flex: 1, textAlign: 'center' }}>Services</span>
              <span className="ht-cell" style={{ flex: 1, textAlign: 'right' }}>Year 1 Total</span>
              <span className="ht-cell" style={{ flex: 1, textAlign: 'center' }}>Date</span>
              <span className="ht-cell" style={{ flex: 1, textAlign: 'center' }}>Status</span>
            </div>
            {agreements.map(ag => (
              <div key={ag.id} className="ht-row">
                <span className="ht-cell ht-company" style={{ flex: 2 }}>{ag.clientName || 'Unnamed'}</span>
                <span className="ht-cell" style={{ flex: 2 }}>{ag.siteAddress || '\u2014'}</span>
                <span className="ht-cell" style={{ flex: 1, textAlign: 'center' }}>{ag.serviceCount}</span>
                <span className="ht-cell mono gold-text" style={{ flex: 1, textAlign: 'right' }}>&pound;{ag.totalValue.toFixed(2)}</span>
                <span className="ht-cell" style={{ flex: 1, textAlign: 'center' }}>{ag.date}</span>
                <span className="ht-cell" style={{ flex: 1, textAlign: 'center' }}>
                  <span className={`status-badge ${ag.status === 'Signed' ? 'signed' : ''}`}>
                    {ag.status || 'Draft'}
                  </span>
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
