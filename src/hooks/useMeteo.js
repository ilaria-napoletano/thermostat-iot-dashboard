import { db, firestoreDb } from '../firebase/config';
import { useState, useEffect } from 'react'

const USE_MOCK = !import.meta.env.VITE_FIREBASE_API_KEY



// Genera mock data per il meteo di Bari
function generateMeteoMock() {
  const now = new Date()

  return {
    current_temperature: 15.0,
    current_humidity: 80,
    wind_speed: 12.4,
    meteo_status_text: "Soleggiato",
    meteo_status_icon: "☀️",
    last_update: now.getTime()
  }
}

export function useMeteo() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (USE_MOCK) {
      const mockData = generateMeteoMock()
      setData({
        temperature: mockData.current_temperature,
        humidity: mockData.current_humidity,
        windSpeed: mockData.wind_speed,
        weatherText: mockData.meteo_status_text,
        weatherIcon: mockData.meteo_status_icon,
        lastUpdated: mockData.last_update
      })
      
      setLoading(false)
      return
    }

    let unsubscribe = null

    async function connect() {
      try {
        const { doc, onSnapshot } = await import('firebase/firestore')
        const db = firestoreDb
        const docRef = doc(db, 'thermostat_data', 'current_state')
        
        unsubscribe = onSnapshot(docRef, (docSnap) => {
          try {
            if (docSnap.exists()) {
              const val = docSnap.data()
              
              let lastUpdatedMs = Date.now()
              if (val.last_update) {
                lastUpdatedMs = typeof val.last_update.toMillis === 'function' 
                  ? val.last_update.toMillis() 
                  : (val.last_update.seconds ? val.last_update.seconds * 1000 : Date.now())
              }
              
              setData({
                temperature: val.current_temperature ?? null,
                humidity: val.current_humidity ?? null,
                windSpeed: val.wind_speed ?? null,
                weatherText: val.meteo_status_text ?? null,
                weatherIcon: val.meteo_status_icon ?? null,
                lastUpdated: lastUpdatedMs
              })
            } else {
              setError("Il documento 'current_state' non esiste nel database.")
            }
          } catch (e) {
            setError("Errore di elaborazione dati: " + e.message)
          } finally {
            setLoading(false)
          }
        }, (err) => {
          setError(err.message)
          setLoading(false)
        })

      } catch (err) {
        setError('Errore configurazione Firestore')
        setLoading(false)
      }
    }

    connect()
    return () => unsubscribe?.()
  }, [])

  return { data, loading, error, isMock: USE_MOCK }
}
