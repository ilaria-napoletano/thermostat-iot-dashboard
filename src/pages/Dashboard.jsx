import { useState, useRef, useEffect, useCallback } from 'react'
import { useThermostat } from '../hooks/useThermostat'
import { useMeteo } from '../hooks/useMeteo'

const modeInfo = {
  heating: { label: 'Riscaldamento attivo', color: '#fb923c', bg: 'rgba(251,146,60,0.1)', border: 'rgba(251,146,60,0.25)' },
  cooling: { label: 'Raffreddamento attivo', color: '#38bdf8', bg: 'rgba(56,189,248,0.1)', border: 'rgba(56,189,248,0.25)' },
  idle:    { label: 'In standby', color: '#94a3b8', bg: 'rgba(148,163,184,0.1)', border: 'rgba(148,163,184,0.2)' },
}

export default function Dashboard() {
  const { data, loading, error, isMock } = useThermostat()
  const { data: meteoData, loading: meteoLoading, error: meteoError } = useMeteo()

  const handleTargetRelease = useCallback(async (newTarget) => {
    if (isMock) return;
    try {
      const { ref, set } = await import('firebase/database');
      const { db } = await import('../firebase/config');
      const targetRef = ref(db, 'termostato1/config/soglia');
      await set(targetRef, newTarget);
    } catch (err) {
      console.error('Errore durante il salvataggio:', err);
    }
  }, [isMock]);

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
            Dashboard
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
        <StatCard label="Umidità" value={humidity !== null ? `${humidity}%` : '--'} sub="Umidità relativa" icon="💧" accent="#0284c7" />
      </div>

      {/* Meteo Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <StatCard 
          label="Temp. Bari" 
          value={meteoData?.temperature != null ? `${meteoData.temperature.toFixed(1)}°C` : '--'} 
          sub={meteoData?.lastUpdated ? `Aggiornato alle ${new Date(meteoData.lastUpdated).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}` : 'In attesa...'} 
          icon="🌡️" 
          accent="#d97706" 
        />
        <StatCard 
          label="Umidità Bari" 
          value={meteoData?.humidity != null ? `${meteoData.humidity}%` : '--'} 
          sub={meteoData?.lastUpdated ? `Aggiornato alle ${new Date(meteoData.lastUpdated).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}` : 'In attesa...'} 
          icon="☁️" 
          accent="#0284c7" 
        />
      </div>

      {meteoError && (
        <div style={{
          background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)',
          borderRadius: 12, padding: '12px 16px', color: '#f87171', fontSize: 13, textAlign: 'center'
        }}>
          Errore Meteo: {meteoError}
        </div>
      )}

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
    const cy = rect.top + rect.height / 2;
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
      padding: 'clamp(24px, 6vw, 44px) clamp(20px, 5vw, 36px)',
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
        Regolazione Clima
      </p>

      <div style={{ position: 'relative', width: '100%', maxWidth: '300px', margin: '0 auto' }}>
        <svg
          ref={svgRef}
          viewBox="0 0 300 300"
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
          top: '50%', left: '50%',
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
