import { useNavigate } from 'react-router-dom'
import { ChevronLeft, Clock, MapPin, Edit2, DollarSign, CheckCircle2, AlertCircle, XCircle, MoreHorizontal } from 'lucide-react'
import Avatar from '../components/Avatar'

type ST = 'ok' | 'warn' | 'bad'
const roster: { name: string; phone: string; role: string; status: string; type: ST; checkin: string }[] = [
  { name: 'Sarah Jenkins', phone: '07712 345678', role: 'Lead Promoter', status: 'Present',    type: 'ok',   checkin: '07:45 AM' },
  { name: 'James Wilson',  phone: '07723 456789', role: 'Promoter',      status: 'Late (12m)', type: 'warn', checkin: '08:12 AM' },
  { name: 'Aria Gupta',    phone: '07734 567890', role: 'Event Crew',    status: 'No Entry',   type: 'bad',  checkin: '—' },
]
const BADGE: Record<ST, string> = { ok: 'bg-emerald-100 text-emerald-700', warn: 'bg-amber-100 text-amber-700', bad: 'bg-red-100 text-red-700' }

function StatusIcon({ type }: { type: ST }) {
  if (type === 'ok')   return <CheckCircle2 size={13} className="text-emerald-500" />
  if (type === 'warn') return <AlertCircle  size={13} className="text-amber-500" />
  return                      <XCircle      size={13} className="text-red-500" />
}

export default function EventDetails() {
  const navigate = useNavigate()

  return (
    <div className="p-4 md:p-8 max-w-[1400px]">
      <button onClick={() => navigate('/')} className="flex items-center gap-1.5 text-sm text-slate-400 mb-5 hover:text-slate-600">
        <ChevronLeft size={15} /> Back to Events
      </button>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6 md:mb-7">
        <div>
          <div className="flex items-center gap-3 mb-1.5 flex-wrap">
            <h1 className="text-xl md:text-2xl font-bold text-slate-900">Nike Product Launch</h1>
            <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full">Active</span>
          </div>
          <div className="flex flex-wrap gap-4 text-slate-400 text-sm">
            <span className="flex items-center gap-1.5"><Clock size={14} />Oct 24, 2023 · 08:00 AM – 06:00 PM</span>
            <span className="flex items-center gap-1.5"><MapPin size={14} />Grand Convention Hall</span>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button className="flex items-center gap-2 px-3 py-2 border border-slate-200 bg-white text-slate-700 rounded-lg text-sm font-semibold hover:bg-slate-50">
            <Edit2 size={14} /> Edit
          </button>
          <button onClick={() => navigate('/payroll/PAY-2023-10-B')} className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 shadow-md shadow-blue-600/20">
            <DollarSign size={14} /> Payroll
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Staff Roster */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200">
          <div className="px-4 md:px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="font-semibold text-slate-900">Staff Roster</h2>
            <span className="text-sm text-slate-400">3 of 42</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  {['Staff Member', 'Role', 'Status', 'Check-in', ''].map((col, i) => (
                    <th key={i} className={`px-4 md:px-5 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider ${i === 4 ? 'text-right' : 'text-left'}`}>{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {roster.map(m => (
                  <tr key={m.name} className="hover:bg-slate-50">
                    <td className="px-4 md:px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <Avatar name={m.name} size="sm" />
                        <div>
                          <p className="text-sm font-semibold text-slate-900">{m.name}</p>
                          <p className="text-xs text-slate-400">{m.phone}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 md:px-5 py-3.5 text-sm text-slate-600 whitespace-nowrap">{m.role}</td>
                    <td className="px-4 md:px-5 py-3.5">
                      <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap ${BADGE[m.type]}`}>
                        <StatusIcon type={m.type} />{m.status}
                      </span>
                    </td>
                    <td className="px-4 md:px-5 py-3.5 text-sm text-slate-600 font-mono whitespace-nowrap">{m.checkin}</td>
                    <td className="px-4 md:px-5 py-3.5 text-right">
                      <button className="p-1.5 rounded-lg hover:bg-slate-100"><MoreHorizontal size={16} className="text-slate-400" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-4 md:px-6 py-3 border-t border-slate-100">
            <button className="text-sm text-blue-600 font-medium">Load all 42 staff members</button>
          </div>
        </div>

        {/* Right panel */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200">
            <div className="px-5 py-4 border-b border-slate-100">
              <h2 className="font-semibold text-slate-900">Event Details</h2>
            </div>
            <div className="p-5 space-y-4">
              {[{ label: 'Time Frame', value: '08:00 AM – 06:00 PM' }, { label: 'Client', value: 'Nike UK Ltd' }].map(({ label, value }) => (
                <div key={label}>
                  <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider mb-0.5">{label}</p>
                  <p className="text-sm font-semibold text-slate-900">{value}</p>
                </div>
              ))}
              <div>
                <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider mb-1">Description</p>
                <p className="text-sm text-slate-600 leading-relaxed">Product demonstrations for the new AlphaFly series. Staff required to manage display stations and engage with media.</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200">
            <div className="px-5 py-4 border-b border-slate-100">
              <h2 className="font-semibold text-slate-900">Staffing Health</h2>
            </div>
            <div className="p-5">
              <div className="flex items-end justify-between mb-3">
                <span className="text-4xl md:text-5xl font-bold text-slate-900 leading-none">84%</span>
                <span className="text-slate-400 text-sm mb-1">42 / 50</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden mb-5">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: '84%' }} />
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: 'Total', value: '42/50', cls: 'text-blue-600' },
                  { label: 'Present', value: '38', cls: 'text-emerald-600' },
                  { label: 'Missing', value: '12', cls: 'text-red-500' },
                ].map(({ label, value, cls }) => (
                  <div key={label} className="bg-slate-50 rounded-xl p-3 text-center">
                    <p className={`text-base font-bold ${cls}`}>{value}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">{label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
