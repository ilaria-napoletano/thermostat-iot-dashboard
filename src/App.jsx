import { BrowserRouter, Routes, Route } from 'react-router-dom'
import NavBar from './components/NavBar'
import Dashboard from './pages/Dashboard'
import History from './pages/History'
import Programmazione from './pages/Programmazione'
import Settings from './pages/Settings'
import Notifiche from './pages/Notifiche'
import { AuthProvider } from './hooks/useAuth'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
          <NavBar />
          <main
            className="main-content"
            style={{
              flex: 1,
              maxWidth: 900,
              width: '100%',
              margin: '0 auto',
              padding: '28px 16px 48px',
            }}
          >
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/programmazione" element={<Programmazione />} />
              <Route path="/history" element={<History />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/notifiche" element={<Notifiche />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </AuthProvider>
  )
}
