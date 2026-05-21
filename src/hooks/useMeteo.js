import { useState, useEffect } from 'react'

const USE_MOCK = !import.meta.env.VITE_FIREBASE_API_KEY

let firestoreInstance = null

async function getFirestoreDb() {
  if (firestoreInstance) return firestoreInstance
  const { firestoreDb } = await import('../firebase/config')
  firestoreInstance = firestoreDb
  return firestoreInstance
}

// Genera mock data per il meteo di Bari
function generateMeteoMock() {
  const times = []
  const temps = []
  const hums = []
  const now = new Date()
  
  for (let i = 24; i >= 0; i--) {
    const t = new Date(now.getTime() - i * 60 * 60 * 1000)
    times.push(t.toISOString().substring(0, 16))
    temps.push(+(15 + Math.sin(i / 4) * 5).toFixed(1))
    hums.push(Math.round(60 + Math.cos(i / 4) * 20))
  }

  return {
    current_temperature: temps[temps.length - 1],
    current_humidity: hums[hums.length - 1],
    wind_speed: 12.4,
    meteo_status_text: "Soleggiato",
    meteo_status_icon: "☀️",
    history_24h: {
      times: times,
      temperatures: temps,
      humidities: hums
    },
    last_update: now.getTime()
  }
}

export function useMeteo() {
  const [data, setData] = useState(null)
  const [history, setHistory] = useState([])
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
      
      const formattedHistory = mockData.history_24h.times.map((timeStr, index) => {
        const timeObj = new Date(timeStr)
        return {
          time: `${timeObj.getHours().toString().padStart(2, '0')}:00`,
          temperature: mockData.history_24h.temperatures[index],
          humidity: mockData.history_24h.humidities[index],
        }
      })
      setHistory(formattedHistory)
      setLoading(false)
      return
    }

    let unsubscribe = null

    async function connect() {
      try {
        const { doc, onSnapshot } = await import('firebase/firestore')
        const db = await getFirestoreDb()
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

              // Format history for Recharts
              if (val.history_24h && val.history_24h.times) {
                const formattedHistory = val.history_24h.times.map((timeStr, index) => {
                  const timeObj = new Date(timeStr)
                  return {
                    time: `${timeObj.getHours().toString().padStart(2, '0')}:00`,
                    temperature: val.history_24h.temperatures[index],
                    humidity: val.history_24h.humidities[index],
                  }
                })
                setHistory(formattedHistory)
              }
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

  return { data, history, loading, error, isMock: USE_MOCK }
}
