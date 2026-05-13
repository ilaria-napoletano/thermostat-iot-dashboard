import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts'
import { useThermostat } from '../hooks/useThermostat'

export default function History() {
  const { history } = useThermostat()

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-100">Storico</h1>

      <div className="rounded-2xl bg-slate-800 border border-slate-700 p-4">
        <p className="text-sm text-slate-400 mb-4">Temperatura — ultime 24 ore</p>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={history}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis
              dataKey="time"
              tick={{ fill: '#94a3b8', fontSize: 11 }}
              interval={3}
              stroke="#475569"
            />
            <YAxis
              tick={{ fill: '#94a3b8', fontSize: 11 }}
              stroke="#475569"
              domain={['auto', 'auto']}
              unit="°"
            />
            <Tooltip
              contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8 }}
              labelStyle={{ color: '#94a3b8' }}
              itemStyle={{ color: '#60a5fa' }}
            />
            <Line
              type="monotone"
              dataKey="temperature"
              stroke="#60a5fa"
              strokeWidth={2}
              dot={false}
              name="Temperatura (°C)"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="rounded-2xl bg-slate-800 border border-slate-700 p-4">
        <p className="text-sm text-slate-400 mb-4">Umidità — ultime 24 ore</p>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={history}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis
              dataKey="time"
              tick={{ fill: '#94a3b8', fontSize: 11 }}
              interval={3}
              stroke="#475569"
            />
            <YAxis
              tick={{ fill: '#94a3b8', fontSize: 11 }}
              stroke="#475569"
              domain={['auto', 'auto']}
              unit="%"
            />
            <Tooltip
              contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8 }}
              labelStyle={{ color: '#94a3b8' }}
              itemStyle={{ color: '#34d399' }}
            />
            <Line
              type="monotone"
              dataKey="humidity"
              stroke="#34d399"
              strokeWidth={2}
              dot={false}
              name="Umidità (%)"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
