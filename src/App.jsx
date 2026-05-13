import { BrowserRouter, Routes, Route } from 'react-router-dom'
import NavBar from './components/NavBar'
import Dashboard from './pages/Dashboard'
import History from './pages/History'
import Settings from './pages/Settings'
import Status from './pages/Status'

export default function App() {
  return (
    <BrowserRouter>
      <div className="max-w-2xl mx-auto min-h-screen flex flex-col">
        <NavBar />
        <main className="flex-1 px-4 py-6 pb-24 md:pt-20">
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
