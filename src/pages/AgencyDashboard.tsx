import { useNavigate } from 'react-router-dom'
import { ChevronRight, CheckCircle, AlertTriangle, Clock } from 'lucide-react'

const events = [
  { id: '1', name: 'Nike Product Launch', date: 'Oct 24', venue: 'Grand Convention Hall', status: 'On Track', filled: 42, total: 50 },
  { id: '2', name: 'BMW Roadshow',        date: 'Oct 26', venue: 'City Auto Center',      status: 'Critical', filled: 8,  total: 20 },
  { id: '3', name: 'Tech Summit 2023',    date: 'Oct 28', venue: 'Innovation Hub',        status: 'Planning', filled: 45, total: 50 },
  { id: '4', name: 'City Music Festival', date: 'Nov 2',  venue: 'Central Park',          status: 'Filling',  filled: 18, total: 30 },
]

const payrollItems = [
  { label: 'Verified Payouts', value: '$8,240' },
  { label: 'Staff Claims',     value: '$1,420' },
  { label: 'Management Fee',   value: '$2,820' },
]

const timeline = [
  { code: 'OCT 24', name: 'Nike Product Launch', note: 'On track · 42/50 confirmed',    status: 'ok' },
  { code: 'OCT 28', name: 'BMW Roadshow',        note: 'Urgent staffing needed · 8/20', status: 'urgent' },
  { code: 'NOV 02', name: 'City Music Festival', note: 'Planning phase · 18/30 staff',  status: 'planning' },
]

const STATUS_BADGE: Record<string, string> = {
  'On Track': 'bg-emerald-100 text-emerald-700',
  'Critical': 'bg-red-100 text-red-700',
  'Filling':  'bg-amber-100 text-amber-700',
  'Planning': 'bg-blue-100 text-blue-700',
}
const PROGRESS_BAR: Record<string, string> = {
  'On Track': 'bg-emerald-500',
  'Critical': 'bg-red-500',
  'Filling':  'bg-amber-500',
  'Planning': 'bg-blue-500',
}

export default function AgencyDashboard() {
  const navigate = useNavigate()

  return (
    <div className="p-4 md:p-8 max-w-[1400px]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 md:mb-8">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900">Agency Overview</h1>
          <p className="text-slate-500 text-sm mt-1">Real-time insights into active events and operations</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => navigate('/schedule')} className="px-3 md:px-4 py-2 border border-slate-200 bg-white text-slate-700 rounded-lg text-sm font-semibold hover:bg-slate-50 transition-colors">
            Schedule
          </button>
          <button onClick={() => navigate('/events/create')} className="px-3 md:px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors shadow-md shadow-blue-600/20">
            Create Event
          </button>
        </div>
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 mb-4 md:mb-6">
        {/* Active Operations */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200">
          <div className="px-4 md:px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="font-semibold text-slate-900">Active Operations</h2>
            <button className="text-sm text-blue-600 font-medium flex items-center gap-1">
              View All <ChevronRight size={14} />
            </button>
          </div>
          <div className="divide-y divide-slate-100">
            {events.map(ev => {
              const pct = Math.round((ev.filled / ev.total) * 100)
              return (
                <button key={ev.id} onClick={() => navigate(`/events/${ev.id}`)} className="w-full px-4 md:px-6 py-3 md:py-4 flex items-center gap-3 md:gap-5 hover:bg-slate-50 transition-colors text-left">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                      <p className="font-semibold text-slate-900 text-sm">{ev.name}</p>
                      <span className={`text-[11px] px-2 py-0.5 rounded-full font-semibold ${STATUS_BADGE[ev.status]}`}>{ev.status}</span>
                    </div>
                    <p className="text-slate-400 text-xs">{ev.date} · {ev.venue}</p>
                  </div>
                  <div className="w-32 md:w-48 shrink-0">
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-slate-400 hidden md:inline">Staffing</span>
                      <span className="font-semibold text-slate-700">{ev.filled}/{ev.total}</span>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${PROGRESS_BAR[ev.status]}`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                  <ChevronRight size={15} className="text-slate-300 shrink-0 hidden sm:block" />
                </button>
              )
            })}
          </div>
        </div>

        {/* Payroll Health */}
        <div className="bg-white rounded-xl border border-slate-200 flex flex-col">
          <div className="px-5 py-4 border-b border-slate-100">
            <h2 className="font-semibold text-slate-900">Payroll Health</h2>
          </div>
          <div className="p-5 flex-1">
            <p className="text-slate-400 text-xs mb-1">Pending Total</p>
            <p className="text-2xl md:text-3xl font-bold text-slate-900 mb-5">$12,480.00</p>
            <div className="space-y-3">
              {payrollItems.map(({ label, value }) => (
                <div key={label} className="flex justify-between items-center">
                  <span className="text-sm text-slate-500">{label}</span>
                  <span className="text-sm font-semibold text-slate-900">{value}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="px-5 pb-5">
            <div className="h-px bg-slate-100 mb-4" />
            <button onClick={() => navigate('/payroll/PAY-2023-10-B')} className="w-full py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors">
              Approve Payroll Batch
            </button>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 md:p-6">
        <h2 className="font-semibold text-slate-900 mb-5 md:mb-6">Upcoming Timeline</h2>
        <div className="relative">
          <div className="absolute left-[60px] top-2.5 bottom-2.5 w-px bg-slate-200" />
          <div className="space-y-5 md:space-y-6">
            {timeline.map((item, i) => (
              <div key={i} className="flex items-start gap-5">
                <span className="w-[60px] text-xs font-bold text-slate-400 pt-0.5 shrink-0 text-right pr-2">{item.code}</span>
                <div className={`w-3 h-3 rounded-full mt-0.5 shrink-0 z-10 relative ring-2 ring-white ${
                  item.status === 'ok' ? 'bg-emerald-500' : item.status === 'urgent' ? 'bg-red-500' : 'bg-blue-400'
                }`} />
                <div>
                  <p className="text-sm font-semibold text-slate-900">{item.name}</p>
                  <p className={`text-xs mt-0.5 flex items-center gap-1.5 ${item.status === 'urgent' ? 'text-red-500' : item.status === 'ok' ? 'text-emerald-500' : 'text-slate-400'}`}>
                    {item.status === 'urgent'   && <AlertTriangle size={11} />}
                    {item.status === 'ok'       && <CheckCircle size={11} />}
                    {item.status === 'planning' && <Clock size={11} />}
                    {item.note}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
