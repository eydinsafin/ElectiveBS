import { useNavigate, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, CalendarDays, Calendar, Users,
  DollarSign, Building2, BarChart2, Settings, X, Moon, Sun,
} from 'lucide-react'
import Avatar from './Avatar'
import { useTheme } from '../context/ThemeContext'
import { useToast } from '../context/ToastContext'
import logo from '../assets/logo.png'

const NAV = [
  { label: 'Director View', icon: LayoutDashboard, path: '/director' },
  { label: 'Agency Home',   icon: Building2,       path: '/' },
  { label: 'Schedule',      icon: Calendar,        path: '/schedule' },
  { label: 'Events',        icon: CalendarDays,    path: '/events' },
  { label: 'Staff',         icon: Users,           path: '/staff' },
  { label: 'Payroll',       icon: DollarSign,      path: '/payroll/PAY-2023-10-B' },
  { label: 'Reports',       icon: BarChart2,       path: '/reports' },
]

interface Props {
  open: boolean
  onClose: () => void
}

export default function Sidebar({ open, onClose }: Props) {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const { theme, toggle } = useTheme()
  const toast = useToast()

  const isActive = (path: string) =>
    path === '/' ? pathname === '/' : pathname.startsWith(path)

  const go = (path: string) => {
    navigate(path)
    onClose()
  }

  return (
    <aside
      className={`
        fixed lg:static inset-y-0 left-0 z-50
        w-64 lg:w-60 bg-slate-900 flex flex-col h-screen shrink-0
        transition-transform duration-200 ease-in-out
        ${open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}
    >
      {/* Logo + mobile close */}
      <div className="h-16 px-5 flex items-center justify-between border-b border-white/5 shrink-0">
        <div className="flex items-center gap-2.5">
          <img src={logo} alt="EventOS" className="w-8 h-8 object-contain" />
          <span className="text-white font-bold text-[17px] tracking-tight">EventOS</span>
        </div>
        <button
          onClick={onClose}
          className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
        >
          <X size={18} />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-5 space-y-0.5 overflow-y-auto">
        <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest px-3 pb-3">Navigation</p>
        {NAV.map(({ label, icon: Icon, path }) => (
          <button
            key={label}
            onClick={() => go(path)}
            className={`w-full flex items-center gap-3 px-3 py-3 lg:py-2.5 rounded-lg text-sm font-medium transition-colors text-left ${
              isActive(path)
                ? 'bg-amber-500/10 text-amber-400'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Icon size={18} strokeWidth={isActive(path) ? 2.5 : 1.8} />
            {label}
          </button>
        ))}
      </nav>

      {/* Bottom */}
      <div className="px-3 py-4 border-t border-white/5 shrink-0">
        {/* Dark mode toggle */}
        <button
          onClick={toggle}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-colors mb-1"
        >
          {theme === 'dark' ? <Sun size={17} strokeWidth={1.8} /> : <Moon size={17} strokeWidth={1.8} />}
          {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
        </button>

        <button
          onClick={() => toast.show('Settings panel is coming in the next release', 'info')}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-colors mb-3"
        >
          <Settings size={17} strokeWidth={1.8} />
          Settings
        </button>
        <div className="flex items-center gap-3 px-3">
          <Avatar name="Darren Ong Wei Kiat" size="sm" />
          <div className="min-w-0 flex-1">
            <p className="text-white text-sm font-medium truncate">Darren Ong Wei Kiat</p>
            <p className="text-slate-500 text-xs">Director</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
