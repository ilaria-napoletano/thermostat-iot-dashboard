import { useThermostat } from '../hooks/useThermostat'

function Row({ label, value, ok }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-slate-700 last:border-0">
      <span className="text-slate-400 text-sm">{label}</span>
      <span className={`text-sm font-medium ${ok === undefined ? 'text-slate-300' : ok ? 'text-green-400' : 'text-red-400'}`}>
        {value}
      </span>
    </div>
  )
}

export default function Status() {
  const { data, loading, error, isMock } = useThermostat()

  const lastUpdate = data?.lastUpdated
    ? new Date(data.lastUpdated).toLocaleString('it-IT')
    : '—'

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-100">Stato sistema</h1>

      <div className="rounded-2xl bg-slate-800 border border-slate-700 p-6">
        <Row label="Connessione" value={error ? 'Errore' : 'Connesso'} ok={!error} />
        <Row label="Fonte dati" value={isMock ? 'Mock (demo)' : 'Firebase'} ok={!isMock} />
        <Row label="Ultimo aggiornamento" value={lastUpdate} />
        <Row label="Stato termostato" value={data?.isOn ? 'Acceso' : 'Spento'} ok={data?.isOn} />
        <Row label="Modalità" value={data?.mode ?? '—'} />
        <Row label="Temperatura" value={data?.temperature != null ? `${data.temperature}°C` : '—'} />
        <Row label="Umidità" value={data?.humidity != null ? `${data.humidity}%` : '—'} />
      </div>

      {error && (
        <div className="rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 p-4 text-sm">
          {error}
        </div>
      )}
    </div>
  )
}
