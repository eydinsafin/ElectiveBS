import { useNavigate } from 'react-router-dom'
import { DollarSign, Users, Activity, Plus, Download } from 'lucide-react'
import { useEvents, fmtDate } from '../context/EventsContext'
import { exportToCsv } from '../utils/exportCsv'
import { useToast } from '../context/ToastContext'

// ---------- Chart helpers ----------
const WEEKS = ['Week 1', 'Week 2', 'Week 3', 'Week 4']
const CURRENT_DATA  = [21000, 18000, 28000, 17240]
const PREVIOUS_DATA = [16000, 17000, 22000, 20000]
const MAX_VAL = 30000

const VBW = 540; const VBH = 200
const PAD_X = 50; const PAD_Y = 20
const CW = VBW - 2 * PAD_X; const CH = VBH - 2 * PAD_Y

const xPos = (i: number) => PAD_X + (i / (WEEKS.length - 1)) * CW
const yPos = (v: number) => PAD_Y + CH - (v / MAX_VAL) * CH

const pts  = (data: number[]) => data.map((v, i) => `${xPos(i)},${yPos(v)}`).join(' ')
const area = (data: number[]) =>
  `${pts(data)} ${xPos(data.length - 1)},${PAD_Y + CH} ${PAD_X},${PAD_Y + CH}`

function LineChart() {
  return (
    <svg viewBox={`0 0 ${VBW} ${VBH}`} className="w-full h-40 md:h-48">
      {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => {
        const y = PAD_Y + pct * CH
        return (
          <g key={i}>
            <line x1={PAD_X} y1={y} x2={PAD_X + CW} y2={y} stroke="#f1f5f9" strokeWidth={1} />
            <text x={PAD_X - 6} y={y + 4} textAnchor="end" fontSize={10} fill="#94a3b8">
              ${((MAX_VAL * (1 - pct)) / 1000).toFixed(0)}k
            </text>
          </g>
        )
      })}
      <polygon points={area(PREVIOUS_DATA)} fill="rgba(148,163,184,0.07)" />
      <polygon points={area(CURRENT_DATA)}  fill="rgba(59,130,246,0.08)" />
      <polyline points={pts(PREVIOUS_DATA)} fill="none" stroke="#cbd5e1" strokeWidth={2} strokeDasharray="5,3" />
      <polyline points={pts(CURRENT_DATA)}  fill="none" stroke="#3b82f6" strokeWidth={2.5} />
      {CURRENT_DATA.map((v, i) => (
        <circle key={i} cx={xPos(i)} cy={yPos(v)} r={4} fill="white" stroke="#3b82f6" strokeWidth={2} />
      ))}
      {WEEKS.map((w, i) => (
        <text key={i} x={xPos(i)} y={VBH - 4} textAnchor="middle" fontSize={11} fill="#94a3b8">{w}</text>
      ))}
    </svg>
  )
}

