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
    name: 'Feriali (Il "Rientro Caldo")',
    onTime: { h: 17, m: 0 },
    offTime: { h: 22, m: 30 },
    target: 20,
    desc: "Concentre l'unica accensione sul momento di massima presenza e relax, ovvero il tardo pomeriggio e la sera. La mattina ci si affida all'inerzia termica della casa o... a un caffè caldo e una vestaglia.\n\nLogica: L'impianto spinge per 5 ore e mezza. Spegnendo alle 22:30, la casa resterà tiepida fino a quando non sarai addormentato. Durante il giorno e la notte il sistema resta in OFF."
  },
  {
    id: 'festivo',
    name: 'Festivo (Il "Comfort Prolungato")',
    onTime: { h: 10, m: 0 },
    offTime: { h: 23, m: 0 },
    target: 19.5,
    desc: "Nei weekend si passa più tempo in casa, spesso fin dalla mattina. L'unica finestra deve quindi coprire la parte centrale e serale della giornata.\n\nLogica: Una finestra lunga 13 ore. Teniamo la temperatura leggermente più bassa (19.5°C invece di 20°C) per compensare il fatto che l'impianto rimarrà acceso molte ore di fila, evitando impennate in bolletta."
  },
  {
    id: 'eco',
    name: 'ECO (Il "Mantenimento Minimo")',
    onTime: { h: 18, m: 30 },
    offTime: { h: 21, m: 30 },
    target: 18.5,
    desc: "Se vuoi risparmiare al massimo pur mantenendo la casa abitabile nei feriali, stringiamo la finestra temporale all'essenziale e abbassiamo il target.\n\nLogica: Solo 3 ore di accensione controllata. Giusto il tempo di cenare e rilassarsi un attimo senza congelare, sfruttando il massimo risparmio nelle restanti 21 ore di OFF."
  },
  {
    id: 'vacanza',
    name: 'Vacanza (L\' "Antigelo Forzato")',
    onTime: { h: 0, m: 0 },
    offTime: { h: 23, m: 59 },
    target: 7,
    desc: "Sfruttiamo un trick di programmazione. Per simulare la modalità vacanza costante devi fare in modo che la temperatura target sia così bassa da non far partire quasi mai la caldaia, ma abbastanza alta da proteggere i tubi.\n\nLogica: Il termostato è costantemente 'in funzione', ma avendo come target 7°C, la caldaia si accenderà soltanto se fuori c'è un'ondata di gelo tale da rischiare di far congelare l'acqua nei tubi dell'intercapedine."
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
        'termostato/set_temp': routine.target
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

      {/* Sliders Container */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 16 }}>
        <TimeCircularSlider 
          label="Orario ON" 
          initialTime={{ h: data?.h1 ?? 0, m: data?.m1 ?? 0 }} 
          onTimeRelease={(h, m) => handleTimeChange('on', h, m)}
          disabled={!currentUser}
        />
        <TimeCircularSlider 
          label="Orario OFF" 
          initialTime={{ h: data?.h2 ?? 0, m: data?.m2 ?? 0 }} 
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
          {routines.map(rt => (
            <RoutineCard key={rt.id} routine={rt} onApply={() => applyRoutine(rt)} disabled={!currentUser} />
          ))}
        </div>
      </div>
    </div>
  )
}

function RoutineCard({ routine, onApply, disabled }) {
  const [showInfo, setShowInfo] = useState(false);
  
  const pad = (n) => n.toString().padStart(2, '0');
  const onStr = `${pad(routine.onTime.h)}:${pad(routine.onTime.m)}`;
  const offStr = `${pad(routine.offTime.h)}:${pad(routine.offTime.m)}`;

  return (
    <div style={{ 
      background: 'rgba(255, 255, 255, 0.4)', 
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
          <span style={{ fontSize: 14, fontWeight: 600, color: '#1e293b' }}>{routine.name}</span>
          <span style={{ fontSize: 12, color: '#64748b' }}>
            ON: <strong>{onStr}</strong> | OFF: <strong>{offStr}</strong> | Target: <strong>{routine.target}°C</strong>
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button 
            onClick={() => setShowInfo(!showInfo)}
            style={{ 
              background: showInfo ? 'rgba(2, 132, 199, 0.1)' : 'transparent', border: 'none', cursor: 'pointer',
              fontSize: 16, color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: 32, height: 32, borderRadius: '50%'
            }}
            title="Informazioni routine"
          >
            ℹ️
          </button>
          <button 
            onClick={onApply}
            disabled={disabled}
            style={{
              background: '#0284c7', color: 'white', border: 'none', borderRadius: 8,
              padding: '8px 16px', fontSize: 12, fontWeight: 600, cursor: disabled ? 'not-allowed' : 'pointer',
              opacity: disabled ? 0.6 : 1, transition: 'all 0.2s', boxShadow: '0 2px 8px rgba(2, 132, 199, 0.2)'
            }}
          >
            Attiva
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
