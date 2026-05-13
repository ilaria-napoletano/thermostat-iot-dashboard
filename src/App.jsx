import { BrowserRouter, Routes, Route } from 'react-router-dom'
import NavBar from './components/NavBar'
import Dashboard from './pages/Dashboard'
import History from './pages/History'
import Settings from './pages/Settings'
import Status from './pages/Status'

export default function App() {
  return (
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
            <Route path="/history" element={<History />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/status" element={<Status />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}
