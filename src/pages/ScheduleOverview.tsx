import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, ChevronRight, Plus, Filter } from 'lucide-react'

const WEEK_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

type CalEvent = { name: string; staff: string; status: string }
type CalCell  = { day: number; events?: CalEvent[] } | null

const CALENDAR: CalCell[][] = [
  [{ day: 1 }, { day: 2 }, { day: 3 }, { day: 4 }, { day: 5 }, { day: 6 }, { day: 7 }],
  [{ day: 8 }, { day: 9 }, { day: 10 }, { day: 11 }, { day: 12 }, { day: 13 }, { day: 14 }],
  [{ day: 15 }, { day: 16 }, { day: 17 }, { day: 18 }, { day: 19 }, { day: 20 }, { day: 21 }],
  [
    { day: 22 }, { day: 23 },
    { day: 24, events: [{ name: 'Nike Product Launch', staff: '42/50', status: 'On Track' }] },
    { day: 25 },
    { day: 26, events: [{ name: 'BMW Roadshow', staff: '8/20', status: 'Critical' }] },
    { day: 27 },
    { day: 28, events: [{ name: 'Tech Summit 2023', staff: '45/50', status: 'On Track' }] },
  ],
  [{ day: 29 }, { day: 30 }, { day: 31 }, null, null, null, null],
]

const qfilters = [
  { label: 'All Events', count: 14 },
  { label: 'Critical',   count: 2 },
  { label: 'Filling',    count: 5 },
  { label: 'On-track',   count: 7 },
]

const upcomingDetails = [
  { name: 'Nike Product Launch', date: 'Oct 24', venue: 'Grand Convention Hall', staff: '42/50', status: 'On Track' },
  { name: 'BMW Roadshow',        date: 'Oct 26', venue: 'City Auto Center',      staff: '8/20',  status: 'Critical' },
  { name: 'Tech Summit 2023',    date: 'Oct 28', venue: 'Innovation Hub',        staff: '45/50', status: 'On Track' },
]

const EVENT_CLS: Record<string, string> = {
  'On Track': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'Critical': 'bg-red-50 text-red-700 border-red-200',
  'Filling':  'bg-amber-50 text-amber-700 border-amber-200',
}

export default function ScheduleOverview() {
  const navigate = useNavigate()
  const [view, setView] = useState<'month' | 'week'>('month')
  const [selected, setSelected] = useState<number | null>(24)
  const [activeFilter, setActiveFilter] = useState('All Events')
  const [showSidebar, setShowSidebar] = useState(false)

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
              <button
                key={v}
                onClick={() => setView(v)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium capitalize transition-all ${
                  view === v ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {v}
              </button>
            ))}
          </div>
          {/* Mobile: filter toggle */}
          <button
            onClick={() => setShowSidebar(v => !v)}
            className="lg:hidden p-2 border border-slate-200 bg-white rounded-lg hover:bg-slate-50"
          >
            <Filter size={16} className="text-slate-500" />
          </button>
          <button
            onClick={() => navigate('/events/create')}
            className="flex items-center gap-2 px-3 md:px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors shadow-md shadow-blue-600/20"
          >
            <Plus size={15} />
            <span className="hidden sm:inline">Create Event</span>
            <span className="sm:hidden">New</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 md:gap-6">
        {/* Calendar — takes full width on mobile, 3/4 on desktop */}
        <div className="lg:col-span-3 bg-white rounded-xl border border-slate-200">
          {/* Month nav */}
          <div className="px-4 md:px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <button className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center">
              <ChevronLeft size={17} className="text-slate-500" />
            </button>
            <h2 className="font-semibold text-slate-900">October 2023</h2>
            <button className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center">
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
            <div className="space-y-1">
              {CALENDAR.map((week, wi) => (
                <div key={wi} className="grid grid-cols-7 gap-0.5 md:gap-1">
                  {week.map((cell, ci) => {
                    if (!cell) return <div key={ci} className="h-14 md:h-24 rounded-lg bg-slate-50/50" />
                    const isSel = selected === cell.day
                    return (
                      <div
                        key={ci}
                        onClick={() => setSelected(cell.day)}
                        className={`h-14 md:h-24 rounded-lg p-1 md:p-2 cursor-pointer border transition-colors ${
                          isSel ? 'border-blue-400 bg-blue-50' : 'border-transparent hover:border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <div className={`w-6 h-6 md:w-7 md:h-7 flex items-center justify-center rounded-full text-xs md:text-sm font-semibold ${
                          isSel ? 'bg-blue-600 text-white' : 'text-slate-700'
                        }`}>
                          {cell.day}
                        </div>
                        {cell.events?.map((ev, ei) => (
                          <button
                            key={ei}
                            onClick={e => { e.stopPropagation(); navigate('/events/1') }}
                            className={`mt-1 w-full text-left px-1 py-0.5 rounded border text-[8px] md:text-[10px] font-semibold truncate ${EVENT_CLS[ev.status]}`}
                          >
                            <span className="hidden md:inline">{ev.name.split(' ').slice(0, 2).join(' ')} · {ev.staff}</span>
                            <span className="md:hidden">{ev.staff}</span>
                          </button>
                        ))}
                      </div>
                    )
                  })}
                </div>
              ))}
            </div>
          </div>

          {/* Legend */}
          <div className="px-4 md:px-6 py-3 border-t border-slate-100 flex flex-wrap items-center gap-3 md:gap-6">
            {[
              { label: 'Selected', color: 'bg-blue-600' },
              { label: 'On-track', color: 'bg-emerald-500' },
              { label: 'Critical', color: 'bg-red-500' },
              { label: 'Filling',  color: 'bg-amber-500' },
            ].map(({ label, color }) => (
              <div key={label} className="flex items-center gap-1.5">
                <span className={`w-2 h-2 md:w-2.5 md:h-2.5 rounded-full ${color}`} />
                <span className="text-xs text-slate-500">{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar — hidden on mobile unless toggled, always visible on desktop */}
        <div className={`space-y-4 ${showSidebar ? 'block' : 'hidden lg:block'}`}>
          {/* Quick Filters */}
          <div className="bg-white rounded-xl border border-slate-200">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
              <Filter size={14} className="text-slate-400" />
              <h3 className="font-semibold text-slate-900 text-sm">Quick Filters</h3>
            </div>
            <div className="p-3 space-y-0.5">
              {qfilters.map(f => (
                <button
                  key={f.label}
                  onClick={() => setActiveFilter(f.label)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-colors ${
                    activeFilter === f.label ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span>{f.label}</span>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                    activeFilter === f.label ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {f.count}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Upcoming Details */}
          <div className="bg-white rounded-xl border border-slate-200">
            <div className="px-5 py-4 border-b border-slate-100">
              <h3 className="font-semibold text-slate-900 text-sm">Upcoming Details</h3>
            </div>
            <div className="divide-y divide-slate-100">
              {upcomingDetails.map(ev => (
                <button
                  key={ev.name}
                  onClick={() => navigate('/events/1')}
                  className="w-full px-5 py-3.5 text-left hover:bg-slate-50 transition-colors"
                >
                  <p className="text-sm font-semibold text-slate-900 truncate">{ev.name}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{ev.date} · {ev.venue}</p>
                  <div className="flex items-center justify-between mt-1.5">
                    <span className="text-xs font-semibold text-slate-500">{ev.staff} staff</span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${EVENT_CLS[ev.status]}`}>{ev.status}</span>
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
