import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, ChevronDown, MapPin, Clock, Users, Calendar, Sparkles } from 'lucide-react'

const ALL_EVENTS = [
  { id: '1', name: 'Nike Product Launch', venue: 'Grand Convention Hall', time: '08:00 – 18:00', date: 'Oct 24, 2023', status: 'On Track', filled: 42, total: 50 },
  { id: '2', name: 'BMW Roadshow',        venue: 'City Auto Center',      time: '10:00 – 20:00', date: 'Oct 26, 2023', status: 'Critical', filled: 8,  total: 20 },
  { id: '3', name: 'Tech Summit 2023',    venue: 'Innovation Hub',        time: '09:00 – 17:00', date: 'Oct 28, 2023', status: 'On Track', filled: 45, total: 50 },
  { id: '4', name: 'City Music Festival', venue: 'Central Park Stage',    time: '14:00 – 23:00', date: 'Nov 2, 2023',  status: 'Filling',  filled: 18, total: 30 },
]

const SORT_OPTIONS = ['Date (Newest)', 'Status', 'Staff Progress']

const STATUS_BADGE: Record<string, string> = {
  'On Track': 'bg-emerald-100 text-emerald-700 border-emerald-200',
  'Critical': 'bg-red-100 text-red-700 border-red-200',
  'Filling':  'bg-amber-100 text-amber-700 border-amber-200',
}
const PROGRESS_BAR: Record<string, string> = {
  'On Track': 'bg-emerald-500',
  'Critical': 'bg-red-500',
  'Filling':  'bg-amber-500',
}

export default function EventsPage() {
  const navigate = useNavigate()
  const [sort, setSort] = useState('Date (Newest)')
  const [showSort, setShowSort] = useState(false)

  const sorted = [...ALL_EVENTS].sort((a, b) => {
    if (sort === 'Status') return a.status.localeCompare(b.status)
    if (sort === 'Staff Progress') return (b.filled / b.total) - (a.filled / a.total)
    return 0
  })

  return (
    <div className="p-4 md:p-8 max-w-[1400px]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 md:mb-7">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900">Events</h1>
          <p className="text-slate-500 text-sm mt-1">Manage and monitor operational status across all events</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-3 py-2 border border-slate-200 bg-white rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
            <Calendar size={14} />
            <span className="hidden sm:inline">Oct 2023</span>
            <ChevronDown size={12} className="text-slate-400" />
          </button>
          <button onClick={() => navigate('/events/create')} className="flex items-center gap-2 px-3 md:px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors shadow-md shadow-blue-600/20">
            <Plus size={15} />
            <span className="hidden sm:inline">Create New Event</span>
            <span className="sm:hidden">New</span>
          </button>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-5 mb-6 md:mb-7">
        {[
          { label: 'Total Events',   value: '14',  sub: 'This month',           color: 'text-blue-600' },
          { label: 'Critical State', value: '2',   sub: 'Need immediate action', color: 'text-red-600' },
          { label: 'Filling Shifts', value: '5',   sub: 'Below target staffing', color: 'text-amber-600' },
          { label: 'Avg Attendance', value: '92%', sub: 'Across all events',     color: 'text-emerald-600' },
        ].map(({ label, value, sub, color }) => (
          <div key={label} className="bg-white rounded-xl border border-slate-200 p-4 md:p-5">
            <p className="text-[10px] md:text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 md:mb-3">{label}</p>
            <p className={`text-2xl md:text-3xl font-bold ${color}`}>{value}</p>
            <p className="text-slate-400 text-xs mt-1 hidden md:block">{sub}</p>
          </div>
        ))}
      </div>

      {/* Sort */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-slate-500">{sorted.length} events</p>
        <div className="relative">
          <button onClick={() => setShowSort(v => !v)} className="flex items-center gap-2 px-3 py-2 border border-slate-200 bg-white rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50">
            <span className="hidden sm:inline">Sort: </span>{sort}
            <ChevronDown size={13} className={`text-slate-400 transition-transform ${showSort ? 'rotate-180' : ''}`} />
          </button>
          {showSort && (
            <div className="absolute right-0 mt-1 w-48 bg-white border border-slate-200 rounded-xl shadow-lg z-10 overflow-hidden">
              {SORT_OPTIONS.map(opt => (
                <button key={opt} onClick={() => { setSort(opt); setShowSort(false) }} className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${sort === opt ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-slate-700 hover:bg-slate-50'}`}>
                  {opt}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Event cards */}
      <div className="space-y-3 md:space-y-4 mb-6">
        {sorted.map(ev => {
          const pct = Math.round((ev.filled / ev.total) * 100)
          return (
            <div key={ev.id} className="bg-white rounded-xl border border-slate-200 p-4 md:p-5">
              {/* Top row */}
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="min-w-0">
                  <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border inline-block mb-1.5 ${STATUS_BADGE[ev.status]}`}>{ev.status}</span>
                  <h3 className="text-base md:text-lg font-bold text-slate-900 leading-tight">{ev.name}</h3>
                </div>
                {ev.status === 'Critical' && (
                  <button onClick={() => navigate(`/events/${ev.id}/staff`)} className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs font-bold hover:bg-red-700 shrink-0">
                    Hire Now
                  </button>
                )}
              </div>

              {/* Meta */}
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-slate-400 text-xs mb-3">
                <span className="flex items-center gap-1"><MapPin size={12} />{ev.venue}</span>
                <span className="flex items-center gap-1"><Clock size={12} />{ev.time}</span>
                <span className="flex items-center gap-1"><Calendar size={12} />{ev.date}</span>
              </div>

              {/* Progress */}
              <div className="mb-4">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="flex items-center gap-1 text-slate-500"><Users size={12} />Staffing</span>
                  <span className="font-bold text-slate-900">{ev.filled}/{ev.total} · {pct}%</span>
                </div>
                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${PROGRESS_BAR[ev.status]}`} style={{ width: `${pct}%` }} />
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button onClick={() => navigate(`/events/${ev.id}/staff`)} className="flex-1 sm:flex-none px-3 py-2 border border-slate-200 bg-white text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-50 transition-colors">
                  Manage Staff
                </button>
                <button onClick={() => navigate(`/events/${ev.id}`)} className="flex-1 sm:flex-none px-3 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition-colors">
                  View Details
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* Promo */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-500 rounded-2xl p-5 md:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
            <Sparkles size={20} className="text-white" />
          </div>
          <div>
            <p className="text-white font-bold">Ready to create your next event?</p>
            <p className="text-blue-100 text-sm mt-0.5">Post it and get matched with verified staff instantly</p>
          </div>
        </div>
        <button onClick={() => navigate('/events/create')} className="px-5 py-2.5 bg-white text-blue-600 rounded-lg font-bold text-sm hover:bg-blue-50 shrink-0">
          Get Started
        </button>
      </div>
    </div>
  )
}
