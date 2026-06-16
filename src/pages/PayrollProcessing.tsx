import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, CheckCircle, CreditCard, Calendar, XCircle, Banknote } from 'lucide-react'
import Avatar from '../components/Avatar'

const payouts = [
  { name: 'Sarah Jenkins', role: 'Lead Promoter', base: 171.00, ot: 0,     claims: 0     },
  { name: 'Marcus Low',    role: 'Promoter',      base: 120.00, ot: 18.00, claims: 5.00  },
  { name: 'James Wilson',  role: 'Promoter',      base: 136.00, ot: 0,     claims: 0     },
  { name: 'Aria Gupta',    role: 'Event Crew',    base: 95.00,  ot: 0,     claims: 15.00 },
]

const summaryRows = [
  { label: 'Base Pay Total',       value: '$8,240.00',  color: 'text-slate-900' },
  { label: 'Overtime Addition',    value: '+$1,420.00', color: 'text-blue-600'  },
  { label: 'Staff Claims',         value: '+$820.00',   color: 'text-blue-600'  },
  { label: 'Deductions',           value: '-$140.00',   color: 'text-red-500'   },
  { label: 'Management Fee (15%)', value: '$2,140.00',  color: 'text-slate-900' },
]

const checklist = [
  'Attendance records validated',
  'Overtime hours authorized',
  'Document compliance confirmed',
]

