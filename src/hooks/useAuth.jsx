import { createContext, useContext, useState, useEffect } from 'react';

const USE_MOCK = !import.meta.env.VITE_FIREBASE_API_KEY;

let firestoreInstance = null;
async function getFirestoreDb() {
  if (firestoreInstance) return firestoreInstance;
  const { firestoreDb } = await import('../firebase/config');
  firestoreInstance = firestoreDb;
  return firestoreInstance;
}

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('currentUser');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (e) {
      console.error('Errore nel recupero sessione:', e);
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    if (USE_MOCK) {
      if (username === 'test' && password === 'test') {
        const user = { username: 'test', userName: 'Utente Test', gender: 'm' };
        setCurrentUser(user);
        localStorage.setItem('currentUser', JSON.stringify(user));
        return user;
      }
      throw new Error('Credenziali non valide. (Mock: usa test/test)');
    }

    const { doc, getDoc } = await import('firebase/firestore');
    const db = await getFirestoreDb();
    
    // Controlliamo il documento con ID = username nella collezione users
    const docRef = doc(db, 'users', username);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      if (data.password === password) {
        const user = { 
          username, 
          userName: data.userName || username, 
          gender: data.gender || 'm' 
        };
        setCurrentUser(user);
        localStorage.setItem('currentUser', JSON.stringify(user));
        return user;
      } else {
        throw new Error('Password errata');
      }
    } else {
      throw new Error('Utente non trovato');
    }
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
  };

  const updateProfile = async (updates) => {
    if (!currentUser) return;
    
    const newUser = { ...currentUser, ...updates };
    setCurrentUser(newUser);
    localStorage.setItem('currentUser', JSON.stringify(newUser));

    if (!USE_MOCK) {
      const { doc, setDoc } = await import('firebase/firestore');
      const db = await getFirestoreDb();
      const docRef = doc(db, 'users', currentUser.username);
      await setDoc(docRef, updates, { merge: true });
    }
  };

  return (
    <AuthContext.Provider value={{ currentUser, login, logout, loading, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
