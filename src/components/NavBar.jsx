import { NavLink } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { ref, onValue } from 'firebase/database'
import { db } from '../firebase/config'

const links = [
  { to: '/', label: 'Dashboard', icon: '🏠' },
  { to: '/programmazione', label: 'Programma', icon: '⏱' },
  { to: '/history', label: 'Storico', icon: '📈' },
  { to: '/notifiche', label: 'Notifiche', icon: '🔔' },
  { to: '/settings', label: 'Impostazioni', icon: '⚙' },
]

export default function NavBar() {
  const [activeAlertCount, setActiveAlertCount] = useState(0);

  useEffect(() => {
    const alertRef = ref(db, 'alert');
    let interval;
    
    const unsubscribe = onValue(alertRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) {
        setActiveAlertCount(0);
        return;
      }
      
      const checkStaleness = () => {
        const matlabDateStr = data.timestamp ? data.timestamp.replace(" ", "T") : null;
        const matlabDate = matlabDateStr ? new Date(matlabDateStr) : null;
        let isStale = false;
        
        if (matlabDate) {
          const diffMs = new Date() - matlabDate;
          if (diffMs > 120000) isStale = true;
        } else {
          isStale = true;
        }
        
        if (isStale) {
          setActiveAlertCount(0);
        } else {
          const keys = ['incendio', 'guasto_hardware', 'temp_alta', 'temp_bassa', 'co_alta', 'offline'];
          const count = keys.reduce((acc, key) => acc + (data[key] === true ? 1 : 0), 0);
          setActiveAlertCount(count);
        }
      };

      checkStaleness();
      clearInterval(interval);
      interval = setInterval(checkStaleness, 10000);
    });

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, []);

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
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 8,
            background: 'rgba(255, 255, 255, 0.9)',
            padding: '6px 14px',
            borderRadius: '9999px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255, 255, 255, 0.4)'
          }}>
            <img 
              src="/LogoSolo.png" 
              alt="TermIoT Logo" 
              style={{ width: 28, height: 28, objectFit: 'contain' }} 
            />
            <span style={{ fontWeight: 800, fontSize: 18, letterSpacing: '-0.5px', display: 'flex', alignItems: 'center' }}>
              <span style={{ color: '#1e293b' }}>Term</span>
              <span style={{ color: '#2799cd' }}>Io</span>
              <span style={{ color: '#ef4444' }}>T</span>
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
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                })}
              >
                {label}
                {to === '/notifiche' && activeAlertCount > 0 && (
                  <span style={{
                    background: '#ef4444',
                    color: '#fff',
                    fontSize: 11,
                    fontWeight: 700,
                    padding: '2px 6px',
                    borderRadius: 12,
                    lineHeight: 1
                  }}>
                    {activeAlertCount}
                  </span>
                )}
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
                <div style={{ position: 'relative' }}>
                  <span style={{ fontSize: 20, lineHeight: 1 }}>{icon}</span>
                  {to === '/notifiche' && activeAlertCount > 0 && (
                    <span style={{
                      position: 'absolute',
                      top: -4,
                      right: -8,
                      background: '#ef4444',
                      color: '#fff',
                      fontSize: 9,
                      fontWeight: 700,
                      padding: '2px 5px',
                      borderRadius: 10,
                      lineHeight: 1
                    }}>
                      {activeAlertCount}
                    </span>
                  )}
                </div>
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
