import { useNavigate, useLocation } from 'react-router-dom'
import { Home, Calendar, Users, DollarSign } from 'lucide-react'

const tabs = [
  { label: 'Home', icon: Home, path: '/' },
  { label: 'Schedule', icon: Calendar, path: '/' },
  { label: 'Staff', icon: Users, path: '/event/1/staff' },
  { label: 'Payroll', icon: DollarSign, path: '/payroll/PAY-2023-10-B' },
]

export default function BottomNav() {
  const navigate = useNavigate()
  const location = useLocation()

  return (
    <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[390px] bg-zinc-900/95 backdrop-blur border-t border-zinc-800 z-50">
      <div className="flex pb-safe">
        {tabs.map(({ label, icon: Icon, path }) => {
          const isActive =
            (label === 'Home' || label === 'Schedule') && location.pathname === '/' ||
            (label === 'Staff' && location.pathname.includes('/staff')) ||
            (label === 'Payroll' && location.pathname.includes('/payroll'))
          return (
            <button
              key={label}
              onClick={() => navigate(path)}
              className={`flex-1 flex flex-col items-center py-3 gap-1 transition-colors ${
                isActive ? 'text-white' : 'text-zinc-500'
              }`}
            >
              <Icon size={20} strokeWidth={isActive ? 2.5 : 1.5} />
              <span className="text-[11px] font-medium">{label}</span>
              {isActive && <span className="absolute bottom-1 w-1 h-1 bg-blue-500 rounded-full" />}
            </button>
          )
        })}
      </div>
    </div>
  )
}
