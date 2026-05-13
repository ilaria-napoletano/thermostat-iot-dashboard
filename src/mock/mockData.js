// Mock data used when Firebase credentials are not yet configured
export const mockThermostatData = {
  temperature: 22.4,
  humidity: 58,
  target: 21.0,
  mode: 'heating', // 'heating' | 'cooling' | 'idle'
  isOn: true,
  lastUpdated: Date.now(),
}

export function generateHistoryMock(hours = 24) {
  const now = Date.now()
  return Array.from({ length: hours }, (_, i) => ({
    time: new Date(now - (hours - i) * 3600000).toLocaleTimeString('it-IT', {
      hour: '2-digit',
      minute: '2-digit',
    }),
    temperature: +(19 + Math.random() * 5).toFixed(1),
    humidity: Math.round(45 + Math.random() * 20),
  }))
}
