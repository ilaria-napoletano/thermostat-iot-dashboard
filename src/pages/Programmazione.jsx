import { useState, useRef, useEffect } from 'react'
import { useThermostat } from '../hooks/useThermostat'
import { useAuth } from '../hooks/useAuth'

const glass = {
  background: 'rgba(255, 255, 255, 0.65)',
  backdropFilter: 'blur(16px)',
  border: '1px solid rgba(255, 255, 255, 0.8)',
  borderRadius: 20,
  boxShadow: '0 8px 32px rgba(15, 23, 42, 0.04)',
}

const routines = [
  {
    id: 'feriali',
    name: 'Feriali',
    emoji: '🏠',
    colorFrom: 'rgba(250, 204, 21, 0.25)',
    colorTo: 'rgba(250, 204, 21, 0.05)',
    onTime: { h: 17, m: 0 },
    offTime: { h: 22, m: 30 },
    target: 20,
    desc: "\"Il comfort al tuo rientro\"\n\nPensata per chi passa la giornata fuori casa per lavoro o studio. Il riscaldamento si attiva nel tardo pomeriggio per farti trovare la casa calda al tuo rientro e si spegne prima di andare a dormire, ottimizzando i consumi nelle ore in cui la casa è vuota o sei sotto le coperte."
  },
  {
    id: 'festivo',
    name: 'Festivo',
    emoji: '🛋️',
    colorFrom: 'rgba(168, 85, 247, 0.25)',
    colorTo: 'rgba(168, 85, 247, 0.05)',
    onTime: { h: 10, m: 0 },
    offTime: { h: 23, m: 0 },
    target: 19.5,
    desc: "\"Il calore di casa nel weekend\"\n\nDedicata alle giornate di relax in cui la casa è più vissuta. Un'unica grande finestra di accensione che copre la tarda mattina, il pomeriggio e la sera a una temperatura bilanciata. Massimo comfort per tutta la famiglia, senza sprechi nelle ore notturne."
  },
  {
    id: 'eco',
    name: 'ECO',
    emoji: '🌱',
    colorFrom: 'rgba(34, 197, 94, 0.25)',
    colorTo: 'rgba(34, 197, 94, 0.05)',
    onTime: { h: 18, m: 30 },
    offTime: { h: 21, m: 30 },
    target: 18.5,
    desc: "\"Consumi intelligenti, massimo risparmio\"\n\nLa scelta ideale per chi vuole alleggerire la bolletta o per i periodi meno freddi. Questa routine stringe la finestra di accensione all'essenziale (poche ore la sera) e riduce la temperatura di un grado e mezzo. Indossa un maglione leggero e aiuta l'ambiente e il portafoglio."
  },
  {
    id: 'vacanza',
    name: 'Vacanza',
    emoji: '✈️',
    colorFrom: 'rgba(249, 115, 22, 0.25)',
    colorTo: 'rgba(249, 115, 22, 0.05)',
    onTime: { h: 0, m: 0 },
    offTime: { h: 23, m: 59 },
    target: 10,
    desc: "\"Protezione casa e zero sprechi\"\n\nAttiva questa modalità quando parti per i viaggi o ti assenti per molti giorni. Il termostato rimarrà in modalità \"antigelo\" costante (10°C): la caldaia resterà spenta per tutto il tempo, attivandosi solo in caso di freddo estremo per evitare il congelamento delle tubature."
  }
];

