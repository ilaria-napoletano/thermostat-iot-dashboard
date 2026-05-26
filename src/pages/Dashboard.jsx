import { useState, useRef, useEffect, useCallback } from 'react'
import { useThermostat } from '../hooks/useThermostat'
import { useMeteo } from '../hooks/useMeteo'
import { useAuth } from '../hooks/useAuth'
import { useNavigate } from 'react-router-dom'

const modeInfo = {
  heating: { label: 'Riscaldamento attivo', color: '#fb923c', bg: 'rgba(251,146,60,0.1)', border: 'rgba(251,146,60,0.25)' },
  cooling: { label: 'Raffreddamento attivo', color: '#38bdf8', bg: 'rgba(56,189,248,0.1)', border: 'rgba(56,189,248,0.25)' },
  idle:    { label: 'In standby', color: '#94a3b8', bg: 'rgba(148,163,184,0.1)', border: 'rgba(148,163,184,0.2)' },
}

const weatherThemes = {
  Soleggiato: {
    bg: 'linear-gradient(135deg, rgba(253, 224, 71, 0.26), rgba(255, 255, 255, 0.78))',
    glow: 'rgba(253, 224, 71, 0.25)',
    iconColor: 'rgba(217, 119, 6, 0.38)',
    accent: '#d97706',
    watermark: (
      <svg width="140" height="140" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="4" fill="rgba(253, 224, 71, 0.25)" />
        <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
      </svg>
    )
  },
  Sereno: {
    bg: 'linear-gradient(135deg, rgba(15, 23, 42, 0.9), rgba(30, 41, 59, 0.95))',
    glow: 'rgba(15, 23, 42, 0.35)',
    iconColor: 'rgba(251, 191, 36, 0.32)',
    accent: '#facc15',
    isDark: true,
    watermark: (
      <svg width="140" height="140" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" fill="rgba(251, 191, 36, 0.15)" />
      </svg>
    )
  },
  Variabile: {
    bg: 'linear-gradient(135deg, rgba(253, 224, 71, 0.18), rgba(148, 163, 184, 0.12), rgba(255, 255, 255, 0.78))',
    glow: 'rgba(253, 224, 71, 0.2)',
    iconColor: 'rgba(245, 158, 11, 0.35)',
    accent: '#d97706',
    watermark: (
      <svg width="140" height="140" viewBox="0 0 24 24" fill="none" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
        {/* Sun peeking out - Warm Amber/Yellow */}
        <circle cx="12" cy="10" r="3" stroke="#f59e0b" fill="rgba(253, 224, 71, 0.35)" />
        <path d="M12 5V3M7.05 7.05L5.64 5.64M16.95 7.05l1.41-1.41M19 10h2M5 10h2" stroke="#f59e0b" />
        {/* Fluffy Cloud in front - Slate Gray / Soft White */}
        <path 
          d="M17.5 19A3.5 3.5 0 0 0 21 15.5c0-2.79-2.54-4.5-5-4.5-.47 0-.89.09-1.25.26A5 5 0 0 0 5 13c0 .59.08 1.16.22 1.7A3.5 3.5 0 0 0 3 18" 
          stroke="rgba(100, 116, 139, 0.45)" 
          fill="rgba(255, 255, 255, 0.4)" 
        />
      </svg>
    )
  },
  Nuvoloso: {
    bg: 'linear-gradient(135deg, rgba(148, 163, 184, 0.15), rgba(255, 255, 255, 0.78))',
    glow: 'rgba(148, 163, 184, 0.2)',
    iconColor: 'rgba(148, 163, 184, 0.22)',
    accent: '#475569',
    watermark: (
      <svg width="140" height="140" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17.5 19A3.5 3.5 0 0 0 21 15.5c0-2.79-2.54-4.5-5-4.5-.47 0-.89.09-1.25.26A5 5 0 0 0 5 13c0 .59.08 1.16.22 1.7A3.5 3.5 0 0 0 3 18" fill="rgba(148, 163, 184, 0.05)" />
      </svg>
    )
  },
  Piovoso: {
    bg: 'linear-gradient(135deg, rgba(56, 189, 248, 0.15), rgba(255, 255, 255, 0.78))',
    glow: 'rgba(56, 189, 248, 0.25)',
    iconColor: 'rgba(56, 189, 248, 0.22)',
    accent: '#0284c7',
    watermark: (
      <svg width="140" height="140" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17.5 19A3.5 3.5 0 0 0 21 15.5c0-2.79-2.54-4.5-5-4.5-.47 0-.89.09-1.25.26A5 5 0 0 0 5 13c0 .59.08 1.16.22 1.7A3.5 3.5 0 0 0 3 18" fill="rgba(56, 189, 248, 0.05)" />
        <path d="M8 19v2M12 20v2M16 19v2" />
      </svg>
    )
  },
  Temporale: {
    bg: 'linear-gradient(135deg, rgba(139, 92, 246, 0.15), rgba(255, 255, 255, 0.78))',
    glow: 'rgba(139, 92, 246, 0.25)',
    iconColor: 'rgba(139, 92, 246, 0.25)',
    accent: '#7c3aed',
    watermark: (
      <svg width="140" height="140" viewBox="0 0 24 24" fill="none" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
        {/* Storm Cloud - Elegant stormy purple/gray */}
        <path 
          d="M17.5 19A3.5 3.5 0 0 0 21 15.5c0-2.79-2.54-4.5-5-4.5-.47 0-.89.09-1.25.26A5 5 0 0 0 5 13c0 .59.08 1.16.22 1.7A3.5 3.5 0 0 0 3 18" 
          stroke="rgba(124, 58, 237, 0.5)" 
          fill="rgba(139, 92, 246, 0.15)" 
        />
        {/* Lightning Bolt - Bright Amber/Yellow */}
        <path 
          d="m13 18-3 4h3l-2 3 5-5h-3z" 
          stroke="#f59e0b" 
          fill="rgba(245, 158, 11, 0.35)" 
          strokeWidth="1.4" 
        />
        {/* Rain Drops - Sky Blue */}
        <path 
          d="M7 21l-1.5 3M11 22l-1.5 3M16 21l-1.5 3" 
          stroke="#38bdf8" 
          strokeWidth="1.4" 
        />
      </svg>
    )
  },
  Nevoso: {
    bg: 'linear-gradient(135deg, rgba(224, 242, 254, 0.2), rgba(255, 255, 255, 0.78))',
    glow: 'rgba(224, 242, 254, 0.3)',
    iconColor: 'rgba(186, 230, 253, 0.25)',
    accent: '#0369a1',
    watermark: (
      <svg width="140" height="140" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2v20M17 5L7 19M5 5l14 14M4 12h16M19 8l-3 4 3 4M5 8l3 4-3 4" />
      </svg>
    )
  },
  Nebbia: {
    bg: 'linear-gradient(135deg, rgba(148, 163, 184, 0.15), rgba(255, 255, 255, 0.78))',
    glow: 'rgba(148, 163, 184, 0.2)',
    iconColor: 'rgba(148, 163, 184, 0.22)',
    accent: '#475569',
    watermark: (
      <svg width="140" height="140" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 6h16M4 10h16M4 14h16M4 18h16" />
      </svg>
    )
  },
  Default: {
    bg: 'linear-gradient(135deg, rgba(255, 255, 255, 0.45), rgba(255, 255, 255, 0.78))',
    glow: 'rgba(255, 255, 255, 0.25)',
    iconColor: 'rgba(148, 163, 184, 0.15)',
    accent: '#0284c7',
    watermark: (
      <svg width="140" height="140" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
      </svg>
    )
  }
}