export default function PayrollProcessing() {
  const navigate = useNavigate()
  const [notes, setNotes] = useState('')

  const fmt = (n: number) => n === 0 ? '—' : `$${n.toFixed(2)}`

  return (
    <div className="p-4 md:p-8 max-w-[1400px]">
      {/* Breadcrumb */}
      <button onClick={() => navigate('/')} className="flex items-center gap-1.5 text-sm text-slate-400 mb-5 hover:text-slate-600 transition-colors">
        <ChevronLeft size={15} /> Back to Dashboard
      </button>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6 md:mb-7">
        <div>
          <div className="flex items-center gap-3 mb-1.5 flex-wrap">
            <h1 className="text-xl md:text-2xl font-bold text-slate-900">Process Payroll Batch</h1>
            <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full">Compliant</span>
          </div>
          <p className="text-slate-400 text-sm font-mono">Batch #PAY-2023-10-B · Nike Product Launch · Oct 15–21</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button className="flex items-center gap-2 px-3 py-2 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm font-semibold hover:bg-red-100">
            <XCircle size={14} />
            <span className="hidden sm:inline">Reject Batch</span>
            <span className="sm:hidden">Reject</span>
          </button>
          <button className="flex items-center gap-2 px-3 py-2 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-700 shadow-md shadow-emerald-600/20">
            <Banknote size={14} />
            <span className="hidden sm:inline">Approve &amp; Process</span>
            <span className="sm:hidden">Approve</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Left: Table + Checklist */}
        <div className="lg:col-span-2 space-y-4 md:space-y-5">
          {/* Payout Table */}
          <div className="bg-white rounded-xl border border-slate-200">
            <div className="px-4 md:px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="font-semibold text-slate-900">Staff Payout Breakdown</h2>
              <span className="text-sm text-slate-400 hidden sm:block">42 recipients · Oct 15–21</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[480px]">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    {['Staff Member', 'Base Pay', 'Overtime', 'Claims', 'Total'].map((col, i) => (
                      <th key={col} className={`px-4 md:px-5 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider ${i === 0 ? 'text-left' : 'text-right'}`}>
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {payouts.map(p => {
                    const total = p.base + p.ot + p.claims
                    return (
                      <tr key={p.name} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 md:px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <Avatar name={p.name} size="sm" />
                            <div>
                              <p className="text-sm font-semibold text-slate-900 whitespace-nowrap">{p.name}</p>
                              <p className="text-xs text-slate-400">{p.role}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 md:px-5 py-3.5 text-sm text-slate-700 text-right font-mono">{fmt(p.base)}</td>
                        <td className="px-4 md:px-5 py-3.5 text-right font-mono">
                          <span className={p.ot > 0 ? 'text-sm text-blue-600 font-semibold' : 'text-sm text-slate-300'}>{fmt(p.ot)}</span>
                        </td>
                        <td className="px-4 md:px-5 py-3.5 text-right font-mono">
                          <span className={p.claims > 0 ? 'text-sm text-amber-600 font-semibold' : 'text-sm text-slate-300'}>{fmt(p.claims)}</span>
                        </td>
                        <td className="px-4 md:px-5 py-3.5 text-right">
                          <span className="text-sm font-bold text-slate-900 font-mono">${total.toFixed(2)}</span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            <div className="px-4 md:px-6 py-3 border-t border-slate-100">
              <button className="text-sm text-blue-600 font-medium">Load all 42 records</button>
            </div>
          </div>

          {/* Compliance Checklist */}
          <div className="bg-white rounded-xl border border-slate-200">
            <div className="px-4 md:px-6 py-4 border-b border-slate-100">
              <h2 className="font-semibold text-slate-900">Compliance &amp; Approval Checklist</h2>
            </div>
            <div className="p-4 md:p-5">
              <div className="space-y-3 mb-5">
                {checklist.map(item => (
                  <div key={item} className="flex items-center gap-3">
                    <CheckCircle size={17} className="text-emerald-500 shrink-0" />
                    <span className="text-sm text-slate-700">{item}</span>
                  </div>
                ))}
              </div>
              <div className="pt-4 border-t border-slate-100">
                <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Reviewer Notes</label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Add notes or comments before approving..."
                  className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-300 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition-colors resize-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right: Summary + Payment */}
        <div className="space-y-4 md:space-y-5">
          {/* Financial Summary */}
          <div className="bg-white rounded-xl border border-slate-200">
            <div className="px-5 py-4 border-b border-slate-100">
              <h2 className="font-semibold text-slate-900">Financial Summary</h2>
            </div>
            <div className="p-5">
              <div className="space-y-3 mb-4">
                {summaryRows.map(({ label, value, color }) => (
                  <div key={label} className="flex justify-between items-center gap-4">
                    <span className="text-sm text-slate-500">{label}</span>
                    <span className={`text-sm font-semibold font-mono shrink-0 ${color}`}>{value}</span>
                  </div>
                ))}
              </div>
              <div className="h-px bg-slate-200 mb-4" />
              <div className="flex justify-between items-center">
                <span className="font-bold text-slate-900">Total Payable</span>
                <span className="text-xl font-bold text-emerald-600 font-mono">$12,480.00</span>
              </div>
            </div>
          </div>

          {/* Payment Config */}
          <div className="bg-white rounded-xl border border-slate-200">
            <div className="px-5 py-4 border-b border-slate-100">
              <h2 className="font-semibold text-slate-900">Payment Configuration</h2>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider mb-2">Payment Method</p>
                <div className="flex items-center justify-between bg-slate-50 rounded-lg px-3 py-3 border border-slate-100 gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <CreditCard size={16} className="text-slate-500 shrink-0" />
                    <span className="text-sm font-semibold text-slate-900 truncate">Corporate Visa •••• 4412</span>
                  </div>
                  <button className="text-xs text-blue-600 font-semibold hover:underline shrink-0">Change</button>
                </div>
              </div>
              <div>
                <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider mb-2">Payout Date</p>
                <div className="flex items-center gap-2.5 bg-slate-50 rounded-lg px-3 py-3 border border-slate-100">
                  <Calendar size={16} className="text-slate-500 shrink-0" />
                  <span className="text-sm font-semibold text-slate-900">October 30, 2023</span>
                </div>
              </div>
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-3">
                <p className="text-xs text-emerald-700 leading-relaxed">
                  All necessary tax deductions and employer contributions have been calculated according to regional regulations.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