function DonutChart() {
  return (
    <div className="flex flex-col sm:flex-row items-center gap-5">
      <div className="relative w-32 h-32 shrink-0">
        <div className="w-full h-full rounded-full" style={{ background: 'conic-gradient(#10b981 0deg 316.8deg, #f59e0b 316.8deg 349.2deg, #ef4444 349.2deg 360deg)' }} />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-[72px] h-[72px] bg-white rounded-full flex flex-col items-center justify-center shadow-sm">
            <p className="text-base font-bold text-slate-900">88%</p>
            <p className="text-[10px] text-slate-400 font-medium">On-time</p>
          </div>
        </div>
      </div>
      <div className="space-y-2.5">
        {[
          { label: 'On-time Check-ins', pct: '88%', color: 'bg-emerald-500' },
          { label: 'Late Check-ins',    pct: '9%',  color: 'bg-amber-500' },
          { label: 'Absent / No-show',  pct: '3%',  color: 'bg-red-500' },
        ].map(({ label, pct, color }) => (
          <div key={label} className="flex items-center gap-2.5">
            <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${color}`} />
            <span className="text-sm text-slate-600">{label}</span>
            <span className="text-sm font-bold text-slate-900 ml-auto pl-4">{pct}</span>
          </div>
        ))}
        <div className="pt-2 border-t border-slate-100">
          <p className="text-xs text-slate-400">Avg late time: <span className="font-semibold text-slate-700">42 min</span></p>
          <p className="text-xs text-emerald-600 font-medium mt-0.5">+4% punctuality improvement</p>
        </div>
      </div>
    </div>
  )
}

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
  'Planning': 'bg-blue-400',
}

export default function ReportsAnalytics() {
  const navigate    = useNavigate()
  const { events }  = useEvents()
  const toast       = useToast()

  const eventsTable = events.map(ev => ({
    name:     ev.name,
    date:     fmtDate(ev.date),
    location: ev.location,
    staffing: ev.total > 0 ? Math.round((ev.filled / ev.total) * 100) : 0,
    filled:   ev.filled,
    total:    ev.total,
    revenue:  ev.staffRoles.reduce((a, r) => a + r.count * r.rate * r.hours, 0),
    status:   ev.status,
  }))

  const totalRevenue   = eventsTable.reduce((a, e) => a + e.revenue, 0)
  const totalStaff     = eventsTable.reduce((a, e) => a + e.filled, 0)
  const totalPositions = eventsTable.reduce((a, e) => a + e.total, 0)
  const avgFillRate    = totalPositions > 0 ? Math.round((totalStaff / totalPositions) * 100) : 0

  const kpis = [
    { label: 'Est. Total Labour',   value: `$${totalRevenue.toLocaleString()}`, badge: `${events.length} events`, badgeOk: true,  sub: 'Based on rates × hours',    Icon: DollarSign, cls: 'text-emerald-600 bg-emerald-50' },
    { label: 'Staff Utilisation',   value: `${avgFillRate}%`,                    badge: avgFillRate >= 80 ? 'On Track' : 'Low',    badgeOk: avgFillRate >= 80, sub: `${totalStaff} / ${totalPositions} filled`, Icon: Users,      cls: 'text-blue-600 bg-blue-50' },
    { label: 'Pending Assignments', value: `${totalPositions - totalStaff}`,     badge: totalPositions - totalStaff === 0 ? 'All Filled' : 'Open', badgeOk: totalPositions - totalStaff === 0, sub: 'Spots still unfilled', Icon: Activity, cls: 'text-orange-600 bg-orange-50' },
  ]

  const handleExportEvents = () => {
    exportToCsv(
      'eventos-event-report.csv',
      ['Event Name', 'Date', 'Location', 'Status', 'Filled', 'Total', 'Fill %', 'Est. Revenue (SGD)'],
      eventsTable.map(e => [e.name, e.date, e.location, e.status, e.filled, e.total, `${e.staffing}%`, `$${e.revenue.toFixed(2)}`])
    )
    toast.show('Events CSV downloaded')
  }

  const handleExportStaffing = () => {
    const rows: (string | number)[][] = []
    events.forEach(ev => {
      ev.staffRoles.forEach(sr => {
        const assigned = (ev.assignments || {})[sr.id.toString()] || []
        assigned.forEach(p => {
          rows.push([ev.name, fmtDate(ev.date), ev.location, sr.role, p.name, p.phone || '', p.tier, `$${sr.rate}/hr`, sr.hours])
        })
      })
    })
    exportToCsv(
      'eventos-staffing-assignments.csv',
      ['Event', 'Date', 'Location', 'Role', 'Staff Name', 'Phone', 'Tier', 'Rate', 'Hours'],
      rows
    )
    toast.show('Staffing CSV downloaded')
  }

  return (
    <div className="p-4 md:p-8 max-w-[1400px]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6 md:mb-8">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900">Reports &amp; Analytics</h1>
          <p className="text-slate-500 text-sm mt-1">Real-time operational overview for Elite Agency</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleExportEvents}
            className="flex items-center gap-2 px-3 py-2 border border-slate-200 bg-white rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <Download size={14} />Events CSV
          </button>
          <button
            onClick={handleExportStaffing}
            className="flex items-center gap-2 px-3 py-2 border border-slate-200 bg-white rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <Download size={14} />Staffing CSV
          </button>
          <button
            onClick={() => navigate('/events/create')}
            className="flex items-center gap-2 px-3 md:px-4 py-2 bg-amber-600 text-white rounded-lg text-sm font-semibold hover:bg-amber-700 transition-colors shadow-md shadow-amber-600/20"
          >
            <Plus size={15} />
            <span className="hidden sm:inline">Schedule New Event</span>
            <span className="sm:hidden">New</span>
          </button>
        </div>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-5 mb-6 md:mb-7">
        {kpis.map(({ label, value, badge, badgeOk, sub, Icon, cls }) => (
          <div key={label} className="card-hover bg-white rounded-xl border border-slate-200 p-4 md:p-5">
            <div className="flex items-start justify-between mb-3 md:mb-4">
              <div className={`w-9 h-9 md:w-10 md:h-10 rounded-xl flex items-center justify-center ${cls}`}>
                <Icon size={18} />
              </div>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${badgeOk ? 'bg-emerald-50 text-emerald-700' : 'bg-orange-50 text-orange-700'}`}>
                {badge}
              </span>
            </div>
            <p className="text-xl md:text-[26px] font-bold text-slate-900 leading-none mb-1">{value}</p>
            <p className="text-slate-400 text-[10px] md:text-[11px] font-medium uppercase tracking-wider">{label}</p>
            <p className="text-slate-400 text-xs mt-1 hidden md:block">{sub}</p>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 mb-5 md:mb-6">
        {/* Revenue Growth */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200">
          <div className="px-4 md:px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h2 className="font-semibold text-slate-900">Revenue Growth (Sample)</h2>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5"><span className="w-5 h-0.5 bg-blue-500 inline-block rounded" />Current</span>
              <span className="flex items-center gap-1.5"><span className="w-5 border-t-2 border-dashed border-slate-300 inline-block" />Previous</span>
            </div>
          </div>
          <div className="px-4 md:px-6 py-4">
            <LineChart />
          </div>
        </div>

        {/* Attendance Pattern */}
        <div className="bg-white rounded-xl border border-slate-200">
          <div className="px-5 py-4 border-b border-slate-100">
            <h2 className="font-semibold text-slate-900">Attendance Pattern</h2>
          </div>
          <div className="p-5">
            <DonutChart />
          </div>
        </div>
      </div>

      {/* Event Performance Table */}
      <div className="bg-white rounded-xl border border-slate-200 mb-4 md:mb-6">
        <div className="px-4 md:px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-semibold text-slate-900">Event Performance Summary</h2>
          <button onClick={handleExportEvents} className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-amber-600 transition-colors">
            <Download size={13} />Export
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                {['Event Name', 'Date', 'Staffing', 'Est. Revenue', 'Status'].map((col, i) => (
                  <th key={col} className={`px-4 md:px-6 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider ${i === 0 ? 'text-left' : 'text-center'}`}>
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {eventsTable.length === 0 && (
                <tr><td colSpan={5} className="px-6 py-10 text-center text-sm text-slate-400">No event data available yet.</td></tr>
              )}
              {eventsTable.map(ev => (
                <tr key={ev.name} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 md:px-6 py-4">
                    <p className="text-sm font-semibold text-slate-900 whitespace-nowrap">{ev.name}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{ev.date} · {ev.location}</p>
                  </td>
                  <td className="px-4 md:px-6 py-4 text-center">
                    <p className="text-xs text-slate-500">{ev.date}</p>
                  </td>
                  <td className="px-4 md:px-6 py-4">
                    <div className="flex items-center gap-2 justify-center">
                      <div className="w-16 md:w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${PROGRESS_BAR[ev.status]}`} style={{ width: `${ev.staffing}%` }} />
                      </div>
                      <span className="text-sm font-semibold text-slate-700 whitespace-nowrap">{ev.filled}/{ev.total} · {ev.staffing}%</span>
                    </div>
                  </td>
                  <td className="px-4 md:px-6 py-4 text-sm font-semibold text-slate-900 text-center font-mono">
                    ${ev.revenue.toLocaleString()}
                  </td>
                  <td className="px-4 md:px-6 py-4 text-center">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${STATUS_BADGE[ev.status]}`}>{ev.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary totals */}
      {eventsTable.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-4 md:p-6">
          <h2 className="font-semibold text-slate-900 mb-4">Summary Totals</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Total Events',     value: events.length.toString(),       color: 'text-amber-600' },
              { label: 'Positions Filled', value: `${totalStaff}/${totalPositions}`, color: 'text-emerald-600' },
              { label: 'Overall Fill Rate',value: `${avgFillRate}%`,               color: avgFillRate >= 80 ? 'text-emerald-600' : 'text-amber-600' },
              { label: 'Est. Labour Cost', value: `$${totalRevenue.toLocaleString()}`, color: 'text-slate-900' },
            ].map(({ label, value, color }) => (
              <div key={label} className="bg-slate-50 rounded-xl p-4">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">{label}</p>
                <p className={`text-2xl font-bold ${color}`}>{value}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
