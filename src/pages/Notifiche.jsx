import { useState, useEffect } from 'react'
import { ref, onValue } from 'firebase/database'
import { db } from '../firebase/config'

const ALERT_CONFIG = {
  incendio: { color: '#ef4444', icon: '🔥', label: 'Allarme Incendio', bg: 'linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(255, 255, 255, 0.78))', glow: 'rgba(239, 68, 68, 0.25)' },
  guasto_hardware: { color: '#f97316', icon: '🔧', label: 'Guasto Sensori', bg: 'linear-gradient(135deg, rgba(249, 115, 22, 0.15), rgba(255, 255, 255, 0.78))', glow: 'rgba(249, 115, 22, 0.25)' },
  guasto_stallo: { color: '#ef4444', icon: '🛑', label: 'Blocco Lettura Hardware', desc: 'Rilevato blocco lettura hardware dopo 20 letture identiche.', bg: 'linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(255, 255, 255, 0.78))', glow: 'rgba(239, 68, 68, 0.25)' },
  temp_alta: { color: '#ea580c', icon: '🥵', label: 'Temperatura Alta', bg: 'linear-gradient(135deg, rgba(234, 88, 12, 0.15), rgba(255, 255, 255, 0.78))', glow: 'rgba(234, 88, 12, 0.25)' },
  temp_bassa: { color: '#0ea5e9', icon: '🥶', label: 'Temperatura Bassa', bg: 'linear-gradient(135deg, rgba(14, 165, 233, 0.15), rgba(255, 255, 255, 0.78))', glow: 'rgba(14, 165, 233, 0.25)' },
  co_alta: { color: '#8b5cf6', icon: '💨', label: 'Livelli CO Anomali', bg: 'linear-gradient(135deg, rgba(139, 92, 246, 0.15), rgba(255, 255, 255, 0.78))', glow: 'rgba(139, 92, 246, 0.25)' },
  offline: { color: '#64748b', icon: '📡', label: 'Sistema Offline', bg: 'linear-gradient(135deg, rgba(100, 116, 139, 0.15), rgba(255, 255, 255, 0.78))', glow: 'rgba(100, 116, 139, 0.25)' },
};

const NOMINAL_CONFIG = { 
  color: '#10b981', icon: '✅', label: 'Stato Nominale', 
  bg: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(255, 255, 255, 0.78))', 
  glow: 'rgba(16, 185, 129, 0.25)' 
};

const STALE_CONFIG = { 
  color: '#94a3b8', icon: '💤', label: 'Diagnostica Offline', 
  bg: 'linear-gradient(135deg, rgba(148, 163, 184, 0.15), rgba(255, 255, 255, 0.78))', 
  glow: 'rgba(148, 163, 184, 0.2)' 
};

