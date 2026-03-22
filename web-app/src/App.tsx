import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AgreementProvider } from './context/AgreementContext'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import AgreementPage from './pages/AgreementPage'
import HistoryPage from './pages/HistoryPage'

export default function App() {
  return (
    <AgreementProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/agreement" element={<AgreementPage />} />
            <Route path="/history" element={<HistoryPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AgreementProvider>
  )
}
