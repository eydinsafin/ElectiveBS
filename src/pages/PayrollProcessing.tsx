import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, CheckCircle, XCircle, AlertTriangle, Clock, DollarSign, Users, Check, X } from 'lucide-react'
import Avatar from '../components/Avatar'
import { useEvents, fmtDate, AssignedPerson } from '../context/EventsContext'

type Tier = 'Expert' | 'Senior' | 'Junior'
const TIER_BADGE: Record<Tier, string> = {
  Expert: 'bg-amber-100 text-amber-700',
  Senior: 'bg-blue-100 text-blue-700',
  Junior: 'bg-slate-100 text-slate-600',
}

type PayrollLine = {
  eventId: string
  eventName: string
  eventDate: string
  roleName: string
  rate: number
  hours: number
  amount: number
  isPast: boolean
}

type Invoice = {
  person: AssignedPerson
  lines: PayrollLine[]
  total: number
}

type ApprovalStatus = 'pending' | 'approved' | 'rejected'

const today = new Date()
today.setHours(0, 0, 0, 0)

export default function PayrollProcessing() {
  const navigate = useNavigate()
  const { events } = useEvents()

  const [statuses, setStatuses] = useState<Record<string, ApprovalStatus>>({})
  const [notes, setNotes]       = useState<Record<string, string>>({})
  const [expanded, setExpanded] = useState<Set<string>>(new Set())

  // Build one invoice per unique staff member across all events
  const invoiceMap = new Map<string, { person: AssignedPerson; lines: PayrollLine[] }>()

  events.forEach(ev => {
    const evDate = new Date(ev.date)
    evDate.setHours(0, 0, 0, 0)
    const isPast = evDate < today

    Object.entries(ev.assignments || {}).forEach(([roleIdStr, people]) => {
      const role = ev.staffRoles.find(r => r.id.toString() === roleIdStr)
      if (!role) return
      people.forEach(person => {
        const entry = invoiceMap.get(person.id) || { person, lines: [] }
        entry.lines.push({
          eventId:   ev.id,
          eventName: ev.name,
          eventDate: ev.date,
          roleName:  role.role,
          rate:      role.rate,
          hours:     role.hours,
          amount:    role.rate * role.hours,
          isPast,
        })
        invoiceMap.set(person.id, entry)
      })
    })
  })

  const invoices: Invoice[] = [...invoiceMap.values()]
    .map(inv => ({ ...inv, total: inv.lines.reduce((a, l) => a + l.amount, 0) }))
    .sort((a, b) => {
      const sa = statuses[a.person.id] || 'pending'
      const sb = statuses[b.person.id] || 'pending'
      if (sa === sb) return 0
      if (sa === 'pending') return -1
      return 1
    })

  const pending  = invoices.filter(i => (statuses[i.person.id] || 'pending') === 'pending')
  const approved = invoices.filter(i => statuses[i.person.id] === 'approved')
  const rejected = invoices.filter(i => statuses[i.person.id] === 'rejected')
  const totalAmt = invoices.reduce((a, i) => a + i.total, 0)
  const approvedAmt = approved.reduce((a, i) => a + i.total, 0)

  const setStatus = (personId: string, s: ApprovalStatus) =>
    setStatuses(prev => ({ ...prev, [personId]: s }))

  const approveAll = () => {
    const next = { ...statuses }
    pending.forEach(i => { next[i.person.id] = 'approved' })
    setStatuses(next)
  }

  const toggleNote = (id: string) =>
    setExpanded(prev => {
      const n = new Set(prev)
      n.has(id) ? n.delete(id) : n.add(id)
      return n
    })

  return (
    <div className="p-4 md:p-8 max-w-[1100px]">
      {/* Back */}
      <button
        onClick={() => navigate('/')}
        className="flex items-center gap-1.5 text-sm text-slate-400 mb-5 hover:text-slate-600 transition-colors"
      >
        <ArrowLeft size={15} /> Back to Dashboard
      </button>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-3 mb-1 flex-wrap">
            <h1 className="text-xl md:text-2xl font-bold text-slate-900">Payroll Overview</h1>
            <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full">Compliant</span>
          </div>
          <p className="text-slate-400 text-sm">Individual staff invoices — approve each before processing payment</p>
        </div>
        {pending.length > 0 && (
          <button
            onClick={approveAll}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-700 transition-colors shadow-md shadow-emerald-600/20 shrink-0 self-start"
          >
            <Check size={15} /> Approve All Pending ({pending.length})
          </button>
        )}
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Total Staff',    value: invoices.length.toString(),    icon: Users,       cls: 'text-blue-600 bg-blue-50' },
          { label: 'Total Payable',  value: `$${totalAmt.toFixed(2)}`,     icon: DollarSign,  cls: 'text-slate-700 bg-slate-100' },
          { label: 'Approved',       value: `$${approvedAmt.toFixed(2)}`,  icon: CheckCircle, cls: 'text-emerald-600 bg-emerald-50' },
          { label: 'Pending',        value: pending.length.toString(),      icon: Clock,       cls: 'text-amber-600 bg-amber-50' },
        ].map(({ label, value, icon: Icon, cls }) => (
          <div key={label} className="bg-white rounded-xl border border-slate-200 p-4 md:p-5">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-3 ${cls}`}>
              <Icon size={16} />
            </div>
            <p className="text-xl md:text-2xl font-bold text-slate-900 leading-none">{value}</p>
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Empty state */}
      {invoices.length === 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <DollarSign size={32} className="text-slate-200 mx-auto mb-3" />
          <p className="text-slate-500 font-semibold mb-1">No payroll to process</p>
          <p className="text-slate-400 text-sm mb-4">Assign staff to events first, then return here to approve their pay.</p>
          <button
            onClick={() => navigate('/events')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors"
          >
            Go to Events →
          </button>
        </div>
      )}

      {/* Invoice cards */}
      <div className="space-y-4">
        {invoices.map(inv => {
          const status = statuses[inv.person.id] || 'pending'
          const hasUnpaid = inv.lines.some(l => l.isPast)
          const note = notes[inv.person.id] || ''
          const showNote = expanded.has(inv.person.id)

          return (
            <div
              key={inv.person.id}
              className={`bg-white rounded-xl border transition-colors ${
                status === 'approved' ? 'border-emerald-200' :
                status === 'rejected' ? 'border-red-200' :
                'border-slate-200'
              }`}
            >
              {/* Invoice header */}
              <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <Avatar name={inv.person.name} size="md" />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-bold text-slate-900">{inv.person.name}</p>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${TIER_BADGE[inv.person.tier]}`}>
                        {inv.person.tier}
                      </span>
                      {hasUnpaid && (
                        <span className="flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-700">
                          <AlertTriangle size={9} /> Has unpaid history
                        </span>
                      )}
                    </div>
                    {inv.person.phone && (
                      <p className="text-xs text-slate-400 mt-0.5">{inv.person.phone}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {status === 'approved' && (
                    <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
                      <CheckCircle size={12} /> Approved
                    </span>
                  )}
                  {status === 'rejected' && (
                    <span className="flex items-center gap-1.5 text-xs font-bold text-red-600 bg-red-50 px-2.5 py-1 rounded-full">
                      <XCircle size={12} /> Rejected
                    </span>
                  )}
                  {status === 'pending' && (
                    <span className="flex items-center gap-1.5 text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
                      <Clock size={12} /> Pending
                    </span>
                  )}
                </div>
              </div>

              {/* Breakdown table */}
              <div className="px-5 py-3">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[480px] text-sm">
                    <thead>
                      <tr className="border-b border-slate-100">
                        {['Event', 'Date', 'Role', 'Hours × Rate', 'Amount'].map((col, i) => (
                          <th
                            key={col}
                            className={`py-2 text-[10px] font-semibold text-slate-400 uppercase tracking-wider ${i === 4 ? 'text-right' : 'text-left'} ${i === 0 ? 'pr-4' : 'px-2'}`}
                          >
                            {col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {inv.lines
                        .sort((a, b) => b.eventDate.localeCompare(a.eventDate))
                        .map((line, i) => (
                        <tr key={i} className={line.isPast ? 'bg-amber-50/60' : ''}>
                          <td className="py-3 pr-4">
                            <div className="flex items-center gap-1.5">
                              {line.isPast && (
                                <AlertTriangle size={11} className="text-amber-500 shrink-0" />
                              )}
                              <div>
                                <p className="font-semibold text-slate-900 whitespace-nowrap">{line.eventName}</p>
                                {line.isPast && (
                                  <p className="text-[10px] text-amber-600 font-semibold">Previous · Unpaid</p>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-2 text-slate-500 whitespace-nowrap text-xs">{fmtDate(line.eventDate)}</td>
                          <td className="py-3 px-2 text-slate-600 whitespace-nowrap">{line.roleName}</td>
                          <td className="py-3 px-2 text-slate-500 whitespace-nowrap font-mono text-xs">
                            {line.hours}hr × ${line.rate}/hr
                          </td>
                          <td className="py-3 px-2 text-right font-bold text-slate-900 font-mono whitespace-nowrap">
                            ${line.amount.toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Total row */}
                <div className="flex items-center justify-between border-t border-slate-200 mt-2 pt-3 mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-900">Total Due</span>
                    <span className="text-xs text-slate-400">({inv.lines.length} shift{inv.lines.length !== 1 ? 's' : ''})</span>
                  </div>
                  <span className="text-lg font-bold text-slate-900 font-mono">${inv.total.toFixed(2)}</span>
                </div>

                {/* Note field (expandable) */}
                {showNote && (
                  <div className="mt-2 mb-3">
                    <textarea
                      rows={2}
                      value={note}
                      onChange={e => setNotes(n => ({ ...n, [inv.person.id]: e.target.value }))}
                      placeholder="Add a note for this staff member..."
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 placeholder:text-slate-300 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 resize-none transition-colors"
                    />
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-between py-2">
                  <button
                    onClick={() => toggleNote(inv.person.id)}
                    className="text-xs text-slate-400 hover:text-slate-600 font-medium transition-colors"
                  >
                    {showNote ? 'Hide note' : '+ Add note'}
                  </button>

                  {status === 'pending' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => setStatus(inv.person.id, 'rejected')}
                        className="flex items-center gap-1.5 px-3 py-2 bg-red-50 border border-red-200 text-red-600 rounded-lg text-xs font-semibold hover:bg-red-100 transition-colors"
                      >
                        <X size={12} /> Reject
                      </button>
                      <button
                        onClick={() => setStatus(inv.person.id, 'approved')}
                        className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700 transition-colors shadow-sm shadow-emerald-600/25"
                      >
                        <Check size={12} /> Approve · ${inv.total.toFixed(2)}
                      </button>
                    </div>
                  )}

                  {status === 'approved' && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-emerald-600 font-semibold">✓ Approved for ${inv.total.toFixed(2)}</span>
                      <button
                        onClick={() => setStatus(inv.person.id, 'pending')}
                        className="text-xs text-slate-400 hover:text-slate-600 underline transition-colors"
                      >
                        Undo
                      </button>
                    </div>
                  )}

                  {status === 'rejected' && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-red-500 font-semibold">✗ Rejected</span>
                      <button
                        onClick={() => setStatus(inv.person.id, 'pending')}
                        className="text-xs text-slate-400 hover:text-slate-600 underline transition-colors"
                      >
                        Undo
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Bottom summary bar (sticky when there are approvals) */}
      {approved.length > 0 && (
        <div className="mt-6 bg-emerald-600 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3 text-white">
            <CheckCircle size={20} className="shrink-0" />
            <div>
              <p className="font-bold">{approved.length} invoice{approved.length !== 1 ? 's' : ''} approved — ${approvedAmt.toFixed(2)} ready to pay</p>
              <p className="text-emerald-100 text-xs mt-0.5">Connect PayNow or Wise to process these payments automatically</p>
            </div>
          </div>
          <button className="px-5 py-2.5 bg-white text-emerald-700 rounded-lg font-bold text-sm hover:bg-emerald-50 shrink-0 transition-colors">
            Process Payments →
          </button>
        </div>
      )}
    </div>
  )
}
