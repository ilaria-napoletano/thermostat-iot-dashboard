import { NavLink } from 'react-router-dom'

const links = [
  { to: '/', label: 'Dashboard', icon: '⊞' },
  { to: '/history', label: 'Storico', icon: '↗' },
  { to: '/settings', label: 'Impostazioni', icon: '⚙' },
  { to: '/status', label: 'Stato', icon: '◉' },
]

export default function NavBar() {
  return (
    <>
      {/* Desktop top navbar */}
      <header className="desktop-nav" style={{
        background: 'rgba(10, 15, 30, 0.95)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(99, 179, 237, 0.1)',
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
            <div style={{
              width: 32, height: 32,
              background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
              borderRadius: 8,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 16,
            }}>🌡</div>
            <span style={{ fontWeight: 700, fontSize: 16, color: '#f1f5f9', letterSpacing: '-0.3px' }}>
              ThermoIoT
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
                  fontWeight: 500,
                  textDecoration: 'none',
                  transition: 'all 0.2s',
                  background: isActive ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
                  color: isActive ? '#60a5fa' : '#94a3b8',
                  border: isActive ? '1px solid rgba(59, 130, 246, 0.3)' : '1px solid transparent',
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
        background: 'rgba(8, 12, 28, 0.97)',
        backdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(99, 179, 237, 0.12)',
        display: 'none',
        justifyContent: 'space-around',
        alignItems: 'center',
        height: 68,
        paddingBottom: 'env(safe-area-inset-bottom)',
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
              color: isActive ? '#60a5fa' : '#475569',
              transition: 'color 0.2s',
              flex: 1,
            })}
          >
            {({ isActive }) => (
              <>
                <span style={{ fontSize: 20, lineHeight: 1 }}>{icon}</span>
                <span style={{
                  fontSize: 10, fontWeight: 600, letterSpacing: '0.04em',
                  color: isActive ? '#60a5fa' : '#475569',
                }}>
                  {label}
                </span>
                {isActive && (
                  <span style={{
                    position: 'absolute',
                    bottom: 0,
                    width: 20, height: 2,
                    background: '#3b82f6',
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
