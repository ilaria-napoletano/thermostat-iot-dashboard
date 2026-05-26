import { useState, useEffect } from 'react'
import { useThermostat } from '../hooks/useThermostat'
import { useAuth } from '../hooks/useAuth'

const glass = {
  background: 'rgba(255, 255, 255, 0.65)',
  backdropFilter: 'blur(16px)',
  border: '1px solid rgba(255, 255, 255, 0.8)',
  borderRadius: 20,
  boxShadow: '0 8px 32px rgba(15, 23, 42, 0.04)',
}

export default function Settings() {
  const { isMock, data: thermostatData } = useThermostat()
  const [isteresi, setIsteresi] = useState(0.2)

  useEffect(() => {
    if (thermostatData && thermostatData.isteresi !== undefined) {
      setIsteresi(thermostatData.isteresi)
    }
  }, [thermostatData?.isteresi])
  const { currentUser, login, logout, loading: authLoading } = useAuth()
  
  // Login states
  const [loginUser, setLoginUser] = useState('')
  const [loginPass, setLoginPass] = useState('')
  const [loginError, setLoginError] = useState('')
  const [isLoggingIn, setIsLoggingIn] = useState(false)

  const handleIsteresiChange = async (val) => {
    const newVal = Number(val);
    setIsteresi(newVal);
    if (isMock) return;
    try {
      const { ref, set } = await import('firebase/database');
      const { db } = await import('../firebase/config');
      const targetRef = ref(db, 'termostato1/config/isteresi');
      await set(targetRef, newVal);
    } catch (err) {
      console.error('Errore durante il salvataggio isteresi:', err);
    }
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    setIsLoggingIn(true)
    setLoginError('')
    try {
      await login(loginUser, loginPass)
    } catch (err) {
      setLoginError(err.message)
    } finally {
      setIsLoggingIn(false)
    }
  }

  if (authLoading) {
    return <p>Caricamento...</p>
  }

  if (!currentUser) {
    return (
      <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 'clamp(18px, 4vw, 22px)', fontWeight: 700, color: '#1e293b' }}>Accesso Richiesto</h1>
          <p style={{ fontSize: 13, color: '#475569', marginTop: 2 }}>Effettua il login per configurare il termostato e modificare la temperatura.</p>
        </div>

        {isMock && (
          <div style={{
            background: 'rgba(56,189,248,0.08)', border: '1px solid rgba(56,189,248,0.2)',
            borderRadius: 12, padding: '10px 16px', color: '#0284c7', fontSize: 13,
          }}>
            Modalità demo — Usa "test" come username e password.
          </div>
        )}

        <div style={{ ...glass, padding: 24, marginBottom: 16 }}>
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <label style={{ fontSize: 13, color: '#475569', fontWeight: 500 }}>Username</label>
              <input 
                type="text" 
                value={loginUser} 
                onChange={e => setLoginUser(e.target.value)}
                placeholder="Inserisci username"
                style={{
                  width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid rgba(0,0,0,0.1)',
                  background: 'rgba(255,255,255,0.8)', fontSize: 14, color: '#1e293b', outline: 'none'
                }}
                required
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <label style={{ fontSize: 13, color: '#475569', fontWeight: 500 }}>Password</label>
              <input 
                type="password" 
                value={loginPass} 
                onChange={e => setLoginPass(e.target.value)}
                placeholder="Inserisci password"
                style={{
                  width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid rgba(0,0,0,0.1)',
                  background: 'rgba(255,255,255,0.8)', fontSize: 14, color: '#1e293b', outline: 'none'
                }}
                required
              />
            </div>
            
            {loginError && <p style={{ color: '#ef4444', fontSize: 13, margin: 0 }}>{loginError}</p>}

            <button 
              type="submit"
              disabled={isLoggingIn || !loginUser || !loginPass}
              style={{
                padding: '10px 24px', borderRadius: 10, background: '#0284c7', color: 'white',
                border: 'none', fontWeight: 600, fontSize: 14, cursor: (isLoggingIn || !loginUser || !loginPass) ? 'not-allowed' : 'pointer',
                opacity: (isLoggingIn || !loginUser || !loginPass) ? 0.6 : 1, transition: 'all 0.2s', marginTop: 8
              }}
            >
              {isLoggingIn ? 'Accesso in corso...' : 'Accedi'}
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontSize: 'clamp(18px, 4vw, 22px)', fontWeight: 700, color: '#1e293b' }}>Impostazioni</h1>
          <p style={{ fontSize: 13, color: '#475569', marginTop: 2 }}>Configurazione termostato</p>
        </div>
        <button 
          onClick={logout}
          style={{
            padding: '6px 14px', borderRadius: 8, background: 'rgba(239,68,68,0.1)', color: '#ef4444',
            border: '1px solid rgba(239,68,68,0.2)', fontWeight: 600, fontSize: 13, cursor: 'pointer'
          }}
        >
          Esci
        </button>
      </div>

      {isMock && (
        <div style={{
          background: 'rgba(234,179,8,0.08)', border: '1px solid rgba(234,179,8,0.2)',
          borderRadius: 12, padding: '10px 16px', color: '#d97706', fontSize: 13,
        }}>
          Modalità demo — le modifiche sono salvate localmente.
        </div>
      )}



      <div style={{ ...glass, padding: 24, marginBottom: 16 }}>
        <p style={{
          fontSize: 11, fontWeight: 700, color: '#64748b',
          textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 16,
        }}>
          Preferenze Termostato
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <label style={{ fontSize: 13, color: '#475569', fontWeight: 500 }}>
              Isteresi: <strong style={{ color: '#0284c7' }}>{isteresi.toFixed(1)}°C</strong>
            </label>
            <p style={{ fontSize: 11, color: '#64748b', marginTop: -4 }}>
              Determina lo scarto di temperatura (in °C) per l'accensione e lo spegnimento del riscaldamento.
            </p>
            <input 
              type="range" 
              min="0.1" 
              max="0.5" 
              step="0.1" 
              value={isteresi} 
              onChange={e => setIsteresi(Number(e.target.value))}
              onMouseUp={e => handleIsteresiChange(e.target.value)}
              onTouchEnd={e => handleIsteresiChange(e.target.value)}
              style={{ width: '100%', cursor: 'pointer' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#94a3b8' }}>
              <span>0.1°C</span>
              <span>0.5°C</span>
            </div>
          </div>
        </div>
      </div>

      <div style={{ ...glass, padding: 24 }}>
        <p style={{
          fontSize: 11, fontWeight: 700, color: '#64748b',
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
            borderTop: '1px solid rgba(0,0,0,0.05)', paddingTop: 14, marginTop: 14,
          }}>
            <span style={{ fontSize: 14, color: '#475569' }}>{k}</span>
            <span style={{ fontSize: 14, color: '#1e293b', fontWeight: 600, textAlign: 'right', maxWidth: '55%' }}>{v}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