export default function Programmazione() {
  const { data, loading, isMock } = useThermostat()
  const { currentUser } = useAuth()
  
  const handleTimeChange = async (type, h, m) => {
    if (!currentUser || isMock) return;
    try {
      const { ref, update } = await import('firebase/database');
      const { db } = await import('../firebase/config');
      const targetRef = ref(db, 'termostato/settings/prog');
      if (type === 'on') {
        await update(targetRef, { h1: h, m1: m });
      } else {
        await update(targetRef, { h2: h, m2: m });
      }
    } catch (err) {
      console.error('Errore salvataggio:', err);
    }
  }

  const handleModeChange = async (newMode) => {
    if (!currentUser) return;
    if (isMock) {
      alert("Sei in modalità demo, la modalità non verrà salvata.");
      return;
    }
    try {
      const { ref, update } = await import('firebase/database');
      const { db } = await import('../firebase/config');
      await update(ref(db, 'termostato/settings'), { mode: newMode });
    } catch (err) {
      console.error('Errore cambio modalità:', err);
    }
  }

  const applyRoutine = async (routine) => {
    if (!currentUser) return;
    if (isMock) {
      alert("Sei in modalità demo, le routine non verranno salvate.");
      return;
    }
    try {
      const { ref, update } = await import('firebase/database');
      const { db } = await import('../firebase/config');
      const updates = {
        'termostato/settings/prog/h1': routine.onTime.h,
        'termostato/settings/prog/m1': routine.onTime.m,
        'termostato/settings/prog/h2': routine.offTime.h,
        'termostato/settings/prog/m2': routine.offTime.m,
        'termostato/settings/set_temp': routine.target
      };
      await update(ref(db), updates);
      alert(`Routine "${routine.name}" applicata con successo!`);
    } catch (err) {
      console.error('Errore routine:', err);
    }
  }

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
      <p style={{ color: '#64748b' }}>Caricamento programmazione...</p>
    </div>
  );

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: 'clamp(18px, 4vw, 22px)', fontWeight: 700, color: '#1e293b' }}>
          Programmazione
        </h1>
        <p style={{ fontSize: 13, color: '#475569', marginTop: 2 }}>Imposta gli orari di accensione</p>
      </div>

      {!currentUser && (
        <div style={{
          background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)',
          borderRadius: 12, padding: '10px 16px', color: '#ef4444', fontSize: 13,
        }}>
          Accedi per modificare la programmazione e le routine.
        </div>
      )}

      {/* Mode Selector */}
      <div style={{ ...glass, padding: 16, display: 'flex', gap: 12, justifyContent: 'space-between', flexWrap: 'wrap' }}>
        {[
          { id: 1, label: 'Acceso', color: '#10b981' },
          { id: 0, label: 'Spento', color: '#ef4444' },
          { id: 2, label: 'Programmato', color: '#3b82f6' }
        ].map(modeOpt => {
          const isActive = data?.systemMode === modeOpt.id;
          return (
            <button
              key={modeOpt.id}
              onClick={() => handleModeChange(modeOpt.id)}
              disabled={!currentUser}
              style={{
                flex: 1,
                minWidth: '100px',
                padding: '12px 8px',
                borderRadius: 12,
                border: 'none',
                background: isActive ? modeOpt.color : 'rgba(255,255,255,0.5)',
                color: isActive ? '#fff' : '#64748b',
                fontWeight: 600,
                fontSize: 14,
                cursor: currentUser ? 'pointer' : 'not-allowed',
                boxShadow: isActive ? `0 4px 12px ${modeOpt.color}66` : 'none',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                opacity: (!currentUser) ? 0.6 : 1
              }}
            >
              <div style={{
                width: 10, height: 10, borderRadius: '50%',
                background: isActive ? '#fff' : '#cbd5e1',
                boxShadow: isActive ? '0 0 8px #fff' : 'none',
                transition: 'all 0.2s'
              }} />
              {modeOpt.label}
            </button>
          )
        })}
      </div>

      {/* Sliders Container */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 16, alignItems: 'center' }}>
        <TimeCircularSlider 
          label="Orario di accensione" 
          initialTime={{ h: parseInt(data?.h1 ?? 0, 10), m: parseInt(data?.m1 ?? 0, 10) }} 
          onTimeRelease={(h, m) => handleTimeChange('on', h, m)}
          disabled={!currentUser}
        />
        <TimeCircularSlider 
          label="Orario di spegnimento" 
          initialTime={{ h: parseInt(data?.h2 ?? 0, 10), m: parseInt(data?.m2 ?? 0, 10) }} 
          onTimeRelease={(h, m) => handleTimeChange('off', h, m)}
          disabled={!currentUser}
        />
      </div>

      {/* Routines section */}
      <div style={{ ...glass, padding: 24, marginTop: 8 }}>
        <p style={{
          fontSize: 11, fontWeight: 700, color: '#64748b',
          textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 16,
        }}>
          Routine Preimpostate
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {routines.map(rt => {
            const isActive = parseInt(data?.h1, 10) === rt.onTime.h && parseInt(data?.m1, 10) === rt.onTime.m &&
                             parseInt(data?.h2, 10) === rt.offTime.h && parseInt(data?.m2, 10) === rt.offTime.m &&
                             Number(data?.target) === rt.target;
            return (
              <RoutineCard key={rt.id} routine={rt} onApply={() => applyRoutine(rt)} disabled={!currentUser} isActive={isActive} />
            )
          })}
        </div>
      </div>
    </div>
  )
}