function AlertCard({ config, message, timestamp }) {
  return (
    <div className="glass fade-in" style={{
      padding: 'clamp(18px, 4vw, 24px)',
      background: config.bg,
      boxShadow: `0 12px 32px rgba(15, 23, 42, 0.08), 0 4px 20px ${config.glow}, inset 0 1px 2px rgba(255, 255, 255, 0.9)`,
      position: 'relative',
      overflow: 'hidden',
      transition: 'all 0.4s ease',
      display: 'flex',
      flexDirection: 'column',
      gap: 12
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{
          width: 48, height: 48, borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 24, boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
        }}>
          {config.icon}
        </div>
        <div style={{ flex: 1 }}>
          <h2 style={{
            fontSize: 14, fontWeight: 700, color: config.color,
            textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0
          }}>
            {config.label}
          </h2>
          <p style={{
            fontSize: 'clamp(15px, 4vw, 18px)',
            fontWeight: 600,
            color: '#1e293b',
            marginTop: 4,
            lineHeight: 1.3
          }}>
            {message}
          </p>
        </div>
      </div>
      {timestamp && (
        <div style={{ 
          alignSelf: 'flex-end', 
          fontSize: 11, 
          color: '#64748b',
          fontWeight: 500,
          background: 'rgba(255,255,255,0.5)',
          padding: '4px 10px',
          borderRadius: 12
        }}>
          Ultimo aggiornamento: {timestamp}
        </div>
      )}
    </div>
  )
}

export default function Notifiche() {
  const [alertData, setAlertData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const alertRef = ref(db, 'alert');
    const unsubscribe = onValue(alertRef, (snapshot) => {
      const data = snapshot.val();
      setAlertData(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Timer per aggiornare il current time e ricalcolare lo stale data
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 10000); // Aggiorna ogni 10 secondi
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: 44, height: 44, borderRadius: '50%',
            border: '3px solid rgba(59,130,246,0.2)',
            borderTopColor: '#3b82f6',
            animation: 'spin 0.8s linear infinite',
            margin: '0 auto 16px',
          }} />
          <p style={{ color: '#64748b', fontSize: 14 }}>Caricamento notifiche...</p>
        </div>
      </div>
    );
  }

  if (!alertData) {
    return (
      <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
         <h1 style={{ fontSize: 'clamp(18px, 4vw, 22px)', fontWeight: 700, color: '#1e293b' }}>
          Notifiche di Sistema
        </h1>
        <AlertCard 
          config={STALE_CONFIG} 
          message="Nessun dato disponibile dal nodo /alert." 
        />
      </div>
    )
  }

  // 1. Parsing del timestamp
  const matlabDateStr = alertData.timestamp ? alertData.timestamp.replace(" ", "T") : null;
  const matlabDate = matlabDateStr ? new Date(matlabDateStr) : null;
  
  // 2. Controllo Scadenza (Timeout a 2 minuti = 120000 ms)
  let isStale = false;
  if (matlabDate) {
    const diffMs = currentTime - matlabDate;
    if (diffMs > 120000) {
      isStale = true;
    }
  } else {
    // Se non c'è timestamp, consideriamo il dato inaffidabile
    isStale = true;
  }

  const activeAlerts = [];
  Object.keys(ALERT_CONFIG).forEach(key => {
    if (alertData[key] === true) {
      activeAlerts.push(key);
    }
  });

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <h1 style={{ fontSize: 'clamp(18px, 4vw, 22px)', fontWeight: 700, color: '#1e293b' }}>
          Notifiche di Sistema
        </h1>
        <p style={{ fontSize: 13, color: '#475569', marginTop: 2 }}>Monitoraggio diagnostica</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {isStale ? (
          <>
            <AlertCard 
              config={STALE_CONFIG} 
              message="Il server diagnostico non risponde. I dati mostrati potrebbero essere obsoleti." 
              timestamp={alertData.timestamp}
            />
            {activeAlerts.length > 0 && (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '8px 0' }}>
                  <div style={{ flex: 1, height: 1, background: 'rgba(0,0,0,0.1)' }}></div>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Notifiche recenti</span>
                  <div style={{ flex: 1, height: 1, background: 'rgba(0,0,0,0.1)' }}></div>
                </div>
                {activeAlerts.map(alertKey => (
                  <div key={`stale-${alertKey}`} style={{ opacity: 0.8, filter: 'grayscale(20%)' }}>
                    <AlertCard 
                      config={ALERT_CONFIG[alertKey]} 
                      message={alertData.messaggio || ALERT_CONFIG[alertKey].desc || ALERT_CONFIG[alertKey].label} 
                      timestamp={alertData.timestamp}
                    />
                  </div>
                ))}
              </>
            )}
          </>
        ) : activeAlerts.length > 0 ? (
          activeAlerts.map(alertKey => (
            <AlertCard 
              key={alertKey}
              config={ALERT_CONFIG[alertKey]} 
              message={alertData.messaggio || ALERT_CONFIG[alertKey].desc || ALERT_CONFIG[alertKey].label} 
              timestamp={alertData.timestamp}
            />
          ))
        ) : (
          <AlertCard 
            config={NOMINAL_CONFIG} 
            message={alertData.messaggio || "Sistema funzionante regolarmente."} 
            timestamp={alertData.timestamp}
          />
        )}
      </div>
    </div>
  );
}
