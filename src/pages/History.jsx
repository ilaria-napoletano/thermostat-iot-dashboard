import {
  ResponsiveContainer, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip,
} from 'recharts'
import { useThermostat } from '../hooks/useThermostat'
import { useMeteo } from '../hooks/useMeteo'

function CustomTooltip({ active, payload, label, unit, color }) {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: '#0f1932', border: '1px solid rgba(99,179,237,0.15)',
      borderRadius: 10, padding: '10px 14px', fontSize: 13,
    }}>
      <p style={{ color: '#64748b', marginBottom: 4 }}>{label}</p>
      {payload.map((entry, index) => (
        <p key={index} style={{ color: entry.color, fontWeight: 700, fontSize: 16 }}>
          {entry.name}: {entry.value}{entry.name.includes('Temp') ? '°C' : '%'}
        </p>
      ))}
    </div>
  )
}

function Chart({ data, dataKey, label, color, unit }) {
  return (
    <div className="glass" style={{ padding: '20px 16px 16px' }}>
      <p style={{ fontSize: 13, fontWeight: 600, color: '#94a3b8', marginBottom: 16, paddingLeft: 4 }}>{label}</p>
      <ResponsiveContainer width="100%" height={180}>
        <LineChart data={data} margin={{ top: 4, right: 8, left: -28, bottom: 0 }}>
          <defs>
            <linearGradient id={`grad-${dataKey}`} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor={color} stopOpacity={0.3} />
              <stop offset="100%" stopColor={color} stopOpacity={1} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
          <XAxis dataKey="time" tick={{ fill: '#334155', fontSize: 10 }} interval={5} stroke="transparent" />
          <YAxis tick={{ fill: '#334155', fontSize: 10 }} stroke="transparent" domain={['auto', 'auto']} />
          <Tooltip content={<CustomTooltip unit={unit} color={color} />} />
          <Line
            type="monotone" dataKey={dataKey} name={label}
            stroke={`url(#grad-${dataKey})`}
            strokeWidth={2.5} dot={false} activeDot={{ r: 5, fill: color }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

function DoubleChart({ data, label }) {
  return (
    <div className="glass" style={{ padding: '20px 16px 16px', background: 'linear-gradient(145deg, rgba(30,41,59,0.7), rgba(15,23,42,0.9))' }}>
      <p style={{ fontSize: 13, fontWeight: 600, color: '#94a3b8', marginBottom: 16, paddingLeft: 4 }}>{label}</p>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={data} margin={{ top: 4, right: 8, left: -28, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
          <XAxis dataKey="time" tick={{ fill: '#334155', fontSize: 10 }} interval={5} stroke="transparent" />
          <YAxis tick={{ fill: '#334155', fontSize: 10 }} stroke="transparent" domain={['auto', 'auto']} />
          <Tooltip content={<CustomTooltip />} />
          <Line
            type="monotone" dataKey="temperature" name="Temp. Esterna"
            stroke="#fcd34d" strokeWidth={2.5} dot={false} activeDot={{ r: 5, fill: '#fcd34d' }}
          />
          <Line
            type="monotone" dataKey="humidity" name="Umidità Esterna"
            stroke="#38bdf8" strokeWidth={2.5} dot={false} activeDot={{ r: 5, fill: '#38bdf8' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

export default function History() {
  const { history } = useThermostat()
  const { history: meteoHistory } = useMeteo()

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <h1 style={{ fontSize: 'clamp(18px, 4vw, 22px)', fontWeight: 700, color: '#f1f5f9' }}>Storico</h1>
        <p style={{ fontSize: 13, color: '#64748b', marginTop: 2 }}>Ultime 24 ore (Termostato)</p>
      </div>
      <Chart data={history} dataKey="temperature" label="Temperatura Interna (°C)" color="#60a5fa" unit="°C" />
      <Chart data={history} dataKey="humidity" label="Umidità Interna (%)" color="#34d399" unit="%" />
      
      {meteoHistory && meteoHistory.length > 0 && (
        <>
          <div style={{ marginTop: 16 }}>
            <h2 style={{ fontSize: 'clamp(16px, 3.5vw, 18px)', fontWeight: 600, color: '#f1f5f9' }}>Meteo Esterno (Bari)</h2>
            <p style={{ fontSize: 13, color: '#64748b', marginTop: 2 }}>Andamento 24 ore</p>
          </div>
          <DoubleChart data={meteoHistory} label="Temperatura & Umidità Esterna" />
        </>
      )}
    </div>
  )
}
