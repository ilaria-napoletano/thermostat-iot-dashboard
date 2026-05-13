import { useThermostat } from '../hooks/useThermostat'

const modeInfo = {
  heating: { label: 'Riscaldamento attivo', color: '#fb923c', bg: 'rgba(251,146,60,0.1)', border: 'rgba(251,146,60,0.25)' },
  cooling: { label: 'Raffreddamento attivo', color: '#38bdf8', bg: 'rgba(56,189,248,0.1)', border: 'rgba(56,189,248,0.25)' },
  idle:    { label: 'In standby', color: '#94a3b8', bg: 'rgba(148,163,184,0.1)', border: 'rgba(148,163,184,0.2)' },
}

export default function Dashboard() {
  const { data, loading, error, isMock } = useThermostat()

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{
          width: 44, height: 44, borderRadius: '50%',
          border: '3px solid rgba(59,130,246,0.2)',
          borderTopColor: '#3b82f6',
          animation: 'spin 0.8s linear infinite',
          margin: '0 auto 16px',
        }} />
        <p style={{ color: '#64748b', fontSize: 14 }}>Connessione in corso...</p>
      </div>
    </div>
  )

  if (error) return (
    <div style={{
      background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)',
      borderRadius: 16, padding: 24, textAlign: 'center', color: '#f87171',
    }}>
      <p style={{ fontSize: 16, fontWeight: 600 }}>Errore di connessione</p>
      <p style={{ fontSize: 13, marginTop: 6, opacity: 0.7 }}>{error}</p>
    </div>
  )

  const temp = data?.temperature ?? null
  const humidity = data?.humidity ?? null
  const target = data?.target ?? null
  const isOn = data?.isOn ?? false
  const mode = data?.mode ?? 'idle'
  const currentMode = modeInfo[mode] ?? modeInfo.idle

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {isMock && (
        <div style={{
          background: 'rgba(234,179,8,0.08)', border: '1px solid rgba(234,179,8,0.2)',
          borderRadius: 12, padding: '10px 16px', color: '#facc15',
          fontSize: 13, textAlign: 'center',
        }}>
          Modalità demo — Firebase non connesso
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: 'clamp(18px, 4vw, 22px)', fontWeight: 700, color: '#f1f5f9' }}>
            Dashboard
          </h1>
          <p style={{ fontSize: 13, color: '#64748b', marginTop: 2 }}>Monitoraggio in tempo reale</p>
        </div>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 7,
          background: isOn ? 'rgba(34,197,94,0.1)' : 'rgba(100,116,139,0.1)',
          border: `1px solid ${isOn ? 'rgba(34,197,94,0.3)' : 'rgba(100,116,139,0.2)'}`,
          borderRadius: 100, padding: '6px 12px',
        }}>
          <span className={isOn ? 'live-dot' : ''} style={{
            width: 7, height: 7, borderRadius: '50%',
            background: isOn ? '#22c55e' : '#475569',
            display: 'block', flexShrink: 0,
          }} />
          <span style={{ fontSize: 13, fontWeight: 600, color: isOn ? '#22c55e' : '#64748b' }}>
            {isOn ? 'Online' : 'Offline'}
          </span>
        </div>
      </div>

      {/* Main temperature card */}
      <div className="glass glow-blue" style={{
        padding: 'clamp(24px, 6vw, 44px) clamp(20px, 5vw, 36px)',
        textAlign: 'center',
        background: 'linear-gradient(145deg, rgba(15,25,50,0.9), rgba(10,20,45,0.95))',
      }}>
        <p style={{
          fontSize: 11, fontWeight: 600, letterSpacing: '0.12em',
          color: '#475569', textTransform: 'uppercase', marginBottom: 14,
        }}>
          Temperatura attuale
        </p>

        <div style={{
          fontSize: 'clamp(64px, 18vw, 88px)',
          fontWeight: 800, lineHeight: 1,
          letterSpacing: '-3px', color: '#f1f5f9',
        }}>
          {temp !== null ? temp.toFixed(1) : '--'}
          <span style={{
            fontSize: 'clamp(26px, 7vw, 38px)',
            fontWeight: 400, color: '#475569', marginLeft: 4,
          }}>°C</span>
        </div>

        <div style={{ marginTop: 18, display: 'flex', justifyContent: 'center', gap: 10, flexWrap: 'wrap' }}>
          <span style={{
            fontSize: 13, color: '#94a3b8',
            background: 'rgba(255,255,255,0.04)', borderRadius: 8, padding: '6px 14px',
          }}>
            Target: <strong style={{ color: '#60a5fa' }}>{target !== null ? `${target}°C` : '--'}</strong>
          </span>
          <span style={{
            fontSize: 13, fontWeight: 600,
            background: currentMode.bg,
            border: `1px solid ${currentMode.border}`,
            color: currentMode.color, borderRadius: 8, padding: '6px 14px',
          }}>
            {currentMode.label}
          </span>
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <StatCard label="Umidità" value={humidity !== null ? `${humidity}%` : '--'} sub="Umidità relativa" icon="💧" accent="#38bdf8" />
        <StatCard label="Target" value={target !== null ? `${target}°C` : '--'} sub="Temperatura impostata" icon="🎯" accent="#34d399" />
      </div>

      {data?.lastUpdated && (
        <p style={{ textAlign: 'center', fontSize: 12, color: '#334155' }}>
          Aggiornato: {new Date(data.lastUpdated).toLocaleTimeString('it-IT')}
        </p>
      )}
    </div>
  )
}

function StatCard({ label, value, sub, icon, accent }) {
  return (
    <div className="glass" style={{ padding: 'clamp(14px, 4vw, 20px)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
        <p style={{
          fontSize: 11, fontWeight: 600, color: '#475569',
          textTransform: 'uppercase', letterSpacing: '0.08em',
        }}>{label}</p>
        <span style={{ fontSize: 18 }}>{icon}</span>
      </div>
      <p style={{
        fontSize: 'clamp(24px, 7vw, 32px)',
        fontWeight: 800, color: accent,
        letterSpacing: '-1px', lineHeight: 1,
      }}>{value}</p>
      <p style={{ fontSize: 11, color: '#334155', marginTop: 5 }}>{sub}</p>
    </div>
  )
}
