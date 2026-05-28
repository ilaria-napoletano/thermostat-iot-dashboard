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
                target: val.settings?.set_temp ?? val.setting?.set_temp ?? val.set_temp ?? null,
                isteresi: val.settings?.isteresi ?? val.setting?.isteresi ?? val.isteresi ?? 0.2,
                isOn: val.status?.wifi_ok ?? true,
                mode: val.status?.uscita === 1 ? 'heating' : 'idle',
                lastUpdated: val.status?.time ?? Date.now(),
                h1: val.settings?.prog?.h1 ?? val.setting?.prog?.h1 ?? val.h1 ?? 0,
                m1: val.settings?.prog?.m1 ?? val.setting?.prog?.m1 ?? val.m1 ?? 0,
                h2: val.settings?.prog?.h2 ?? val.setting?.prog?.h2 ?? val.h2 ?? 0,
                m2: val.settings?.prog?.m2 ?? val.setting?.prog?.m2 ?? val.m2 ?? 0
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