const getGreeting = (gender) => {
  if (gender === 'f') return 'Bentornata';
  if (gender === 'x') return 'Bentornatə';
  return 'Bentornato';
};

export default function Dashboard() {
  const { data, loading, error, isMock } = useThermostat()
  const { data: meteoData, loading: meteoLoading, error: meteoError } = useMeteo()
  const { currentUser } = useAuth()
  const navigate = useNavigate()

  const handleTargetRelease = useCallback(async (newTarget) => {
    if (!currentUser) {
      alert("Effettua l'accesso per poter modificare la temperatura.");
      navigate("/settings");
      return;
    }
    if (isMock) return;
    try {
      const { ref, set } = await import('firebase/database');
      const { db } = await import('../firebase/config');
      const targetRef = ref(db, 'termostato1/config/soglia');
      await set(targetRef, newTarget);
    } catch (err) {
      console.error('Errore durante il salvataggio:', err);
    }
  }, [isMock, currentUser, navigate]);

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{
          width: 44, height: 44, borderRadius: '50%',
          border: '3px solid rgba(59,130,246,0.2)',
          borderTopColor: '#3b82f6',
          animation: 'spin 0.8s linear infinite',
          margin: '0 auto 16px',
        }} />
        <p style={{ color: '#64748b', fontSize: 14 }}>Connessione in corso...</p>
      </div>
    </div>
  )

  if (error) return (
    <div style={{
      background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)',
      borderRadius: 16, padding: 24, textAlign: 'center', color: '#f87171',
    }}>
      <p style={{ fontSize: 16, fontWeight: 600 }}>Errore di connessione</p>
      <p style={{ fontSize: 13, marginTop: 6, opacity: 0.7 }}>{error}</p>
    </div>
  )

  const temp = data?.temperature ?? null
  const humidity = data?.humidity ?? null
  const target = data?.target ?? null
  const mode = data?.mode ?? 'idle'
  const currentMode = modeInfo[mode] ?? modeInfo.idle

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {isMock && (
        <div style={{
          background: 'rgba(234,179,8,0.08)', border: '1px solid rgba(234,179,8,0.2)',
          borderRadius: 12, padding: '10px 16px', color: '#facc15',
          fontSize: 13, textAlign: 'center',
        }}>
          Modalità demo — Firebase non connesso
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: 'clamp(18px, 4vw, 22px)', fontWeight: 700, color: '#1e293b' }}>
            {currentUser ? `${getGreeting(currentUser.gender)}, ${currentUser.userName}!` : 'Benvenuto utente!'}
          </h1>
          <p style={{ fontSize: 13, color: '#475569', marginTop: 2 }}>Monitoraggio in tempo reale</p>
        </div>
      </div>

      {/* Circular Slider Area */}
      <CircularSlider 
        currentTemp={temp} 
        initialTarget={target} 
        onTargetRelease={handleTargetRelease}
        currentMode={currentMode}
      />

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 12 }}>
        <StatCard label="Umidità interna" value={humidity !== null ? `${humidity}%` : '--'} sub="Umidità relativa in casa" icon="💧" accent="#0284c7" />
      </div>

      {/* Unified Meteo Card */}
      <MeteoCard data={meteoData} error={meteoError} />

      {data?.lastUpdated && (
        <p style={{ textAlign: 'center', fontSize: 12, color: '#334155' }}>
          Termostato aggiornato: {new Date(data.lastUpdated).toLocaleTimeString('it-IT')}
        </p>
      )}
    </div>
  )
}

