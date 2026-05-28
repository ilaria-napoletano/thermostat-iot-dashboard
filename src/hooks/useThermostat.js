import { useState, useEffect } from 'react'
import { mockThermostatData, generateHistoryMock } from '../mock/mockData'

const USE_MOCK = !import.meta.env.VITE_FIREBASE_API_KEY

let firebaseDb = null

async function getDb() {
  if (firebaseDb) return firebaseDb
  const { db } = await import('../firebase/config')
  firebaseDb = db
  return firebaseDb
}

export function useThermostat() {
  const [data, setData] = useState(null)
  const [history] = useState(() => generateHistoryMock(24))
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (USE_MOCK) {
      setData(mockThermostatData)
      setLoading(false)

      const interval = setInterval(() => {
        setData(prev => ({
          ...prev,
          temperature: +(prev.temperature + (Math.random() - 0.5) * 0.3).toFixed(1),
          humidity: Math.round(prev.humidity + (Math.random() - 0.5) * 2),
          lastUpdated: Date.now(),
        }))
      }, 5000)
      return () => clearInterval(interval)
    }

    let unsubscribe = null

    async function connect() {
      try {
        const { ref, onValue } = await import('firebase/database')
        const db = await getDb()
        // Cambiato da 'termostato1' a 'termostato'
        const thermostatRef = ref(db, 'termostato')
        unsubscribe = onValue(
          thermostatRef,
          snapshot => {
            const val = snapshot.val()
            if (val) {
              // Mappatura della nuova struttura dati dell'ESP a quella della dashboard
              setData({
                temperature: val.status?.temp ?? null,
                humidity: val.status?.hum ?? null,
                target: val.set_temp ?? null,
                isteresi: val.isteresi ?? 0.2,
                isOn: val.status?.wifi_ok ?? true,
                mode: val.status?.uscita === 1 ? 'heating' : 'idle',
                lastUpdated: val.status?.time 
                  ? new Date(val.status.time).getTime() 
                  : Date.now()
              })
            }
            setLoading(false)
          },
          err => {
            setError(err.message)
            setLoading(false)
          }
        )
      } catch (err) {
        setError('Errore configurazione Firebase')
        setLoading(false)
      }
    }

    connect()
    return () => unsubscribe?.()
  }, [])

  return { data, history, loading, error, isMock: USE_MOCK }
}
