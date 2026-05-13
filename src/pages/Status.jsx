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
        <h1 style={{ fontSize: 'clamp(18px, 4vw, 22px)', fontWeight: 700, color: '#f1f5f9' }}>Stato sistema</h1>
        <p style={{ fontSize: 13, color: '#64748b', marginTop: 2 }}>Diagnostica e connettività</p>
      </div>

      <div style={{
        background: 'rgba(15, 25, 50, 0.7)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(99, 179, 237, 0.12)',
        borderRadius: 16, overflow: 'hidden',
      }}>
        {rows.map(({ label, value, ok }, i) => (
          <div key={label} style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '15px 20px',
            borderBottom: i < rows.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
            gap: 12,
          }}>
            <span style={{ fontSize: 14, color: '#64748b', flexShrink: 0 }}>{label}</span>
            <span style={{
              fontSize: 14, fontWeight: 600, textAlign: 'right',
              color: ok === null ? '#94a3b8' : ok ? '#22c55e' : '#f87171',
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
          borderRadius: 12, padding: '14px 20px', color: '#f87171', fontSize: 13,
        }}>
          {error}
        </div>
      )}
    </div>
  )
}