function CircularSlider({ currentTemp, initialTarget, onTargetRelease, currentMode }) {
  const [target, setTarget] = useState(initialTarget || 21);
  const svgRef = useRef(null);

  useEffect(() => {
    if (initialTarget !== null && initialTarget !== undefined) {
      setTarget(initialTarget);
    }
  }, [initialTarget]);

  const min = 10;
  const max = 30;

  const calculateValue = (clientX, clientY) => {
    if (!svgRef.current) return target;
    const rect = svgRef.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height * (150 / 260);
    const dx = clientX - cx;
    const dy = clientY - cy;

    let angle = Math.atan2(dy, dx) * (180 / Math.PI);
    angle = (angle + 360) % 360;

    let shiftedAngle = angle;
    if (shiftedAngle < 90) shiftedAngle += 360; 
    
    if (shiftedAngle < 135) shiftedAngle = 135;
    if (shiftedAngle > 405) shiftedAngle = 405;
    
    const percentage = (shiftedAngle - 135) / 270;
    const val = min + (max - min) * percentage;
    return Math.round(val * 2) / 2;
  };

  const handlePointerDown = (e) => {
    e.target.setPointerCapture(e.pointerId);
    const newVal = calculateValue(e.clientX, e.clientY);
    setTarget(newVal);
  };

  const handlePointerMove = (e) => {
    if (e.buttons > 0) {
      const newVal = calculateValue(e.clientX, e.clientY);
      if (newVal !== target) {
        setTarget(newVal);
      }
    }
  };

  const handlePointerUp = (e) => {
    e.target.releasePointerCapture(e.pointerId);
    if (onTargetRelease && target !== initialTarget) {
      onTargetRelease(target);
    }
  };

  // SVG Paths
  const radius = 120;
  const center = 150;
  const getPoint = (angleDeg) => {
    const rad = angleDeg * Math.PI / 180;
    return { x: center + radius * Math.cos(rad), y: center + radius * Math.sin(rad) };
  };

  const startAngle = 135;
  const endAngle = 405;
  const startPt = getPoint(startAngle);
  const endPt = getPoint(endAngle);
  const trackPath = `M ${startPt.x} ${startPt.y} A ${radius} ${radius} 0 1 1 ${endPt.x} ${endPt.y}`;

  const valAngle = 135 + ((target - min) / (max - min)) * 270;
  const valPt = getPoint(valAngle);
  const largeArcFlag = valAngle - startAngle > 180 ? 1 : 0;
  const progressPath = valAngle === startAngle ? "" : `M ${startPt.x} ${startPt.y} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${valPt.x} ${valPt.y}`;

  return (
    <div className="glass glow-blue" style={{
      padding: 'clamp(20px, 5vw, 36px) clamp(20px, 5vw, 36px) clamp(12px, 3vw, 16px)',
      textAlign: 'center',
      background: 'rgba(255, 255, 255, 0.45)',
      position: 'relative',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      flexDirection: 'column',
    }}>
      <p style={{
        fontSize: 11, fontWeight: 700, letterSpacing: '0.12em',
        color: '#64748b', textTransform: 'uppercase', marginBottom: 14,
        alignSelf: 'center',
        width: '100%'
      }}>
        Regolazione Termostato
      </p>

      <div style={{ position: 'relative', width: '100%', maxWidth: '300px', margin: '0 auto' }}>
        <svg
          ref={svgRef}
          viewBox="0 0 300 260"
          style={{ width: '100%', height: 'auto', touchAction: 'none', overflow: 'visible', display: 'block' }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
        >
          {/* Track */}
          <path d={trackPath} fill="none" stroke="rgba(0,0,0,0.05)" strokeWidth="18" strokeLinecap="round" />
          
          {/* Progress */}
          {progressPath && (
            <path d={progressPath} fill="none" stroke="#0ea5e9" strokeWidth="18" strokeLinecap="round" 
              style={{ transition: 'stroke-dasharray 0.1s' }} />
          )}
          
          {/* Knob */}
          <circle cx={valPt.x} cy={valPt.y} r="14" fill="#fff" stroke="#0284c7" strokeWidth="4" 
            style={{ cursor: 'grab', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' }} />
        </svg>

        <div style={{
          position: 'absolute',
          top: '57.7%', left: '50%',
          transform: 'translate(-50%, -50%)',
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          pointerEvents: 'none',
        }}>
          {/* Ambient Temperature */}
          <div style={{
            fontSize: 'clamp(48px, 14vw, 68px)',
            fontWeight: 900, lineHeight: 1,
            letterSpacing: '-2px', color: '#0f172a',
            fontFamily: 'Inter, sans-serif'
          }}>
            {currentTemp !== null ? currentTemp.toFixed(1) : '--'}
          </div>

          {/* Target & Status */}
          <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 14, color: '#475569', fontWeight: 400 }}>
              Target: <strong style={{ color: '#0ea5e9', fontWeight: 600 }}>{target.toFixed(1)}°C</strong>
            </span>
            <span style={{
              fontSize: 12, fontWeight: 400,
              color: currentMode.color, background: currentMode.bg,
              padding: '4px 10px', borderRadius: 12, border: `1px solid ${currentMode.border}`
            }}>
              {currentMode.label}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({ label, value, sub, icon, accent }) {
  return (
    <div className="glass" style={{ padding: 'clamp(14px, 4vw, 20px)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
        <p style={{
          fontSize: 11, fontWeight: 600, color: '#475569',
          textTransform: 'uppercase', letterSpacing: '0.08em',
        }}>{label}</p>
        <span style={{ fontSize: 18 }}>{icon}</span>
      </div>
      <p style={{
        fontSize: 'clamp(24px, 7vw, 32px)',
        fontWeight: 800, color: accent,
        letterSpacing: '-1px', lineHeight: 1,
      }}>{value}</p>
      <p style={{ fontSize: 11, color: '#334155', marginTop: 5 }}>{sub}</p>
    </div>
  )
}

function MeteoCard({ data, error }) {
  if (error) {
    return (
      <div style={{
        background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)',
        borderRadius: 12, padding: '12px 16px', color: '#f87171', fontSize: 13, textAlign: 'center'
      }}>
        Errore Meteo Bari: {error}
      </div>
    )
  }

  const temp = data?.temperature ?? null
  const humidity = data?.humidity ?? null
  const windSpeed = data?.windSpeed ?? null
  const weatherText = data?.weatherText ?? "Nuvoloso"
  const weatherIcon = data?.weatherIcon ?? "☁️"
  const lastUpdated = data?.lastUpdated ?? null

  const currentHour = new Date().getHours()
  const isNight = currentHour >= 20 || currentHour < 6

  let displayWeatherText = weatherText
  let displayWeatherIcon = weatherIcon

  if (weatherText === "Soleggiato" && isNight) {
    displayWeatherText = "Sereno"
    displayWeatherIcon = "🌙"
  }

  const theme = weatherThemes[displayWeatherText] || weatherThemes.Default

  return (
    <div className="glass" style={{
      padding: 'clamp(18px, 4vw, 24px)',
      background: theme.bg,
      boxShadow: `0 12px 32px rgba(15, 23, 42, 0.08), 0 4px 20px ${theme.glow}, inset 0 1px 2px rgba(255, 255, 255, 0.9)`,
      position: 'relative',
      overflow: 'hidden',
      transition: 'all 0.4s ease',
    }}>
      {/* Background Watermark SVG */}
      <div style={{
        position: 'absolute',
        right: '-15px',
        bottom: '-8px',
        color: theme.iconColor,
        pointerEvents: 'none',
        transform: 'rotate(-5deg)',
      }}>
        {theme.watermark}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, position: 'relative', zIndex: 1 }}>
        <div>
          <h2 style={{
            fontSize: 11, fontWeight: 700, color: theme.isDark ? '#94a3b8' : '#475569',
            textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0
          }}>
            Meteo a Bari
          </h2>
          <p style={{
            fontSize: 'clamp(13px, 3.5vw, 15px)',
            fontWeight: 600,
            color: theme.isDark ? '#f8fafc' : '#1e293b',
            marginTop: 4,
            display: 'flex',
            alignItems: 'center',
            gap: 6
          }}>
            Oggi è {displayWeatherText.toLowerCase()} <span style={{ fontSize: '1.2em' }}>{displayWeatherIcon}</span>
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginTop: 4 }}>
          {/* Temperature */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <span style={{ fontSize: 10, fontWeight: 600, color: theme.isDark ? '#94a3b8' : '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Temp.</span>
            <span style={{ fontSize: 'clamp(18px, 4.5vw, 24px)', fontWeight: 800, color: theme.isDark ? '#f8fafc' : '#1e293b' }}>
              {temp !== null ? `${temp.toFixed(1)}°C` : '--'}
            </span>
          </div>

          {/* Humidity */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <span style={{ fontSize: 10, fontWeight: 600, color: theme.isDark ? '#94a3b8' : '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Umidità</span>
            <span style={{ fontSize: 'clamp(18px, 4.5vw, 24px)', fontWeight: 800, color: theme.isDark ? '#38bdf8' : '#0284c7' }}>
              {humidity !== null ? `${humidity}%` : '--'}
            </span>
          </div>

          {/* Wind Speed */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <span style={{ fontSize: 10, fontWeight: 600, color: theme.isDark ? '#94a3b8' : '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Vento</span>
            <span style={{ fontSize: 'clamp(18px, 4.5vw, 24px)', fontWeight: 800, color: theme.isDark ? '#34d399' : '#059669' }}>
              {windSpeed !== null ? `${windSpeed.toFixed(1)}` : '--'}
              <span style={{ fontSize: 10, fontWeight: 500, color: theme.isDark ? '#94a3b8' : '#64748b', marginLeft: 2 }}>km/h</span>
            </span>
          </div>
        </div>

        {lastUpdated && (
          <p style={{ fontSize: 10, color: theme.isDark ? '#94a3b8' : '#64748b', marginTop: 4, marginBottom: 0 }}>
            Ultimo aggiornamento alle {new Date(lastUpdated).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}
          </p>
        )}
      </div>
    </div>
  )
}
