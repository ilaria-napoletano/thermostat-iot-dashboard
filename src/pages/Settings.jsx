import { useState } from 'react'
import { useThermostat } from '../hooks/useThermostat'

export default function Settings() {
  const { data, isMock } = useThermostat()
  const [target, setTarget] = useState(data?.target ?? 21)
  const [saved, setSaved] = useState(false)

  function handleSave() {
    // TODO: write to Firebase when credentials are connected
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-100">Impostazioni</h1>

      {isMock && (
        <div className="rounded-xl bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 px-4 py-2 text-sm">
          Le modifiche non vengono salvate in modalità demo
        </div>
      )}

      <div className="rounded-2xl bg-slate-800 border border-slate-700 p-6 space-y-5">
        <div>
          <label className="block text-sm text-slate-400 mb-2">
            Temperatura target
          </label>
          <div className="flex items-center gap-4">
            <input
              type="range"
              min={10}
              max={30}
              step={0.5}
              value={target}
              onChange={e => setTarget(Number(e.target.value))}
              className="flex-1 accent-blue-400"
            />
            <span className="text-2xl font-bold text-blue-400 w-16 text-right">
              {target}°C
            </span>
          </div>
        </div>

        <button
          onClick={handleSave}
          className={`w-full py-3 rounded-xl font-semibold transition-colors ${
            saved
              ? 'bg-green-500/20 text-green-400 border border-green-500/30'
              : 'bg-blue-500 hover:bg-blue-600 text-white'
          }`}
        >
          {saved ? '✓ Salvato' : 'Salva impostazioni'}
        </button>
      </div>

      <div className="rounded-2xl bg-slate-800 border border-slate-700 p-6">
        <h2 className="text-slate-300 font-medium mb-4">Informazioni app</h2>
        <div className="space-y-2 text-sm text-slate-400">
          <div className="flex justify-between">
            <span>Versione</span>
            <span className="text-slate-300">1.0.0</span>
          </div>
          <div className="flex justify-between">
            <span>Fonte dati</span>
            <span className="text-slate-300">{isMock ? 'Demo (mock)' : 'Firebase'}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
