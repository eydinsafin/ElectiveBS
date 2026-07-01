import { useNavigate } from 'react-router-dom'
import { Bell, Plus, ChevronRight, AlertTriangle } from 'lucide-react'
import { useEvents, fmtDate, STATUS_BADGE, PROGRESS_BAR } from '../context/EventsContext'
import { useToast } from '../context/ToastContext'

export default function DirectorDashboard() {
  const navigate = useNavigate()
  const { events } = useEvents()
  const toast = useToast()
  const upcoming = [...events].sort((a, b) => a.date.localeCompare(b.date)).slice(0, 5)

  const totalPositions = events.reduce((a, e) => a + e.total, 0)
  const totalFilled    = events.reduce((a, e) => a + e.filled, 0)
  const totalOpen      = totalPositions - totalFilled
  const utilPct        = totalPositions > 0 ? Math.round((totalFilled / totalPositions) * 100) : 0
  const estLabourCost  = events.reduce((a, e) =>
    a + e.staffRoles.reduce((b, r) => b + r.count * r.rate * r.hours, 0), 0)
  const criticalCount  = events.filter(e => e.status === 'Critical').length

  const alerts = events
    .filter(e => e.status === 'Critical')
    .map(e => ({
      msg: `${e.name} — ${e.filled}/${e.total} filled (${Math.round((e.filled / e.total) * 100)}%)`,
      eventId: e.id,
    }))

  return (
    <div className="p-4 md:p-8 max-w-[1400px]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 pt-2">
        <div>
          <p className="text-xs font-semibold text-amber-600 uppercase tracking-widest mb-1">Elite Agency</p>
          <h1 className="text-3xl md:text-4xl text-slate-900">Director Dashboard</h1>
          <p className="text-slate-500 text-sm mt-1">Real-time operational overview</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => toast.show(
              criticalCount > 0
                ? `${criticalCount} event${criticalCount !== 1 ? 's' : ''} ${criticalCount !== 1 ? 'need' : 'needs'} urgent staffing — check Critical Alerts below`
                : 'No new notifications — all events on track',
              criticalCount > 0 ? 'error' : 'info'
            )}
            className="relative w-9 h-9 rounded-lg border border-slate-200 bg-white flex items-center justify-center hover:bg-slate-50"
          >
            <Bell size={17} className="text-slate-500" />
            {criticalCount > 0 && <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-red-500 rounded-full" />}
          </button>
          <button
            onClick={() => navigate('/events/create')}
            className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg text-sm font-semibold hover:bg-amber-700 shadow-md shadow-amber-600/20"
          >
            <Plus size={15} />
            <span className="hidden sm:inline">Schedule New Event</span>
            <span className="sm:hidden">New Event</span>
          </button>
        </div>
      </div>

      {/* Asymmetric KPI row */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 mb-7">
        {/* Hero stat — brand dark card */}
        <div className="lg:col-span-3 bg-[#0F1629] rounded-2xl p-6 md:p-8 flex flex-col justify-between min-h-[180px]">
          <div>
            <p className="text-xs font-semibold text-amber-400 uppercase tracking-widest mb-3">Est. Labour Cost</p>
            <p className="text-4xl md:text-5xl font-display text-white leading-none">
              ${estLabourCost.toLocaleString()}
            </p>
            <p className="text-slate-400 text-sm mt-2">Total roles × hourly rate × shift hours</p>
          </div>
          <div className="mt-6 pt-5 border-t border-white/10 grid grid-cols-3 gap-4">
            <div>
              <p className="text-xl font-bold text-white">{events.length}</p>
              <p className="text-xs text-slate-500 mt-0.5">Active events</p>
            </div>
            <div>
              <p className="text-xl font-bold text-white">{totalFilled}</p>
              <p className="text-xs text-slate-500 mt-0.5">Positions filled</p>
            </div>
            <div>
              <p className={`text-xl font-bold ${totalOpen > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>{totalOpen}</p>
              <p className="text-xs text-slate-500 mt-0.5">Still open</p>
            </div>
          </div>
        </div>

        {/* Two stacked smaller stat cards */}
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
          {/* Staff Utilisation */}
          <div className="card-hover bg-white rounded-2xl border border-slate-200 p-5 flex flex-col justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">Staff Utilisation</p>
              <div className="flex items-end gap-2 mb-3">
                <p className="text-3xl font-bold text-slate-900">{utilPct}%</p>
                <span className={`text-xs font-semibold mb-1 px-2 py-0.5 rounded-full ${
                  utilPct >= 80 ? 'bg-emerald-50 text-emerald-700'
                  : utilPct >= 50 ? 'bg-amber-50 text-amber-700'
                  : 'bg-red-50 text-red-700'
                }`}>
                  {utilPct >= 80 ? 'On Track' : utilPct >= 50 ? 'Filling' : 'Critical'}
                </span>
              </div>
              <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${utilPct >= 80 ? 'bg-emerald-500' : utilPct >= 50 ? 'bg-amber-500' : 'bg-red-500'}`}
                  style={{ width: `${utilPct}%` }}
                />
              </div>
            </div>
            <p className="text-xs text-slate-400 mt-3">{totalFilled} of {totalPositions} total positions across all events</p>
          </div>

          {/* Open Positions */}
          <div className="card-hover bg-white rounded-2xl border border-slate-200 p-5 flex flex-col justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">Open Positions</p>
              <p className={`text-3xl font-bold ${totalOpen > 10 ? 'text-red-600' : totalOpen > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
                {totalOpen}
              </p>
            </div>
            <div className="mt-3">
              {criticalCount > 0 ? (
                <p className="text-xs font-semibold text-red-600">{criticalCount} event{criticalCount !== 1 ? 's' : ''} critically understaffed</p>
              ) : (
                <p className="text-xs font-semibold text-emerald-600">All events staffed on track</p>
              )}
              <p className="text-xs text-slate-400 mt-0.5">Across {events.length} active event{events.length !== 1 ? 's' : ''}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 mb-6">
        {/* Live Event Monitor */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200">
          <div className="px-4 md:px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <h2 className="font-semibold text-slate-900">Live Event Monitor</h2>
            </div>
            <button
              onClick={() => navigate('/events')}
              className="text-sm text-amber-600 font-medium flex items-center gap-1 hover:text-amber-700"
            >
              View All <ChevronRight size={14} />
            </button>
          </div>
          <div className="divide-y divide-slate-100">
            {events.length === 0 && (
              <div className="px-6 py-12 text-center">
                <p className="text-slate-400 text-sm mb-2">No events tracked yet.</p>
                <button
                  onClick={() => navigate('/events/create')}
                  className="text-sm font-semibold text-amber-600 hover:text-amber-700"
                >
                  Schedule your first event →
                </button>
              </div>
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
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="w-24 md:w-32 shrink-0">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-400">{ev.filled}/{ev.total}</span>
                        <span className="font-semibold text-slate-700">{pct}%</span>
                      </div>
                      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${PROGRESS_BAR[ev.status]}`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                    <button
                      onClick={() => navigate(`/events/${ev.id}`)}
                      className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 shrink-0"
                    >
                      Manage
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-4">
          {/* Top Performers — intentional empty state */}
          <div className="bg-white rounded-xl border border-slate-200">
            <div className="px-5 py-4 border-b border-slate-100">
              <h2 className="font-semibold text-slate-900">Top Performers</h2>
            </div>
            <div className="p-5">
              <p className="text-sm text-slate-500 leading-relaxed">
                Performance ratings are collected automatically after each completed event. Assign staff to events to start tracking.
              </p>
              <button
                onClick={() => navigate('/staff')}
                className="mt-3 text-sm font-semibold text-amber-600 hover:text-amber-700"
              >
                View staff directory →
              </button>
            </div>
          </div>

          {/* Critical Alerts */}
          <div className="bg-white rounded-xl border border-slate-200">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="font-semibold text-slate-900">Critical Alerts</h2>
              {alerts.length > 0 && (
                <span className="text-xs font-bold text-white bg-red-500 rounded-full w-5 h-5 flex items-center justify-center leading-none">
                  {alerts.length}
                </span>
              )}
            </div>
            <div className="p-4">
              {alerts.length === 0 ? (
                <div className="flex items-center gap-2.5 py-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                  <p className="text-sm text-slate-500">All events operational — no critical flags.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {alerts.map((a, i) => (
                    <div key={i} className="flex items-start gap-2.5 p-3 rounded-lg bg-red-50">
                      <AlertTriangle size={13} className="mt-0.5 shrink-0 text-red-500" />
                      <p className="text-xs flex-1 leading-relaxed text-red-700">{a.msg}</p>
                      <button
                        onClick={() => navigate(`/events/${a.eventId}/staff`)}
                        className="text-xs text-amber-600 font-semibold shrink-0 hover:text-amber-700"
                      >
                        Fill Now
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Upcoming Events */}
      <div className="bg-white rounded-xl border border-slate-200">
        <div className="px-4 md:px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-semibold text-slate-900">Upcoming Events</h2>
          <button
            onClick={() => navigate('/schedule')}
            className="text-sm text-amber-600 font-medium flex items-center gap-1 hover:text-amber-700"
          >
            Full Schedule <ChevronRight size={14} />
          </button>
        </div>
        <div className="divide-y divide-slate-100">
          {upcoming.length === 0 && (
            <div className="px-6 py-10 text-center">
              <p className="text-slate-400 text-sm mb-2">No upcoming events scheduled.</p>
              <button
                onClick={() => navigate('/events/create')}
                className="text-sm font-semibold text-amber-600 hover:text-amber-700"
              >
                Schedule your first event →
              </button>
            </div>
          )}
          {upcoming.map(ev => (
            <div key={ev.id} className="px-4 md:px-6 py-3.5 flex items-center gap-3 md:gap-6">
              <span className="text-xs font-bold text-slate-400 w-16 shrink-0">{fmtDate(ev.date).replace(/,.*/, '')}</span>
              <p className="text-sm font-semibold text-slate-900 flex-1 truncate">{ev.name}</p>
              <span className={`text-xs px-2 py-0.5 rounded-full font-semibold hidden sm:inline ${STATUS_BADGE[ev.status]}`}>{ev.status}</span>
              <span className="text-xs text-slate-400 hidden md:inline">{ev.total} staff needed</span>
              <button
                onClick={() => navigate(`/events/${ev.id}`)}
                className="text-xs text-amber-600 font-medium shrink-0 hover:text-amber-700"
              >
                Details →
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
