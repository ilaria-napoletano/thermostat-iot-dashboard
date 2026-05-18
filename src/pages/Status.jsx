import { useThermostat } from '../hooks/useThermostat'

export default function Status() {
  const { data, error, isMock } = useThermostat()

  const rows = [
    { label: 'Connessione Firebase', value: error ? 'Errore' : 'Connesso', ok: !error },
    { label: 'Fonte dati', value: isMock ? 'Demo (mock)' : 'Firebase Realtime DB', ok: !isMock },
    { label: 'Stato termostato', value: data?.isOn ? 'Acceso' : 'Spento', ok: data?.isOn },
    { label: 'Modalità', value: data?.mode ?? '—', ok: null },
    { label: 'Temperatura', value: data?.temperature != null ? `${data.temperature}°C` : '—', ok: null },
    { label: 'Umidità', value: data?.humidity != null ? `${data.humidity}%` : '—', ok: null },
    {
      label: 'Ultimo aggiornamento',
      value: data?.lastUpdated ? new Date(data.lastUpdated).toLocaleString('it-IT') : '—',
      ok: null,
    },
  ]

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <h1 style={{ fontSize: 'clamp(18px, 4vw, 22px)', fontWeight: 700, color: '#1e293b' }}>Stato sistema</h1>
        <p style={{ fontSize: 13, color: '#475569', marginTop: 2 }}>Diagnostica e connettività</p>
      </div>

      <div style={{
        background: 'rgba(255, 255, 255, 0.65)',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(255, 255, 255, 0.8)',
        boxShadow: '0 8px 32px rgba(15, 23, 42, 0.04)',
        borderRadius: 20, overflow: 'hidden',
      }}>
        {rows.map(({ label, value, ok }, i) => (
          <div key={label} style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '15px 20px',
            borderBottom: i < rows.length - 1 ? '1px solid rgba(0,0,0,0.05)' : 'none',
            gap: 12,
          }}>
            <span style={{ fontSize: 14, color: '#475569', flexShrink: 0 }}>{label}</span>
            <span style={{
              fontSize: 14, fontWeight: 600, textAlign: 'right',
              color: ok === null ? '#64748b' : ok ? '#16a34a' : '#ef4444',
            }}>
              {ok !== null && (
                <span style={{ marginRight: 5, fontSize: 8 }}>●</span>
              )}
              {value}
            </span>
          </div>
        ))}
      </div>

      {error && (
        <div style={{
          background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
          borderRadius: 12, padding: '14px 20px', color: '#ef4444', fontSize: 13,
        }}>
          {error}
        </div>
      )}
    </div>
  )
}
