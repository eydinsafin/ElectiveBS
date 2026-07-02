import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, ChevronDown, MapPin, Clock, Users, Calendar, Sparkles, Search, Copy } from 'lucide-react'
import { useEvents, fmtDate, fmtTime, STATUS_BADGE, PROGRESS_BAR } from '../context/EventsContext'
import { useToast } from '../context/ToastContext'

type StatusFilter = 'All' | 'On Track' | 'Filling' | 'Critical' | 'Planning'
const SORT_OPTIONS = ['Date (Newest)', 'Status', 'Staff Progress']
const STATUS_FILTERS: StatusFilter[] = ['All', 'On Track', 'Filling', 'Critical', 'Planning']

const STATUS_FILTER_BADGE: Record<StatusFilter, string> = {
  All:        'bg-slate-100 text-slate-600',
  'On Track': 'bg-emerald-100 text-emerald-700',
  Filling:    'bg-amber-100 text-amber-700',
  Critical:   'bg-red-100 text-red-700',
  Planning:   'bg-blue-100 text-blue-700',
}

export default function EventsPage() {
  const navigate = useNavigate()
  const { events, cloneEvent } = useEvents()
  const toast = useToast()
  const [sort, setSort]               = useState('Date (Newest)')
  const [showSort, setShowSort]       = useState(false)
  const [search, setSearch]           = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('All')

  const sorted = [...events]
    .filter(ev => {
      const matchesStatus = statusFilter === 'All' || ev.status === statusFilter
      const matchesSearch = !search || ev.name.toLowerCase().includes(search.toLowerCase()) || ev.location.toLowerCase().includes(search.toLowerCase())
      return matchesStatus && matchesSearch
    })
    .sort((a, b) => {
      if (sort === 'Status')        return a.status.localeCompare(b.status)
      if (sort === 'Staff Progress') return (b.filled / (b.total || 1)) - (a.filled / (a.total || 1))
      return b.date.localeCompare(a.date)
    })

  const critical = events.filter(e => e.status === 'Critical').length
  const filling  = events.filter(e => e.status === 'Filling').length
  const avgAtt   = events.length > 0
    ? Math.round(events.reduce((a, e) => a + (e.total > 0 ? (e.filled / e.total) * 100 : 0), 0) / events.length)
    : 0

  return (
    <div className="p-4 md:p-8 max-w-[1400px]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 md:mb-7">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900">Events</h1>
          <p className="text-slate-500 text-sm mt-1">Manage and monitor operational status across all events</p>
        </div>
        <button onClick={() => navigate('/events/create')} className="flex items-center gap-2 px-3 md:px-4 py-2 bg-amber-600 text-white rounded-lg text-sm font-semibold hover:bg-amber-700 transition-colors shadow-md shadow-amber-600/20 self-start sm:self-auto">
          <Plus size={15} />
          <span className="hidden sm:inline">Create New Event</span>
          <span className="sm:hidden">New</span>
        </button>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-5 mb-6 md:mb-7">
        {[
          { label: 'Total Events',   value: events.length.toString(), sub: 'All time',              color: 'text-amber-600' },
          { label: 'Critical State', value: critical.toString(),      sub: 'Need immediate action', color: 'text-red-600' },
          { label: 'Filling Shifts', value: filling.toString(),       sub: 'Below target staffing', color: 'text-amber-600' },
          { label: 'Avg Fill Rate',  value: events.length > 0 ? `${avgAtt}%` : '—', sub: 'Across all events', color: 'text-emerald-600' },
        ].map(({ label, value, sub, color }) => (
          <div key={label} className="card-hover bg-white rounded-xl border border-slate-200 p-4 md:p-5">
            <p className="text-[10px] md:text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 md:mb-3">{label}</p>
            <p className={`text-2xl md:text-3xl font-bold ${color}`}>{value}</p>
            <p className="text-slate-400 text-xs mt-1 hidden md:block">{sub}</p>
          </div>
        ))}
      </div>

      {/* Search + Status filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search events by name or location..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 pr-3 py-2 w-full border border-slate-200 bg-white rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-50 transition-colors"
          />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {STATUS_FILTERS.map(f => (
            <button
              key={f}
              onClick={() => setStatusFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors border ${
                statusFilter === f
                  ? `${STATUS_FILTER_BADGE[f]} border-current/20 shadow-sm`
                  : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
              }`}
            >
              {f}
              {f !== 'All' && (
                <span className="ml-1 opacity-70">{events.filter(e => e.status === f).length}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Sort */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-slate-500">{sorted.length} event{sorted.length !== 1 ? 's' : ''}</p>
        <div className="relative">
          <button onClick={() => setShowSort(v => !v)} className="flex items-center gap-2 px-3 py-2 border border-slate-200 bg-white rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50">
            <span className="hidden sm:inline">Sort: </span>{sort}
            <ChevronDown size={13} className={`text-slate-400 transition-transform ${showSort ? 'rotate-180' : ''}`} />
          </button>
          {showSort && (
            <div className="absolute right-0 mt-1 w-48 bg-white border border-slate-200 rounded-xl shadow-lg z-10 overflow-hidden">
              {SORT_OPTIONS.map(opt => (
                <button key={opt} onClick={() => { setSort(opt); setShowSort(false) }} className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${sort === opt ? 'bg-amber-50 text-amber-700 font-semibold' : 'text-slate-700 hover:bg-slate-50'}`}>
                  {opt}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Event cards */}
      <div className="space-y-3 md:space-y-4 mb-6">
        {sorted.length === 0 && (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
            <p className="text-slate-400 text-sm">
              {search || statusFilter !== 'All'
                ? 'No events match your search or filter.'
                : 'No events yet. Create your first event to get started.'}
            </p>
          </div>
        )}
        {sorted.map(ev => {
          const pct = ev.total > 0 ? Math.round((ev.filled / ev.total) * 100) : 0
          return (
            <div key={ev.id} className="card-hover bg-white rounded-xl border border-slate-200 p-4 md:p-5">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="min-w-0">
                  <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border inline-block mb-1.5 ${STATUS_BADGE[ev.status]} border-current/20`}>{ev.status}</span>
                  <h3 className="text-base md:text-lg font-bold text-slate-900 leading-tight">{ev.name}</h3>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  {ev.status === 'Critical' && (
                    <button onClick={() => navigate(`/events/${ev.id}`)} className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs font-bold hover:bg-red-700">Hire Now</button>
                  )}
                  <button
                    onClick={() => { cloneEvent(ev.id); toast.show(`"${ev.name}" duplicated`) }}
                    title="Duplicate event"
                    className="p-1.5 border border-slate-200 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    <Copy size={13} />
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap gap-x-4 gap-y-1 text-slate-400 text-xs mb-3">
                <span className="flex items-center gap-1"><MapPin size={12} />{ev.location}</span>
                <span className="flex items-center gap-1"><Clock size={12} />{fmtTime(ev.from)}{ev.to ? ` – ${fmtTime(ev.to)}` : ''}</span>
                <span className="flex items-center gap-1"><Calendar size={12} />{fmtDate(ev.date)}</span>
              </div>

              <div className="mb-4">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="flex items-center gap-1 text-slate-500"><Users size={12} />Staffing</span>
                  <span className="font-bold text-slate-900">{ev.filled}/{ev.total} · {pct}%</span>
                </div>
                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${PROGRESS_BAR[ev.status]}`} style={{ width: `${pct}%` }} />
                </div>
              </div>

              <div className="flex gap-2 flex-wrap">
                <button onClick={() => navigate(`/events/${ev.id}/staff`)} className="flex-1 sm:flex-none px-3 py-2 border border-slate-200 bg-white text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-50 transition-colors">Manage Staff</button>
                <button onClick={() => navigate(`/events/${ev.id}/vendors`)} className="flex-1 sm:flex-none px-3 py-2 border border-slate-200 bg-white text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-50 transition-colors">Manage Vendors</button>
                <button onClick={() => navigate(`/events/${ev.id}`)} className="flex-1 sm:flex-none px-3 py-2 bg-amber-600 text-white rounded-lg text-xs font-semibold hover:bg-amber-700 transition-colors">View Details</button>
              </div>
            </div>
          )
        })}
      </div>

      {/* Promo */}
      <div className="bg-gradient-to-r from-[#0F1629] to-slate-700 rounded-2xl p-5 md:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center shrink-0"><Sparkles size={20} className="text-white" /></div>
          <div>
            <p className="text-white font-bold">Ready to create your next event?</p>
            <p className="text-slate-300 text-sm mt-0.5">Post it and get matched with verified staff instantly</p>
          </div>
        </div>
        <button onClick={() => navigate('/events/create')} className="px-5 py-2.5 bg-amber-500 text-white rounded-lg font-bold text-sm hover:bg-amber-600 shrink-0">Get Started</button>
      </div>
    </div>
  )
}
