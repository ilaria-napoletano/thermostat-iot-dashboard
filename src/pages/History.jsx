import {
  ResponsiveContainer, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip,
} from 'recharts'
import { useThermostat } from '../hooks/useThermostat'
function CustomTooltip({ active, payload, label, unit, color }) {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: '#ffffff', border: '1px solid rgba(0,0,0,0.1)',
      borderRadius: 10, padding: '10px 14px', fontSize: 13,
      boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
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
      <p style={{ fontSize: 13, fontWeight: 600, color: '#475569', marginBottom: 16, paddingLeft: 4 }}>{label}</p>
      <ResponsiveContainer width="100%" height={180}>
        <LineChart data={data} margin={{ top: 4, right: 8, left: -28, bottom: 0 }}>
          <defs>
            <linearGradient id={`grad-${dataKey}`} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor={color} stopOpacity={0.3} />
              <stop offset="100%" stopColor={color} stopOpacity={1} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
          <XAxis dataKey="time" tick={{ fill: '#475569', fontSize: 10 }} interval={5} stroke="transparent" />
          <YAxis tick={{ fill: '#475569', fontSize: 10 }} stroke="transparent" domain={['auto', 'auto']} />
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



export default function History() {
  const { history } = useThermostat()

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <h1 style={{ fontSize: 'clamp(18px, 4vw, 22px)', fontWeight: 700, color: '#1e293b' }}>Storico</h1>
        <p style={{ fontSize: 13, color: '#475569', marginTop: 2 }}>Ultime 24 ore (Termostato)</p>
      </div>
      <Chart data={history} dataKey="temperature" label="Temperatura Interna (°C)" color="#0284c7" unit="°C" />
      <Chart data={history} dataKey="humidity" label="Umidità Interna (%)" color="#059669" unit="%" />
    </div>
  )
}
