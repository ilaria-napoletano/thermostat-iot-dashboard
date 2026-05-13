import { useState } from 'react'
import { useThermostat } from '../hooks/useThermostat'

const glass = {
  background: 'rgba(15, 25, 50, 0.7)',
  backdropFilter: 'blur(12px)',
  border: '1px solid rgba(99, 179, 237, 0.12)',
  borderRadius: 16,
}

export default function Settings() {
  const { data, isMock } = useThermostat()
  const [target, setTarget] = useState(data?.target ?? 21)
  const [saved, setSaved] = useState(false)

  function handleSave() {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <h1 style={{ fontSize: 'clamp(18px, 4vw, 22px)', fontWeight: 700, color: '#f1f5f9' }}>Impostazioni</h1>
        <p style={{ fontSize: 13, color: '#64748b', marginTop: 2 }}>Configurazione termostato</p>
      </div>

      {isMock && (
        <div style={{
          background: 'rgba(234,179,8,0.08)', border: '1px solid rgba(234,179,8,0.2)',
          borderRadius: 12, padding: '10px 16px', color: '#facc15', fontSize: 13,
        }}>
          Modalità demo — le modifiche non vengono salvate
        </div>
      )}

      <div style={{ ...glass, padding: 24 }}>
        <label style={{
          fontSize: 11, fontWeight: 600, color: '#475569',
          textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: 20,
        }}>
          Temperatura target
        </label>

        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: 20,
        }}>
          <span style={{
            fontSize: 'clamp(48px, 14vw, 64px)',
            fontWeight: 800, color: '#60a5fa', lineHeight: 1, letterSpacing: '-2px',
          }}>
            {target}
            <span style={{ fontSize: '40%', color: '#475569', fontWeight: 400 }}>°C</span>
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            onClick={() => setTarget(t => Math.max(10, +(t - 0.5).toFixed(1)))}
            style={btnStyle}
          >−</button>
          <input
            type="range" min={10} max={30} step={0.5}
            value={target}
            onChange={e => setTarget(Number(e.target.value))}
            style={{ flex: 1, accentColor: '#3b82f6', height: 6, cursor: 'pointer' }}
          />
          <button
            onClick={() => setTarget(t => Math.min(30, +(t + 0.5).toFixed(1)))}
            style={btnStyle}
          >+</button>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
          <span style={{ fontSize: 11, color: '#334155' }}>10°C</span>
          <span style={{ fontSize: 11, color: '#334155' }}>30°C</span>
        </div>

        <button
          onClick={handleSave}
          style={{
            width: '100%', marginTop: 24, padding: 14,
            borderRadius: 12, fontWeight: 700, fontSize: 15,
            cursor: 'pointer', border: 'none', transition: 'all 0.2s',
            background: saved ? 'rgba(34,197,94,0.15)' : 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
            color: saved ? '#22c55e' : '#fff',
            boxShadow: saved ? 'none' : '0 4px 20px rgba(59,130,246,0.3)',
          }}
        >
          {saved ? '✓ Salvato' : 'Salva impostazioni'}
        </button>
      </div>

      <div style={{ ...glass, padding: 24 }}>
        <p style={{
          fontSize: 11, fontWeight: 600, color: '#475569',
          textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 16,
        }}>
          Informazioni
        </p>
        {[
          ['Versione app', '1.0.0'],
          ['Fonte dati', isMock ? 'Demo (simulato)' : 'Firebase Realtime DB'],
          ['Progetto Firebase', 'esp8266-prova1'],
        ].map(([k, v]) => (
          <div key={k} style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: 14, marginTop: 14,
          }}>
            <span style={{ fontSize: 14, color: '#64748b' }}>{k}</span>
            <span style={{ fontSize: 14, color: '#94a3b8', fontWeight: 500, textAlign: 'right', maxWidth: '55%' }}>{v}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

const btnStyle = {
  width: 40, height: 40, borderRadius: 10,
  background: 'rgba(255,255,255,0.06)',
  border: '1px solid rgba(255,255,255,0.08)',
  color: '#94a3b8', fontSize: 20, fontWeight: 300,
  cursor: 'pointer', flexShrink: 0,
  display: 'flex', alignItems: 'center', justifyContent: 'center',
}
