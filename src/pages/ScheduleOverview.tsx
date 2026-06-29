import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, ChevronRight, Plus, Filter } from 'lucide-react'
import { useEvents, fmtDate, fmtTime, STATUS_BADGE } from '../context/EventsContext'

const WEEK_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']

function generateCalendar(year: number, month: number): (number | null)[][] {
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]
  while (cells.length % 7 !== 0) cells.push(null)
  const weeks: (number | null)[][] = []
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7))
  return weeks
}

const EVENT_CLS: Record<string, string> = {
  'On Track': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'Critical': 'bg-red-50 text-red-700 border-red-200',
  'Filling':  'bg-amber-50 text-amber-700 border-amber-200',
  'Planning': 'bg-blue-50 text-blue-700 border-blue-200',
}

export default function ScheduleOverview() {
  const navigate = useNavigate()
  const { events } = useEvents()

  const today = new Date()
  const [viewYear, setViewYear]   = useState(today.getFullYear())
  const [viewMonth, setViewMonth] = useState(today.getMonth())
  const [selected, setSelected]   = useState<number | null>(today.getDate())
  const [activeFilter, setActiveFilter] = useState('All Events')
  const [showSidebar, setShowSidebar]   = useState(false)
  const [view, setView] = useState<'month' | 'week'>('month')

  const prevMonth = () => {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11) }
    else setViewMonth(m => m - 1)
    setSelected(null)
  }
  const nextMonth = () => {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0) }
    else setViewMonth(m => m + 1)
    setSelected(null)
  }

  const dateStr = (day: number) =>
    `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`

  const eventsForDay = (day: number) =>
    events.filter(e => e.date === dateStr(day))

  const calendar = generateCalendar(viewYear, viewMonth)

  const upcomingFiltered = events
    .filter(e => {
      if (activeFilter === 'Critical') return e.status === 'Critical'
      if (activeFilter === 'Filling')  return e.status === 'Filling'
      if (activeFilter === 'On-track') return e.status === 'On Track'
      return true
    })
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 6)

  const selectedEvents = selected ? eventsForDay(selected) : []

  const qfilters = [
    { label: 'All Events', count: events.length },
    { label: 'Critical',   count: events.filter(e => e.status === 'Critical').length },
    { label: 'Filling',    count: events.filter(e => e.status === 'Filling').length },
    { label: 'On-track',   count: events.filter(e => e.status === 'On Track').length },
  ]

  const isToday = (day: number) =>
    day === today.getDate() && viewMonth === today.getMonth() && viewYear === today.getFullYear()

  return (
    <div className="p-4 md:p-8 max-w-[1400px]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6 md:mb-7">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900">Schedule Overview</h1>
          <p className="text-slate-500 text-sm mt-1">Manage and monitor staffing across your event calendar</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex bg-slate-100 rounded-lg p-1">
            {(['month', 'week'] as const).map(v => (
              <button key={v} onClick={() => setView(v)} className={`px-3 py-1.5 rounded-md text-sm font-medium capitalize transition-all ${view === v ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>{v}</button>
            ))}
          </div>
          <button onClick={() => setShowSidebar(v => !v)} className="lg:hidden p-2 border border-slate-200 bg-white rounded-lg hover:bg-slate-50">
            <Filter size={16} className="text-slate-500" />
          </button>
          <button onClick={() => navigate('/events/create')} className="flex items-center gap-2 px-3 md:px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors shadow-md shadow-blue-600/20">
            <Plus size={15} />
            <span className="hidden sm:inline">Create Event</span>
            <span className="sm:hidden">New</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 md:gap-6">
        {/* Calendar */}
        <div className="lg:col-span-3 bg-white rounded-xl border border-slate-200">
          {/* Month nav */}
          <div className="px-4 md:px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <button onClick={prevMonth} className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center">
              <ChevronLeft size={17} className="text-slate-500" />
            </button>
            <h2 className="font-semibold text-slate-900">{MONTHS[viewMonth]} {viewYear}</h2>
            <button onClick={nextMonth} className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center">
              <ChevronRight size={17} className="text-slate-500" />
            </button>
          </div>

          <div className="p-2 md:p-4">
            {/* Day headers */}
            <div className="grid grid-cols-7 mb-1">
              {WEEK_DAYS.map(d => (
                <div key={d} className="text-center text-[10px] md:text-[11px] font-semibold text-slate-400 uppercase tracking-wider py-1.5">
                  <span className="hidden sm:inline">{d}</span>
                  <span className="sm:hidden">{d[0]}</span>
                </div>
              ))}
            </div>

            {/* Grid */}
            <div className="space-y-0.5 md:space-y-1">
              {calendar.map((week, wi) => (
                <div key={wi} className="grid grid-cols-7 gap-0.5 md:gap-1">
                  {week.map((day, ci) => {
                    if (!day) return <div key={ci} className="h-14 md:h-24 rounded-lg bg-slate-50/50" />
                    const isSel = selected === day
                    const dayEvents = eventsForDay(day)
                    return (
                      <div
                        key={ci}
                        onClick={() => setSelected(day)}
                        className={`h-14 md:h-24 rounded-lg p-1 md:p-2 cursor-pointer border transition-colors ${
                          isSel ? 'border-blue-400 bg-blue-50' : 'border-transparent hover:border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <div className={`w-6 h-6 md:w-7 md:h-7 flex items-center justify-center rounded-full text-xs md:text-sm font-semibold ${
                          isSel ? 'bg-blue-600 text-white' : isToday(day) ? 'bg-slate-200 text-slate-900 font-bold' : 'text-slate-700'
                        }`}>
                          {day}
                        </div>
                        {dayEvents.slice(0, 2).map((ev, ei) => (
                          <button
                            key={ei}
                            onClick={e => { e.stopPropagation(); navigate(`/events/${ev.id}`) }}
                            className={`mt-0.5 md:mt-1 w-full text-left px-1 py-0.5 rounded border text-[8px] md:text-[10px] font-semibold truncate ${EVENT_CLS[ev.status]}`}
                          >
                            <span className="hidden md:inline">{ev.name.split(' ').slice(0, 2).join(' ')}</span>
                            <span className="md:hidden">•</span>
                          </button>
                        ))}
                        {dayEvents.length > 2 && (
                          <p className="text-[8px] text-slate-400 mt-0.5 hidden md:block">+{dayEvents.length - 2} more</p>
                        )}
                      </div>
                    )
                  })}
                </div>
              ))}
            </div>
          </div>

          {/* Selected day events */}
          {selected && selectedEvents.length > 0 && (
            <div className="px-4 md:px-6 py-4 border-t border-slate-100">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">{fmtDate(dateStr(selected))}</p>
              <div className="space-y-2">
                {selectedEvents.map(ev => (
                  <button key={ev.id} onClick={() => navigate(`/events/${ev.id}`)} className="w-full text-left flex items-center gap-3 p-2.5 rounded-lg hover:bg-slate-50 border border-slate-100 transition-colors">
                    <div className={`w-2 h-2 rounded-full shrink-0 ${ev.status === 'On Track' ? 'bg-emerald-500' : ev.status === 'Critical' ? 'bg-red-500' : ev.status === 'Filling' ? 'bg-amber-500' : 'bg-blue-400'}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-900 truncate">{ev.name}</p>
                      <p className="text-xs text-slate-400">{fmtTime(ev.from)} – {fmtTime(ev.to)} · {ev.location}</p>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${STATUS_BADGE[ev.status]}`}>{ev.status}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Legend */}
          <div className="px-4 md:px-6 py-3 border-t border-slate-100 flex flex-wrap items-center gap-3 md:gap-6">
            {[
              { label: 'Today',    color: 'bg-slate-300' },
              { label: 'Selected', color: 'bg-blue-600' },
              { label: 'On Track', color: 'bg-emerald-500' },
              { label: 'Critical', color: 'bg-red-500' },
              { label: 'Filling',  color: 'bg-amber-500' },
              { label: 'Planning', color: 'bg-blue-400' },
            ].map(({ label, color }) => (
              <div key={label} className="flex items-center gap-1.5">
                <span className={`w-2 h-2 md:w-2.5 md:h-2.5 rounded-full ${color}`} />
                <span className="text-xs text-slate-500">{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <div className={`space-y-4 ${showSidebar ? 'block' : 'hidden lg:block'}`}>
          {/* Quick Filters */}
          <div className="bg-white rounded-xl border border-slate-200">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
              <Filter size={14} className="text-slate-400" />
              <h3 className="font-semibold text-slate-900 text-sm">Quick Filters</h3>
            </div>
            <div className="p-3 space-y-0.5">
              {qfilters.map(f => (
                <button key={f.label} onClick={() => setActiveFilter(f.label)} className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-colors ${activeFilter === f.label ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-slate-600 hover:bg-slate-50'}`}>
                  <span>{f.label}</span>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${activeFilter === f.label ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500'}`}>{f.count}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Upcoming Details */}
          <div className="bg-white rounded-xl border border-slate-200">
            <div className="px-5 py-4 border-b border-slate-100">
              <h3 className="font-semibold text-slate-900 text-sm">Upcoming Events</h3>
            </div>
            <div className="divide-y divide-slate-100">
              {upcomingFiltered.length === 0 ? (
                <p className="px-5 py-8 text-center text-sm text-slate-400">No events.</p>
              ) : upcomingFiltered.map(ev => (
                <button key={ev.id} onClick={() => navigate(`/events/${ev.id}`)} className="w-full px-5 py-3.5 text-left hover:bg-slate-50 transition-colors">
                  <p className="text-sm font-semibold text-slate-900 truncate">{ev.name}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{fmtDate(ev.date)} · {ev.location}</p>
                  <div className="flex items-center justify-between mt-1.5">
                    <span className="text-xs font-semibold text-slate-500">{ev.filled}/{ev.total} staff</span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${STATUS_BADGE[ev.status]}`}>{ev.status}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
