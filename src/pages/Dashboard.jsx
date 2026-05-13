import { useThermostat } from '../hooks/useThermostat'
import StatCard from '../components/StatCard'

const modeLabel = { heating: 'Riscaldamento', cooling: 'Raffreddamento', idle: 'In standby' }
const modeColor = { heating: 'orange', cooling: 'blue', idle: 'green' }

export default function Dashboard() {
  const { data, loading, error, isMock } = useThermostat()

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 p-6 text-center">
        <p className="font-semibold">Errore di connessione</p>
        <p className="text-sm mt-1 opacity-80">{error}</p>
      </div>
    )
  }

  const isOn = data?.isOn ?? false
  const mode = data?.mode ?? 'idle'

  return (
    <div className="space-y-6">
      {isMock && (
        <div className="rounded-xl bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 px-4 py-2 text-sm text-center">
          Modalità demo — dati simulati
        </div>
      )}

      {/* Status badge */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-100">Dashboard</h1>
        <span
          className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
            isOn ? 'bg-green-500/20 text-green-400' : 'bg-slate-700 text-slate-400'
          }`}
        >
          <span className={`w-2 h-2 rounded-full ${isOn ? 'bg-green-400 animate-pulse' : 'bg-slate-500'}`} />
          {isOn ? 'Attivo' : 'Spento'}
        </span>
      </div>

      {/* Main temperature display */}
      <div className="rounded-3xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 p-8 text-center">
        <p className="text-slate-400 text-sm mb-2">Temperatura attuale</p>
        <p className="text-7xl font-bold text-white tracking-tight">
          {data?.temperature ?? '--'}
          <span className="text-3xl text-slate-400">°C</span>
        </p>
        <p className="text-slate-400 mt-3 text-sm">
          Target: <span className="text-blue-400 font-medium">{data?.target ?? '--'}°C</span>
        </p>
        <div
          className={`mt-4 inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium bg-${modeColor[mode]}-500/20 text-${modeColor[mode]}-400`}
        >
          {modeLabel[mode]}
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-4">
        <StatCard label="Umidità" value={data?.humidity ?? '--'} unit="%" icon="💧" color="blue" />
        <StatCard label="Target" value={data?.target ?? '--'} unit="°C" icon="🎯" color="green" />
      </div>

      {/* Last update */}
      {data?.lastUpdated && (
        <p className="text-center text-xs text-slate-500">
          Aggiornato: {new Date(data.lastUpdated).toLocaleTimeString('it-IT')}
        </p>
      )}
    </div>
  )
}
