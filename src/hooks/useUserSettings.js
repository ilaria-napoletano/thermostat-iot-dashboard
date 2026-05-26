import { useState, useEffect } from 'react'

const USE_MOCK = !import.meta.env.VITE_FIREBASE_API_KEY

let firestoreInstance = null

async function getFirestoreDb() {
  if (firestoreInstance) return firestoreInstance
  const { firestoreDb } = await import('../firebase/config')
  firestoreInstance = firestoreDb
  return firestoreInstance
}

export function useUserSettings() {
  const [settings, setSettings] = useState({ userName: 'Utente' })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (USE_MOCK) {
      const savedName = localStorage.getItem('mockUserName')
      if (savedName) {
        setSettings({ userName: savedName })
      }
      setLoading(false)
      return
    }

    let unsubscribe = null

    async function connect() {
      try {
        const { doc, onSnapshot } = await import('firebase/firestore')
        const db = await getFirestoreDb()
        const docRef = doc(db, 'user_settings', 'preferences')
        
        unsubscribe = onSnapshot(docRef, (docSnap) => {
          if (docSnap.exists()) {
            const val = docSnap.data()
            setSettings({
              userName: val.userName || 'Utente'
            })
          } else {
            // Se il documento non esiste, usiamo il default
            setSettings({ userName: 'Utente' })
          }
          setLoading(false)
        }, (err) => {
          console.error("Firestore error in useUserSettings:", err)
          setError(err.message)
          setLoading(false)
        })

      } catch (err) {
        console.error("Configurazione Firestore error in useUserSettings:", err)
        setError('Errore configurazione Firestore')
        setLoading(false)
      }
    }

    connect()
    return () => unsubscribe?.()
  }, [])

  const updateUserName = async (newName) => {
    if (USE_MOCK) {
      localStorage.setItem('mockUserName', newName)
      setSettings({ userName: newName })
      return
    }

    try {
      const { doc, setDoc } = await import('firebase/firestore')
      const db = await getFirestoreDb()
      const docRef = doc(db, 'user_settings', 'preferences')
      await setDoc(docRef, { userName: newName }, { merge: true })
    } catch (err) {
      console.error("Errore durante l'aggiornamento in Firestore:", err)
      throw err
    }
  }

  return { settings, loading, error, isMock: USE_MOCK, updateUserName }
}