function RoutineCard({ routine, onApply, disabled, isActive }) {
  const [showInfo, setShowInfo] = useState(false);
  
  const pad = (n) => n.toString().padStart(2, '0');
  const onStr = `${pad(routine.onTime.h)}:${pad(routine.onTime.m)}`;
  const offStr = `${pad(routine.offTime.h)}:${pad(routine.offTime.m)}`;

  return (
    <div style={{ 
      background: `linear-gradient(to right, ${routine.colorFrom}, ${routine.colorTo})`, 
      borderRadius: 12, 
      border: '1px solid rgba(0,0,0,0.05)',
      overflow: 'hidden'
    }}>
      <div style={{ 
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
        padding: '12px 16px',
        flexWrap: 'wrap',
        gap: 12
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: '#1e293b' }}>{routine.emoji} {routine.name}</span>
          <span style={{ fontSize: 12, color: '#64748b' }}>
            ON: <strong>{onStr}</strong> | OFF: <strong>{offStr}</strong> | Target: <strong>{routine.target}°C</strong>
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button 
            onClick={() => setShowInfo(!showInfo)}
            style={{ 
              background: 'transparent', border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: 32, height: 32, borderRadius: '50%'
            }}
            title="Informazioni routine"
          >
            <div style={{ width: 22, height: 22, borderRadius: '50%', border: '2px solid #cbd5e1', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontWeight: 'bold', fontSize: 12, fontStyle: 'italic', fontFamily: 'serif' }}>i</div>
          </button>
          <button 
            onClick={onApply}
            disabled={disabled}
            style={{
              background: isActive ? '#22c55e' : '#0284c7', color: 'white', border: 'none', borderRadius: 8,
              padding: '8px 16px', fontSize: 12, fontWeight: 600, cursor: disabled ? 'not-allowed' : 'pointer',
              opacity: disabled ? 0.6 : 1, transition: 'all 0.2s', boxShadow: isActive ? '0 2px 8px rgba(34, 197, 94, 0.3)' : '0 2px 8px rgba(2, 132, 199, 0.2)'
            }}
          >
            {isActive ? 'Attivata' : 'Attiva'}
          </button>
        </div>
      </div>
      {showInfo && (
        <div style={{ 
          padding: '16px', background: 'rgba(2, 132, 199, 0.03)', 
          borderTop: '1px solid rgba(2, 132, 199, 0.08)',
          fontSize: 13, color: '#334155', lineHeight: 1.6, whiteSpace: 'pre-line'
        }}>
          {routine.desc}
        </div>
      )}
    </div>
  )
}

function TimeCircularSlider({ label, initialTime, onTimeRelease, disabled }) {
  const [targetMins, setTargetMins] = useState(initialTime.h * 60 + initialTime.m);
  const svgRef = useRef(null);

  useEffect(() => {
    setTargetMins(initialTime.h * 60 + initialTime.m);
  }, [initialTime.h, initialTime.m]);

  const min = 0;
  const max = 24 * 60; // 1440 minutes

  const calculateValue = (clientX, clientY) => {
    if (!svgRef.current) return targetMins;
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
    
    const totalMinutes = Math.round(val / 15) * 15;
    return totalMinutes;
  };

  const handlePointerDown = (e) => {
    if (disabled) return;
    e.target.setPointerCapture(e.pointerId);
    const newVal = calculateValue(e.clientX, e.clientY);
    setTargetMins(newVal);
  };

  const handlePointerMove = (e) => {
    if (disabled) return;
    if (e.buttons > 0) {
      const newVal = calculateValue(e.clientX, e.clientY);
      if (newVal !== targetMins) {
        setTargetMins(newVal);
      }
    }
  };

  const handlePointerUp = (e) => {
    if (disabled) return;
    e.target.releasePointerCapture(e.pointerId);
    let h = Math.floor(targetMins / 60);
    if (h === 24) h = 0;
    let m = targetMins % 60;
    if (onTimeRelease && (h !== initialTime.h || m !== initialTime.m)) {
      onTimeRelease(h, m);
    }
  };

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

  const valAngle = 135 + ((targetMins - min) / (max - min)) * 270;
  const valPt = getPoint(valAngle);
  const largeArcFlag = valAngle - startAngle > 180 ? 1 : 0;
  const progressPath = valAngle === startAngle ? "" : `M ${startPt.x} ${startPt.y} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${valPt.x} ${valPt.y}`;

  let displayH = Math.floor(targetMins / 60);
  if (displayH === 24) displayH = 0;
  let displayM = targetMins % 60;
  const pad = (n) => n.toString().padStart(2, '0');
  const timeStr = `${pad(displayH)}:${pad(displayM)}`;

  return (
    <div className={`glass ${!disabled ? 'glow-blue' : ''}`} style={{
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
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexWrap: 'wrap',
        gap: 8
      }}>
        <span>{label}</span>
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
            <path d={progressPath} fill="none" stroke={!disabled ? "#0ea5e9" : "#cbd5e1"} strokeWidth="18" strokeLinecap="round" 
              style={{ transition: 'stroke-dasharray 0.1s' }} />
          )}
          
          {/* Knob */}
          <circle cx={valPt.x} cy={valPt.y} r="14" fill="#fff" stroke={!disabled ? "#0284c7" : "#94a3b8"} strokeWidth="4" 
            style={{ cursor: !disabled ? 'grab' : 'not-allowed', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' }} />
        </svg>

        <div style={{
          position: 'absolute',
          top: '57.7%', left: '50%',
          transform: 'translate(-50%, -50%)',
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          pointerEvents: 'none',
        }}>
          {/* Time text */}
          <div style={{
            fontSize: 'clamp(44px, 12vw, 56px)',
            fontWeight: 900, lineHeight: 1,
            letterSpacing: '-2px', color: '#0f172a',
            fontFamily: 'Inter, sans-serif'
          }}>
            {timeStr}
          </div>
        </div>
      </div>
    </div>
  )
}
