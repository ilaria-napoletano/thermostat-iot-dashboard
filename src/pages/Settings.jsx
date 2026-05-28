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
  const { currentUser, login, logout, updateProfile, loading: authLoading } = useAuth()
  
  const [userName, setUserName] = useState('')
  const [gender, setGender] = useState('m')
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)

  // Login states
  const [loginUser, setLoginUser] = useState('')
  const [loginPass, setLoginPass] = useState('')
  const [loginError, setLoginError] = useState('')
  const [isLoggingIn, setIsLoggingIn] = useState(false)

  useEffect(() => {
    if (currentUser) {
      if (currentUser.userName) setUserName(currentUser.userName)
      if (currentUser.gender) setGender(currentUser.gender)
    }
  }, [currentUser])

  const handleSaveSettings = async () => {
    setIsSaving(true)
    setSaveSuccess(false)
    try {
      await updateProfile({ userName, gender })
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch (err) {
      console.error('Errore durante il salvataggio:', err)
      alert('Errore durante il salvataggio: ' + err.message)
    } finally {
      setIsSaving(false)
    }
  }

  const handleIsteresiChange = async (val) => {
    const newVal = Number(val);
    setIsteresi(newVal);
    if (isMock) return;
    try {
      const { ref, set } = await import('firebase/database');
      const { db } = await import('../firebase/config');
      const targetRef = ref(db, 'termostato/setting/isteresi');
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

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontSize: 'clamp(18px, 4vw, 22px)', fontWeight: 700, color: '#1e293b' }}>Impostazioni</h1>
          <p style={{ fontSize: 13, color: '#475569', marginTop: 2 }}>Configurazione termostato</p>
        </div>
        {currentUser && (
          <button 
            onClick={logout}
            style={{
              padding: '6px 14px', borderRadius: 8, background: 'rgba(239,68,68,0.1)', color: '#ef4444',
              border: '1px solid rgba(239,68,68,0.2)', fontWeight: 600, fontSize: 13, cursor: 'pointer'
            }}
          >
            Esci
          </button>
        )}
      </div>

      {isMock && (
        <div style={{
          background: 'rgba(234,179,8,0.08)', border: '1px solid rgba(234,179,8,0.2)',
          borderRadius: 12, padding: '10px 16px', color: '#d97706', fontSize: 13,
        }}>
          Modalità demo — le modifiche sono salvate localmente.
        </div>
      )}

      {!currentUser ? (
        <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {isMock && (
            <div style={{
              background: 'rgba(56,189,248,0.08)', border: '1px solid rgba(56,189,248,0.2)',
              borderRadius: 12, padding: '10px 16px', color: '#0284c7', fontSize: 13,
            }}>
              Modalità demo — Usa "test" come username e password.
            </div>
          )}

          <div style={{ ...glass, padding: 24 }}>
            <p style={{
              fontSize: 11, fontWeight: 700, color: '#64748b',
              textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 16,
            }}>
              Accedi per configurare
            </p>
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
      ) : (
        <div style={{ ...glass, padding: 24, marginBottom: 16 }}>
          <p style={{
            fontSize: 11, fontWeight: 700, color: '#64748b',
            textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 16,
          }}>
            Preferenze Utente ({currentUser.username})
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <label style={{ fontSize: 13, color: '#475569', fontWeight: 500 }}>Nome Utente (visualizzato in Home)</label>
              <input 
                type="text" 
                value={userName} 
                onChange={e => setUserName(e.target.value)}
                placeholder="Inserisci il tuo nome"
                style={{
                  width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid rgba(0,0,0,0.1)',
                  background: 'rgba(255,255,255,0.8)', fontSize: 14, color: '#1e293b', outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <label style={{ fontSize: 13, color: '#475569', fontWeight: 500 }}>Formula di Saluto</label>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {[
                  { key: 'm', label: 'Bentornato ♂️' },
                  { key: 'f', label: 'Bentornata ♀️' },
                  { key: 'x', label: 'Bentornatə ⚧️' },
                ].map(opt => (
                  <button
                    key={opt.key}
                    onClick={() => setGender(opt.key)}
                    style={{
                      flex: 1,
                      minWidth: 110,
                      padding: '10px 14px',
                      borderRadius: 10,
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      background: gender === opt.key ? '#0284c7' : 'rgba(255, 255, 255, 0.4)',
                      color: gender === opt.key ? 'white' : '#475569',
                      border: gender === opt.key ? '1px solid #0284c7' : '1px solid rgba(0,0,0,0.08)',
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 4 }}>
              <button 
                onClick={handleSaveSettings}
                disabled={isMock && false || isSaving || !userName.trim()}
                style={{
                  padding: '10px 24px', borderRadius: 10, background: '#0284c7', color: 'white',
                  border: 'none', fontWeight: 600, fontSize: 14, cursor: (isSaving || !userName.trim()) ? 'not-allowed' : 'pointer',
                  opacity: (isSaving || !userName.trim()) ? 0.6 : 1, transition: 'all 0.2s',
                  boxShadow: '0 4px 12px rgba(2, 132, 199, 0.15)'
                }}
              >
                {isSaving ? 'Salvataggio...' : 'Salva Impostazioni'}
              </button>
            </div>
            {saveSuccess && (
              <p style={{ fontSize: 12, color: '#059669', margin: 0, textAlign: 'right' }}>Impostazioni aggiornate con successo!</p>
            )}
          </div>
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
              Isteresi: <strong style={{ color: '#2799cd' }}>{isteresi.toFixed(1)}°C</strong>
              {!currentUser && (
                <span style={{ 
                  color: '#ef4444', 
                  fontSize: 12, 
                  fontWeight: 600, 
                  marginLeft: 8,
                  padding: '2px 8px',
                  background: 'rgba(239, 68, 68, 0.1)',
                  borderRadius: '6px',
                  display: 'inline-block'
                }}>
                  Accedi per modificare
                </span>
              )}
            </label>
            <p style={{ fontSize: 11, color: '#64748b', marginTop: -4 }}>
              Determina lo scarto di temperatura (in °C) per l'accensione e lo spegnimento del riscaldamento.
            </p>
            <input 
              type="range" 
              min="0.2" 
              max="0.8" 
              step="0.1" 
              value={isteresi} 
              disabled={!currentUser}
              onChange={e => setIsteresi(Number(e.target.value))}
              onMouseUp={e => handleIsteresiChange(e.target.value)}
              onTouchEnd={e => handleIsteresiChange(e.target.value)}
              style={{ 
                width: '100%', 
                cursor: currentUser ? 'pointer' : 'not-allowed',
                opacity: currentUser ? 1 : 0.6,
                accentColor: '#2799cd'
              }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#94a3b8' }}>
              <span>0.2°C</span>
              <span>0.8°C</span>
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
          ['Database', 'TermIoT-DB'],
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

      <div style={{ ...glass, padding: 24, marginTop: 16 }}>
        <p style={{
          fontSize: 11, fontWeight: 700, color: '#64748b',
          textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 16,
        }}>
          Team di Sviluppo
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[
            'Ilaria Napoletano',
            'Simone Randino',
            'Daniele Moraglia',
            'Emanuele Vita'
          ].map((name, index) => (
            <div key={name} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              borderTop: index > 0 ? '1px solid rgba(0,0,0,0.05)' : 'none',
              paddingTop: index > 0 ? 12 : 0,
            }}>
              <span style={{ 
                width: 8, height: 8, borderRadius: '50%', 
                background: '#0284c7', display: 'inline-block' 
              }} />
              <span style={{ fontSize: 14, color: '#1e293b', fontWeight: 600 }}>{name}</span>
            </div>
          ))}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            borderTop: '1px solid rgba(0,0,0,0.05)',
            paddingTop: 16,
            marginTop: 4
          }}>
            <img 
              src="/Logo.png" 
              alt="TermIoT Logo" 
              style={{ width: 120, height: 120, objectFit: 'contain' }} 
            />
          </div>
        </div>
      </div>
    </div>
  )
}
