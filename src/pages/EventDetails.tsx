import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft, Edit2, DollarSign, MapPin, Clock, Calendar, Users, Check, X, Plus, Minus, Copy, FileText,
} from 'lucide-react'
import Avatar from '../components/Avatar'
import {
  useEvents, fmtDate, fmtTime, STATUS_BADGE, PROGRESS_BAR,
} from '../context/EventsContext'
import { useToast } from '../context/ToastContext'

type Tier = 'Expert' | 'Senior' | 'Junior'
const TIER_BADGE: Record<Tier, string> = {
  Expert: 'bg-amber-100 text-amber-700',
  Senior: 'bg-blue-100 text-blue-700',
  Junior: 'bg-slate-100 text-slate-600',
}

const STATUS_OPTIONS = ['Planning', 'Filling', 'Critical', 'On Track'] as const

export default function EventDetails() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { events, updateEvent, updateEventRoles, cloneEvent } = useEvents()
  const toast = useToast()

  const event = events.find(e => e.id === id)

  const [editing, setEditing]       = useState(false)
  const [addingRole, setAddingRole] = useState(false)
  const [newRole, setNewRole]       = useState({ role: '', responsibilities: '', count: 1, rate: 15, hours: 8 })
  const [draft, setDraft]           = useState({
    name: '', date: '', from: '', to: '', location: '', notes: '',
    status: 'Planning' as typeof STATUS_OPTIONS[number],
  })

  if (!event) {
    return (
      <div className="p-8 text-center">
        <p className="text-slate-500 mb-3">Event not found.</p>
        <button onClick={() => navigate('/events')} className="text-blue-600 font-semibold text-sm">← Back to Events</button>
      </div>
    )
  }

  const startEdit = () => {
    setDraft({
      name: event.name, date: event.date, from: event.from, to: event.to,
      location: event.location, status: event.status, notes: event.notes || '',
    })
    setEditing(true)
  }

  const saveEdit = () => {
    if (!draft.name.trim()) return
    updateEvent(event.id, {
      name: draft.name.trim(), date: draft.date, from: draft.from, to: draft.to,
      location: draft.location.trim(), status: draft.status, notes: draft.notes,
    })
    setEditing(false)
    toast.show('Event details saved')
  }

  const cancelEdit = () => setEditing(false)

  const changeRoleCount = (roleId: number, delta: number) => {
    const filledCount = ((event.assignments || {})[roleId.toString()] || []).length
    const updated = event.staffRoles.map(sr =>
      sr.id === roleId ? { ...sr, count: Math.max(filledCount, sr.count + delta) } : sr
    )
    updateEventRoles(event.id, updated)
  }

  const deleteRole = (roleId: number) => {
    const role = event.staffRoles.find(sr => sr.id === roleId)
    updateEventRoles(event.id, event.staffRoles.filter(sr => sr.id !== roleId))
    if (role) toast.show(`${role.role} role removed`, 'info')
  }

  const handleAddRole = () => {
    if (!newRole.role.trim()) return
    const updated = [
      ...event.staffRoles,
      { id: Date.now(), role: newRole.role.trim(), responsibilities: newRole.responsibilities.trim(), count: newRole.count, rate: newRole.rate, hours: newRole.hours },
    ]
    updateEventRoles(event.id, updated)
    setNewRole({ role: '', responsibilities: '', count: 1, rate: 15, hours: 8 })
    setAddingRole(false)
    toast.show(`${updated[updated.length - 1].role} role added`)
  }

  const handleClone = () => {
    cloneEvent(event.id)
    toast.show(`"${event.name}" duplicated`)
    navigate('/events')
  }

  const roster = event.staffRoles.flatMap(sr => {
    const assigned = (event.assignments || {})[sr.id.toString()] || []
    return assigned.map(p => ({ ...p, roleName: sr.role }))
  })

  const pct     = event.total > 0 ? Math.round((event.filled / event.total) * 100) : 0
  const missing = Math.max(0, event.total - event.filled)

  return (
    <div className="p-4 md:p-8 max-w-[1400px]">
      <button
        onClick={() => navigate('/events')}
        className="flex items-center gap-1.5 text-sm text-slate-400 mb-5 hover:text-slate-600 transition-colors"
      >
        <ArrowLeft size={15} /> Back to Events
      </button>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6 md:mb-7">
        <div className="min-w-0">
          {editing ? (
            <input
              type="text"
              value={draft.name}
              onChange={e => setDraft(d => ({ ...d, name: e.target.value }))}
              className="text-xl md:text-2xl font-bold text-slate-900 border-b-2 border-blue-400 focus:outline-none bg-transparent w-full mb-2"
              autoFocus
            />
          ) : (
            <div className="flex items-center gap-3 mb-1.5 flex-wrap">
              <h1 className="text-xl md:text-2xl font-bold text-slate-900">{event.name}</h1>
              <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${STATUS_BADGE[event.status]}`}>{event.status}</span>
            </div>
          )}
          <div className="flex flex-wrap gap-4 text-slate-400 text-sm">
            <span className="flex items-center gap-1.5"><Clock size={14} />{fmtDate(event.date)} · {fmtTime(event.from)}{event.to ? ` – ${fmtTime(event.to)}` : ''}</span>
            <span className="flex items-center gap-1.5"><MapPin size={14} />{event.location}</span>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          {editing ? (
            <>
              <button onClick={cancelEdit} className="flex items-center gap-2 px-3 py-2 border border-slate-200 bg-white text-slate-700 rounded-lg text-sm font-semibold hover:bg-slate-50 transition-colors">
                <X size={14} /> Cancel
              </button>
              <button onClick={saveEdit} disabled={!draft.name.trim()} className="flex items-center gap-2 px-3 py-2 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-700 disabled:opacity-40 transition-colors shadow-md shadow-emerald-600/20">
                <Check size={14} /> Save Changes
              </button>
            </>
          ) : (
            <>
              <button onClick={handleClone} className="flex items-center gap-2 px-3 py-2 border border-slate-200 bg-white text-slate-700 rounded-lg text-sm font-semibold hover:bg-slate-50 transition-colors" title="Duplicate this event">
                <Copy size={14} /> Duplicate
              </button>
              <button onClick={startEdit} className="flex items-center gap-2 px-3 py-2 border border-slate-200 bg-white text-slate-700 rounded-lg text-sm font-semibold hover:bg-slate-50 transition-colors">
                <Edit2 size={14} /> Edit
              </button>
              <button onClick={() => navigate(`/events/${event.id}/staff`)} className="flex items-center gap-2 px-3 py-2 border border-slate-200 bg-white text-slate-700 rounded-lg text-sm font-semibold hover:bg-slate-50 transition-colors">
                <Users size={14} /> Manage Staff
              </button>
              <button onClick={() => navigate(`/payroll/${event.id}`)} className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors shadow-md shadow-blue-600/20">
                <DollarSign size={14} /> Payroll
              </button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Staff Roster */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-xl border border-slate-200">
            <div className="px-4 md:px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="font-semibold text-slate-900">Staff Roster</h2>
              <span className="text-sm text-slate-400">{roster.length} of {event.total}</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[520px]">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    {['Staff Member', 'Assigned Role', 'Tier', ''].map((col, i) => (
                      <th key={i} className={`px-4 md:px-5 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider ${i === 3 ? 'text-right' : 'text-left'}`}>{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {roster.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-5 py-10 text-center text-sm text-slate-400">
                        No staff assigned yet.{' '}
                        <button onClick={() => navigate(`/events/${event.id}/staff`)} className="text-blue-600 font-semibold underline">Manage Staff →</button>
                      </td>
                    </tr>
                  ) : roster.map((m, i) => (
                    <tr key={i} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 md:px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <Avatar name={m.name} size="sm" />
                          <div>
                            <p className="text-sm font-semibold text-slate-900 whitespace-nowrap">{m.name}</p>
                            {m.phone && <p className="text-xs text-slate-400">{m.phone}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 md:px-5 py-3.5 text-sm text-slate-600 whitespace-nowrap">{m.roleName}</td>
                      <td className="px-4 md:px-5 py-3.5">
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${TIER_BADGE[m.tier as Tier]}`}>{m.tier}</span>
                      </td>
                      <td className="px-4 md:px-5 py-3.5 text-right">
                        <button onClick={() => navigate(`/events/${event.id}/staff`)} className="text-xs text-blue-600 font-medium hover:underline">Manage</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {roster.length > 0 && (
              <div className="px-4 md:px-6 py-3 border-t border-slate-100">
                <button onClick={() => navigate(`/events/${event.id}/staff`)} className="text-sm text-blue-600 font-medium hover:underline">Manage all staff →</button>
              </div>
            )}
          </div>

          {/* Notes */}
          <div className="bg-white rounded-xl border border-slate-200">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
              <FileText size={15} className="text-slate-400" />
              <h2 className="font-semibold text-slate-900">Notes</h2>
            </div>
            <div className="p-5">
              {editing ? (
                <textarea
                  rows={4}
                  value={draft.notes}
                  onChange={e => setDraft(d => ({ ...d, notes: e.target.value }))}
                  placeholder="Add notes, special instructions, client contacts..."
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 resize-none transition-colors"
                />
              ) : event.notes ? (
                <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">{event.notes}</p>
              ) : (
                <p className="text-sm text-slate-400 italic">No notes added. Click Edit to add notes.</p>
              )}
            </div>
          </div>
        </div>

        {/* Right panel */}
        <div className="space-y-4">
          {/* Event Details / Edit Form */}
          <div className="bg-white rounded-xl border border-slate-200">
            <div className="px-5 py-4 border-b border-slate-100">
              <h2 className="font-semibold text-slate-900">Event Details</h2>
            </div>
            <div className="p-5 space-y-4">
              {editing ? (
                <>
                  <div>
                    <label className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider mb-1 block">Date</label>
                    <input type="date" value={draft.date} onChange={e => setDraft(d => ({ ...d, date: e.target.value }))}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition-colors" />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider mb-1 block">Start</label>
                      <input type="time" value={draft.from} onChange={e => setDraft(d => ({ ...d, from: e.target.value }))}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition-colors" />
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider mb-1 block">End</label>
                      <input type="time" value={draft.to} onChange={e => setDraft(d => ({ ...d, to: e.target.value }))}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition-colors" />
                    </div>
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider mb-1 block">Location</label>
                    <input type="text" value={draft.location} onChange={e => setDraft(d => ({ ...d, location: e.target.value }))} placeholder="Venue or address"
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition-colors" />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider mb-1 block">Status</label>
                    <select value={draft.status} onChange={e => setDraft(d => ({ ...d, status: e.target.value as typeof STATUS_OPTIONS[number] }))}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition-colors">
                      {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div className="flex gap-2 pt-1">
                    <button onClick={cancelEdit} className="flex-1 py-2 border border-slate-200 text-slate-700 rounded-lg text-sm font-semibold hover:bg-slate-50 transition-colors">Cancel</button>
                    <button onClick={saveEdit} disabled={!draft.name.trim()} className="flex-1 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-40 transition-colors">Save</button>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider mb-0.5">Date</p>
                    <p className="text-sm font-semibold text-slate-900 flex items-center gap-1.5"><Calendar size={13} className="text-slate-400" />{fmtDate(event.date)}</p>
                  </div>
                  <div>
                    <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider mb-0.5">Time Frame</p>
                    <p className="text-sm font-semibold text-slate-900 flex items-center gap-1.5"><Clock size={13} className="text-slate-400" />{fmtTime(event.from)}{event.to ? ` – ${fmtTime(event.to)}` : ''}</p>
                  </div>
                  <div>
                    <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider mb-0.5">Location</p>
                    <p className="text-sm font-semibold text-slate-900 flex items-center gap-1.5"><MapPin size={13} className="text-slate-400" />{event.location}</p>
                  </div>
                  <div>
                    <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider mb-0.5">Status</p>
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${STATUS_BADGE[event.status]}`}>{event.status}</span>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">Staffing Roles</p>
                      <button onClick={() => setAddingRole(v => !v)} className="flex items-center gap-1 text-xs text-blue-600 font-semibold hover:text-blue-700">
                        <Plus size={12} /> Add Role
                      </button>
                    </div>

                    {event.staffRoles.length === 0 && !addingRole && <p className="text-sm text-slate-400">No roles defined yet.</p>}

                    <div className="space-y-1">
                      {event.staffRoles.map(sr => {
                        const filledCount = ((event.assignments || {})[sr.id.toString()] || []).length
                        return (
                          <div key={sr.id} className="flex items-center gap-2 py-1.5 border-b border-slate-50 last:border-0">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-slate-900 truncate">{sr.role}</p>
                              <p className="text-[11px] text-slate-400">${sr.rate}/hr · {sr.hours}hr</p>
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                              <button onClick={() => changeRoleCount(sr.id, -1)} disabled={sr.count <= filledCount || sr.count <= 1} className="w-6 h-6 rounded border border-slate-200 flex items-center justify-center hover:bg-slate-100 disabled:opacity-30 transition-colors"><Minus size={10} /></button>
                              <span className={`text-sm font-bold w-5 text-center ${filledCount >= sr.count ? 'text-emerald-600' : 'text-amber-600'}`}>{sr.count}</span>
                              <button onClick={() => changeRoleCount(sr.id, 1)} className="w-6 h-6 rounded border border-slate-200 flex items-center justify-center hover:bg-slate-100 transition-colors"><Plus size={10} /></button>
                            </div>
                            <span className="text-[11px] text-slate-400 w-8 text-center shrink-0">{filledCount}/{sr.count}</span>
                            <button onClick={() => deleteRole(sr.id)} disabled={filledCount > 0} title={filledCount > 0 ? 'Remove assigned staff first' : 'Delete role'} className="w-6 h-6 rounded hover:bg-red-50 flex items-center justify-center shrink-0 disabled:opacity-25 transition-colors">
                              <X size={12} className="text-red-400" />
                            </button>
                          </div>
                        )
                      })}
                    </div>

                    {addingRole && (
                      <div className="mt-2 p-3 border border-slate-200 rounded-xl bg-slate-50 space-y-2">
                        <input type="text" placeholder="Role name *" value={newRole.role} onChange={e => setNewRole(r => ({ ...r, role: e.target.value }))} autoFocus
                          className="w-full px-2.5 py-1.5 border border-slate-200 bg-white rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition-colors" />
                        <input type="text" placeholder="Responsibilities (optional)" value={newRole.responsibilities} onChange={e => setNewRole(r => ({ ...r, responsibilities: e.target.value }))}
                          className="w-full px-2.5 py-1.5 border border-slate-200 bg-white rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition-colors" />
                        <div className="grid grid-cols-3 gap-1.5">
                          {[{ label: 'Count', key: 'count' as const, min: 1 }, { label: '$/hr', key: 'rate' as const, min: 0 }, { label: 'Hours', key: 'hours' as const, min: 1 }].map(({ label, key, min }) => (
                            <div key={key}>
                              <p className="text-[10px] text-slate-400 mb-0.5">{label}</p>
                              <input type="number" min={min} value={newRole[key]} onChange={e => setNewRole(r => ({ ...r, [key]: Math.max(min, parseInt(e.target.value) || min) }))}
                                className="w-full px-2 py-1.5 border border-slate-200 bg-white rounded-lg text-sm text-slate-900 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition-colors" />
                            </div>
                          ))}
                        </div>
                        <div className="flex gap-2 pt-1">
                          <button onClick={() => { setAddingRole(false); setNewRole({ role: '', responsibilities: '', count: 1, rate: 15, hours: 8 }) }}
                            className="flex-1 py-1.5 border border-slate-200 bg-white text-slate-600 rounded-lg text-xs font-semibold hover:bg-slate-100 transition-colors">Cancel</button>
                          <button onClick={handleAddRole} disabled={!newRole.role.trim()}
                            className="flex-1 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 disabled:opacity-40 transition-colors">Add Role</button>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Staffing Health */}
          <div className="bg-white rounded-xl border border-slate-200">
            <div className="px-5 py-4 border-b border-slate-100">
              <h2 className="font-semibold text-slate-900">Staffing Health</h2>
            </div>
            <div className="p-5">
              <div className="flex items-end justify-between mb-3">
                <span className="text-4xl md:text-5xl font-bold text-slate-900 leading-none">{pct}%</span>
                <span className="text-slate-400 text-sm mb-1">{event.filled} / {event.total}</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden mb-5">
                <div className={`h-full rounded-full ${PROGRESS_BAR[event.status]}`} style={{ width: `${pct}%` }} />
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: 'Total',    value: `${event.filled}/${event.total}`, cls: 'text-blue-600' },
                  { label: 'Assigned', value: event.filled.toString(),          cls: 'text-emerald-600' },
                  { label: 'Missing',  value: missing.toString(),               cls: 'text-red-500' },
                ].map(({ label, value, cls }) => (
                  <div key={label} className="bg-slate-50 rounded-xl p-3 text-center">
                    <p className={`text-base font-bold ${cls}`}>{value}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">{label}</p>
                  </div>
                ))}
              </div>
              <button onClick={() => navigate(`/events/${event.id}/staff`)} className="mt-4 w-full py-2.5 border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors">
                Manage Staff →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
