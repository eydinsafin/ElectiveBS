import { useNavigate } from 'react-router-dom'
import { TrendingUp, Users, DollarSign, Bell, Plus, ChevronRight, AlertTriangle, Activity } from 'lucide-react'
import Avatar from '../components/Avatar'
import { useEvents, fmtDate, STATUS_BADGE, PROGRESS_BAR } from '../context/EventsContext'

const kpis = [
  { label: 'Total Revenue (MTD)', value: '$84,240', badge: '+12.5%',  ok: true,  sub: 'vs last month',    Icon: DollarSign, cls: 'text-emerald-600 bg-emerald-50' },
  { label: 'Staff Utilization',   value: '92.4%',   badge: 'Optimal', ok: true,  sub: '342 / 370 staff',  Icon: Users,      cls: 'text-blue-600 bg-blue-50' },
  { label: 'Payroll Processing',  value: '$12,410', badge: 'Pending', ok: false, sub: '42 recipients',    Icon: Activity,   cls: 'text-orange-600 bg-orange-50' },
]

const performers: { name: string; role: string; tag: string; tagCls: string }[] = []
const alerts: { level: string; msg: string; action: string }[] = []

export default function DirectorDashboard() {
  const navigate = useNavigate()
  const { events } = useEvents()
  const upcoming = [...events].sort((a, b) => a.date.localeCompare(b.date)).slice(0, 5)

  return (
    <div className="p-4 md:p-8 max-w-[1400px]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 md:mb-8">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900">Director Dashboard</h1>
          <p className="text-slate-500 text-sm mt-1">Real-time operational overview for Elite Agency</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="relative w-9 h-9 rounded-lg border border-slate-200 bg-white flex items-center justify-center hover:bg-slate-50">
            <Bell size={17} className="text-slate-500" />
            <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-red-500 rounded-full" />
          </button>
          <button onClick={() => navigate('/events/create')} className="flex items-center gap-2 px-3 md:px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors shadow-md shadow-blue-600/20">
            <Plus size={15} />
            <span className="hidden sm:inline">Schedule New Event</span>
            <span className="sm:hidden">New Event</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-5 mb-6 md:mb-7">
        {kpis.map(({ label, value, badge, ok, sub, Icon, cls }) => (
          <div key={label} className="bg-white rounded-xl border border-slate-200 p-4 md:p-5">
            <div className="flex items-start justify-between mb-3 md:mb-4">
              <div className={`w-9 h-9 md:w-10 md:h-10 rounded-xl flex items-center justify-center ${cls}`}>
                <Icon size={18} />
              </div>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${ok ? 'bg-emerald-50 text-emerald-700' : 'bg-orange-50 text-orange-700'}`}>
                {badge}
              </span>
            </div>
            <p className="text-xl md:text-2xl font-bold text-slate-900 leading-none mb-1">{value}</p>
            <p className="text-slate-400 text-[10px] md:text-[11px] font-medium uppercase tracking-wider">{label}</p>
            <p className="text-slate-400 text-xs mt-1 hidden md:block">{sub}</p>
          </div>
        ))}
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 mb-4 md:mb-6">
        {/* Live Event Monitor */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200">
          <div className="px-4 md:px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <h2 className="font-semibold text-slate-900 text-sm md:text-base">Live Event Monitor</h2>
            </div>
            <button className="text-sm text-blue-600 font-medium flex items-center gap-1">View All <ChevronRight size={14} /></button>
          </div>
          <div className="divide-y divide-slate-100">
            {events.length === 0 && (
              <p className="px-6 py-10 text-center text-sm text-slate-400">No live events right now.</p>
            )}
            {events.map(ev => {
              const pct = ev.total > 0 ? Math.round((ev.filled / ev.total) * 100) : 0
              return (
                <div key={ev.id} className="px-4 md:px-6 py-3 md:py-4 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                      <p className="font-semibold text-slate-900 text-sm">{ev.name}</p>
                      <span className={`text-[11px] px-2 py-0.5 rounded-full font-semibold ${STATUS_BADGE[ev.status]}`}>{ev.status}</span>
                    </div>
                    <p className="text-slate-400 text-xs">{ev.location} · {fmtDate(ev.date)}</p>
                  </div>
                  <div className="flex items-center gap-3 sm:w-40 sm:shrink-0">
                    <div className="flex-1 sm:flex-none sm:w-40">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-400">{ev.filled}/{ev.total}</span>
                        <span className="font-semibold text-slate-700">{pct}%</span>
                      </div>
                      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${PROGRESS_BAR[ev.status]}`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                    <button onClick={() => navigate(`/events/${ev.id}`)} className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100 shrink-0">
                      Manage
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-4 md:space-y-5">
          <div className="bg-white rounded-xl border border-slate-200">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
              <TrendingUp size={15} className="text-slate-400" />
              <h2 className="font-semibold text-slate-900">Top Performers</h2>
            </div>
            <div className="p-5 space-y-3.5">
              {performers.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-2">No performer data yet.</p>
              ) : performers.map(p => (
                <div key={p.name} className="flex items-center gap-3">
                  <Avatar name={p.name} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900 truncate">{p.name}</p>
                    <p className="text-xs text-slate-400">{p.role}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${p.tagCls}`}>{p.tag}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h2 className="font-semibold text-slate-900 mb-3">Budget Utilization</h2>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-slate-500">$62,000 spent</span>
              <span className="font-bold text-slate-900">75%</span>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden mb-1">
              <div className="h-full bg-blue-600 rounded-full" style={{ width: '75%' }} />
            </div>
            <p className="text-xs text-slate-400">of $82,000 total budget</p>
          </div>

          <div className="bg-white rounded-xl border border-slate-200">
            <div className="px-5 py-4 border-b border-slate-100">
              <h2 className="font-semibold text-slate-900">Critical Alerts</h2>
            </div>
            <div className="p-4 space-y-2">
              {alerts.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-2">No active alerts.</p>
              ) : alerts.map((a, i) => (
                <div key={i} className={`flex items-start gap-2.5 p-3 rounded-lg ${a.level === 'critical' ? 'bg-red-50' : 'bg-amber-50'}`}>
                  <AlertTriangle size={13} className={`mt-0.5 shrink-0 ${a.level === 'critical' ? 'text-red-500' : 'text-amber-500'}`} />
                  <p className={`text-xs flex-1 leading-relaxed ${a.level === 'critical' ? 'text-red-700' : 'text-amber-700'}`}>{a.msg}</p>
                  <button className="text-xs text-blue-600 font-semibold shrink-0">{a.action}</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Upcoming */}
      <div className="bg-white rounded-xl border border-slate-200">
        <div className="px-4 md:px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-semibold text-slate-900">Upcoming Events</h2>
          <button onClick={() => navigate('/schedule')} className="text-sm text-blue-600 font-medium flex items-center gap-1">Schedule <ChevronRight size={14} /></button>
        </div>
        <div className="divide-y divide-slate-100">
          {upcoming.length === 0 && (
            <p className="px-6 py-8 text-center text-sm text-slate-400">No upcoming events scheduled.</p>
          )}
          {upcoming.map(ev => (
            <div key={ev.id} className="px-4 md:px-6 py-3.5 flex items-center gap-3 md:gap-6">
              <span className="text-xs font-bold text-slate-400 w-16 shrink-0">{fmtDate(ev.date).replace(/,.*/, '')}</span>
              <p className="text-sm font-semibold text-slate-900 flex-1 truncate">{ev.name}</p>
              <span className={`text-xs px-2 py-0.5 rounded-full font-semibold hidden sm:inline ${STATUS_BADGE[ev.status]}`}>{ev.status}</span>
              <span className="text-xs text-slate-400 hidden md:inline">{ev.total} staff needed</span>
              <button onClick={() => navigate(`/events/${ev.id}`)} className="text-xs text-blue-600 font-medium shrink-0">Details →</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
