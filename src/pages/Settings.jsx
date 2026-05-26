import { useState, useEffect } from 'react'
import { useThermostat } from '../hooks/useThermostat'
import { useUserSettings } from '../hooks/useUserSettings'

const glass = {
  background: 'rgba(255, 255, 255, 0.65)',
  backdropFilter: 'blur(16px)',
  border: '1px solid rgba(255, 255, 255, 0.8)',
  borderRadius: 20,
  boxShadow: '0 8px 32px rgba(15, 23, 42, 0.04)',
}

export default function Settings() {
  const { isMock } = useThermostat()
  const { settings, updateUserName } = useUserSettings()
  const [userName, setUserName] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)

  useEffect(() => {
    if (settings?.userName) {
      setUserName(settings.userName)
    }
  }, [settings?.userName])

  const handleSaveName = async () => {
    setIsSaving(true)
    setSaveSuccess(false)
    try {
      await updateUserName(userName)
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch (err) {
      console.error('Errore durante il salvataggio:', err)
      alert('Errore durante il salvataggio: ' + err.message)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <h1 style={{ fontSize: 'clamp(18px, 4vw, 22px)', fontWeight: 700, color: '#1e293b' }}>Impostazioni</h1>
        <p style={{ fontSize: 13, color: '#475569', marginTop: 2 }}>Configurazione termostato</p>
      </div>

      {isMock && (
        <div style={{
          background: 'rgba(234,179,8,0.08)', border: '1px solid rgba(234,179,8,0.2)',
          borderRadius: 12, padding: '10px 16px', color: '#d97706', fontSize: 13,
        }}>
          Modalità demo — le modifiche non vengono salvate
        </div>
      )}

      <div style={{ ...glass, padding: 24, marginBottom: 16 }}>
        <p style={{
          fontSize: 11, fontWeight: 700, color: '#64748b',
          textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 16,
        }}>
          Preferenze Utente
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <label style={{ fontSize: 13, color: '#475569', fontWeight: 500 }}>Nome Utente (visualizzato in Home)</label>
          <div style={{ display: 'flex', gap: 8 }}>
            <input 
              type="text" 
              value={userName} 
              onChange={e => setUserName(e.target.value)}
              placeholder="Inserisci il tuo nome"
              style={{
                flex: 1, padding: '10px 14px', borderRadius: 10, border: '1px solid rgba(0,0,0,0.1)',
                background: 'rgba(255,255,255,0.8)', fontSize: 14, color: '#1e293b', outline: 'none'
              }}
            />
            <button 
              onClick={handleSaveName}
              disabled={isMock || isSaving || !userName.trim()}
              style={{
                padding: '10px 20px', borderRadius: 10, background: '#0284c7', color: 'white',
                border: 'none', fontWeight: 600, fontSize: 14, cursor: (isMock || isSaving || !userName.trim()) ? 'not-allowed' : 'pointer',
                opacity: (isMock || isSaving || !userName.trim()) ? 0.6 : 1, transition: 'all 0.2s'
              }}
            >
              {isSaving ? 'Salvataggio...' : 'Salva'}
            </button>
          </div>
          {saveSuccess && (
            <p style={{ fontSize: 12, color: '#059669', margin: 0 }}>Nome aggiornato con successo!</p>
          )}
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

