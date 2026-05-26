import { NavLink } from 'react-router-dom'

const links = [
  { to: '/', label: 'Dashboard', icon: '⊞' },
  { to: '/history', label: 'Storico', icon: '↗' },
  { to: '/settings', label: 'Impostazioni', icon: '⚙' },
]

export default function NavBar() {
  return (
    <>
      {/* Desktop top navbar */}
      <header className="desktop-nav" style={{
        background: 'transparent',
        borderBottom: 'none',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}>
        <div style={{
          maxWidth: 900,
          margin: '0 auto',
          padding: '0 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: 64,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <img 
              src="/logo.png" 
              alt="Thermostat-IoT Logo" 
              style={{ width: 36, height: 36, borderRadius: 8, objectFit: 'contain' }} 
            />
            <span style={{ fontWeight: 700, fontSize: 18, color: '#ffffff', letterSpacing: '-0.3px' }}>
              Thermostat-IoT
            </span>
          </div>

          <nav style={{ display: 'flex', gap: 4 }}>
            {links.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                style={({ isActive }) => ({
                  padding: '6px 16px',
                  borderRadius: 8,
                  fontSize: 14,
                  fontWeight: 600,
                  textDecoration: 'none',
                  transition: 'all 0.2s',
                  background: isActive ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
                  color: isActive ? '#ffffff' : 'rgba(255, 255, 255, 0.7)',
                })}
              >
                {label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

      {/* Mobile bottom navbar */}
      <nav className="mobile-nav" style={{
        position: 'fixed',
        bottom: 0, left: 0, right: 0,
        zIndex: 100,
        background: 'rgba(255, 255, 255, 0.85)',
        backdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(0, 0, 0, 0.05)',
        display: 'none',
        justifyContent: 'space-around',
        alignItems: 'center',
        height: 68,
        paddingBottom: 'env(safe-area-inset-bottom)',
        boxShadow: '0 -4px 20px rgba(0,0,0,0.03)'
      }}>
        {links.map(({ to, label, icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            style={({ isActive }) => ({
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 4,
              padding: '8px 16px',
              textDecoration: 'none',
              color: isActive ? '#0284c7' : '#94a3b8',
              transition: 'color 0.2s',
              flex: 1,
            })}
          >
            {({ isActive }) => (
              <>
                <span style={{ fontSize: 20, lineHeight: 1 }}>{icon}</span>
                <span style={{
                  fontSize: 10, fontWeight: 600, letterSpacing: '0.04em',
                  color: isActive ? '#0284c7' : '#94a3b8',
                }}>
                  {label}
                </span>
                {isActive && (
                  <span style={{
                    position: 'absolute',
                    bottom: 0,
                    width: 20, height: 2,
                    background: '#0284c7',
                    borderRadius: 2,
                  }} />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </>
  )
}
