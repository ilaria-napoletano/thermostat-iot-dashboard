import {
  ResponsiveContainer, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip,
} from 'recharts'
import { useThermostat } from '../hooks/useThermostat'

function CustomTooltip({ active, payload, label, unit, color }) {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: '#0f1932', border: '1px solid rgba(99,179,237,0.15)',
      borderRadius: 10, padding: '10px 14px', fontSize: 13,
    }}>
      <p style={{ color: '#64748b', marginBottom: 4 }}>{label}</p>
      <p style={{ color, fontWeight: 700, fontSize: 16 }}>
        {payload[0].value}{unit}
      </p>
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
            type="monotone" dataKey={dataKey}
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
        <h1 style={{ fontSize: 'clamp(18px, 4vw, 22px)', fontWeight: 700, color: '#f1f5f9' }}>Storico</h1>
        <p style={{ fontSize: 13, color: '#64748b', marginTop: 2 }}>Ultime 24 ore</p>
      </div>
      <Chart data={history} dataKey="temperature" label="Temperatura (°C)" color="#60a5fa" unit="°C" />
      <Chart data={history} dataKey="humidity" label="Umidità (%)" color="#34d399" unit="%" />
    </div>
  )
}
