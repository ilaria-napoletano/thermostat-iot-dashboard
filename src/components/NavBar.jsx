import { NavLink } from 'react-router-dom'

const links = [
  { to: '/', label: 'Dashboard', icon: '🌡️' },
  { to: '/history', label: 'Storico', icon: '📈' },
  { to: '/settings', label: 'Impostazioni', icon: '⚙️' },
  { to: '/status', label: 'Stato', icon: '📡' },
]

export default function NavBar() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-700 z-50 md:top-0 md:bottom-auto md:border-t-0 md:border-b">
      <div className="max-w-2xl mx-auto flex justify-around md:justify-start md:gap-2 md:px-4">
        {links.map(({ to, label, icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 py-3 px-4 text-xs font-medium transition-colors md:flex-row md:gap-2 md:text-sm md:py-4 ${
                isActive ? 'text-blue-400' : 'text-slate-400 hover:text-slate-200'
              }`
            }
          >
            <span className="text-lg md:text-base">{icon}</span>
            {label}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
