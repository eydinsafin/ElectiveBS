import { useNavigate } from 'react-router-dom'
import { TrendingUp, Users, Star, DollarSign, Bell, Plus, ChevronRight, AlertTriangle, Activity } from 'lucide-react'
import Avatar from '../components/Avatar'

const kpis = [
  { label: 'Total Revenue (MTD)', value: '$84,240', badge: '+12.5%',  ok: true,  sub: 'vs last month',    Icon: DollarSign, cls: 'text-emerald-600 bg-emerald-50' },
  { label: 'Staff Utilization',   value: '92.4%',   badge: 'Optimal', ok: true,  sub: '342 / 370 staff',  Icon: Users,      cls: 'text-blue-600 bg-blue-50' },
  { label: 'Avg Event Rating',    value: '4.8 / 5', badge: 'High',    ok: true,  sub: '24 reviews',       Icon: Star,       cls: 'text-amber-600 bg-amber-50' },
  { label: 'Payroll Processing',  value: '$12,410', badge: 'Pending', ok: false, sub: '42 recipients',    Icon: Activity,   cls: 'text-orange-600 bg-orange-50' },
]

const liveEvents = [
  { name: 'Nike Product Launch', venue: 'Grand Convention Hall', time: '08:00 – 18:00', checked: 42, total: 50, supervisor: 'Sarah Jenkins', status: 'On Track' },
  { name: 'BMW Roadshow',        venue: 'City Auto Center',      time: '10:00 – 20:00', checked: 8,  total: 20, supervisor: 'Marcus Low',    status: 'Critical' },
  { name: 'Tech Summit 2023',    venue: 'Innovation Hub',        time: '09:00 – 17:00', checked: 45, total: 50, supervisor: 'Aria Gupta',   status: 'On Track' },
  { name: 'City Music Festival', venue: 'Central Park Stage',    time: '14:00 – 23:00', checked: 18, total: 30, supervisor: 'James Wilson', status: 'Filling' },
]

const performers = [
  { name: 'Sarah Jenkins', role: 'Lead Promoter', rating: 4.9, tag: 'High Demand',  tagCls: 'bg-blue-100 text-blue-700' },
  { name: 'Marcus Low',    role: 'Promoter',      rating: 4.7, tag: 'Dependable',   tagCls: 'bg-emerald-100 text-emerald-700' },
  { name: 'Aria Gupta',    role: 'Supervisor',    rating: 4.5, tag: 'Available',    tagCls: 'bg-slate-100 text-slate-600' },
]

const alerts = [
  { level: 'critical', msg: 'BMW Roadshow: Only 8/20 staff confirmed',        action: 'Assign Staff' },
  { level: 'warning',  msg: 'Tech Summit: 2 staff have scheduling conflicts', action: 'Review' },
]

const upcoming = [
  { date: 'Oct 24', name: 'Nike Product Launch', staff: 42, status: 'On Track' },
  { date: 'Oct 26', name: 'BMW Roadshow',        staff: 8,  status: 'Critical' },
  { date: 'Oct 28', name: 'Tech Summit 2023',    staff: 45, status: 'On Track' },
]

const STATUS_BADGE: Record<string, string> = {
  'On Track': 'bg-emerald-100 text-emerald-700',
  'Critical': 'bg-red-100 text-red-700',
  'Filling':  'bg-amber-100 text-amber-700',
}
const PROGRESS_BAR: Record<string, string> = {
  'On Track': 'bg-emerald-500',
  'Critical': 'bg-red-500',
  'Filling':  'bg-amber-500',
}

export default function DirectorDashboard() {
  const navigate = useNavigate()

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
            {liveEvents.map(ev => {
              const pct = Math.round((ev.checked / ev.total) * 100)
              return (
                <div key={ev.name} className="px-4 md:px-6 py-3 md:py-4 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                      <p className="font-semibold text-slate-900 text-sm">{ev.name}</p>
                      <span className={`text-[11px] px-2 py-0.5 rounded-full font-semibold ${STATUS_BADGE[ev.status]}`}>{ev.status}</span>
                    </div>
                    <p className="text-slate-400 text-xs">{ev.venue} · {ev.time}</p>
                  </div>
                  <div className="flex items-center gap-3 sm:w-40 sm:shrink-0">
                    <div className="flex-1 sm:flex-none sm:w-40">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-400">{ev.checked}/{ev.total}</span>
                        <span className="font-semibold text-slate-700">{pct}%</span>
                      </div>
                      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${PROGRESS_BAR[ev.status]}`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                    <button onClick={() => navigate('/events/1')} className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100 shrink-0">
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
              {performers.map(p => (
                <div key={p.name} className="flex items-center gap-3">
                  <Avatar name={p.name} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900 truncate">{p.name}</p>
                    <p className="text-xs text-slate-400">{p.role}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs font-bold text-amber-500">{p.rating} ★</p>
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
              {alerts.map((a, i) => (
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
          {upcoming.map(ev => (
            <div key={ev.name} className="px-4 md:px-6 py-3.5 flex items-center gap-3 md:gap-6">
              <span className="text-xs font-bold text-slate-400 w-14 shrink-0">{ev.date}</span>
              <p className="text-sm font-semibold text-slate-900 flex-1 truncate">{ev.name}</p>
              <span className={`text-xs px-2 py-0.5 rounded-full font-semibold hidden sm:inline ${STATUS_BADGE[ev.status]}`}>{ev.status}</span>
              <span className="text-xs text-slate-400 hidden md:inline">{ev.staff} staff</span>
              <button onClick={() => navigate('/events/1')} className="text-xs text-blue-600 font-medium shrink-0">Details →</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
