import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Users, Search, Plus, X, UserPlus, MapPin, Clock, Calendar, AlertTriangle } from 'lucide-react'
import Avatar from '../components/Avatar'
import {
  useEvents, AssignedPerson,
  fmtDate, fmtTime, STATUS_BADGE, PROGRESS_BAR,
} from '../context/EventsContext'
import { useToast } from '../context/ToastContext'

type Tier = 'Expert' | 'Senior' | 'Junior'

const TIER_BADGE: Record<Tier, string> = {
  Expert: 'bg-amber-100 text-amber-700',
  Senior: 'bg-blue-100 text-blue-700',
  Junior: 'bg-slate-100 text-slate-600',
}

export default function StaffManagement() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { events, staffPool, assignToRole, removeFromRole } = useEvents()
  const toast = useToast()

  const event = events.find(e => e.id === id)

  const [addingRoleId, setAddingRoleId] = useState<number | null>(null)
  const [search, setSearch]             = useState('')
  const [newName, setNewName]           = useState('')
  const [newPhone, setNewPhone]         = useState('')
  const [newTier, setNewTier]           = useState<Tier>('Junior')

  if (!event) {
    return (
      <div className="p-8 text-center">
        <p className="text-slate-500 mb-3">Event not found.</p>
        <button onClick={() => navigate('/events')} className="text-amber-600 font-semibold text-sm">← Back to Events</button>
      </div>
    )
  }

  const assignments    = event.assignments || {}
  const totalAssigned  = Object.values(assignments).reduce((a, arr) => a + arr.length, 0)
  const pct            = event.total > 0 ? Math.round((totalAssigned / event.total) * 100) : 0

  const getRoleAssigned = (roleId: number): AssignedPerson[] => assignments[roleId.toString()] || []

  const isUnavailable = (person: AssignedPerson): boolean =>
    (person.unavailableDates || []).includes(event.date)

  const getFilteredPool = (roleId: number): AssignedPerson[] => {
    const assigned = getRoleAssigned(roleId)
    return staffPool
      .filter(p => !assigned.find(a => a.id === p.id))
      .filter(p => !search || p.name.toLowerCase().includes(search.toLowerCase()))
  }

  const openAdd = (roleId: number) => {
    setAddingRoleId(roleId)
    setSearch('')
    setNewName('')
    setNewPhone('')
    setNewTier('Junior')
  }

  const closeAdd = () => {
    setAddingRoleId(null)
    setSearch('')
    setNewName('')
    setNewPhone('')
  }

  const handleAddNew = (roleId: number) => {
    if (!newName.trim()) return
    const person: AssignedPerson = {
      id: `custom-${Date.now()}`,
      name: newName.trim(),
      phone: newPhone.trim(),
      tier: newTier,
    }
    assignToRole(event.id, roleId, person)
    toast.show(`${person.name} assigned to ${event.name}`)
    setNewName('')
    setNewPhone('')
    setNewTier('Junior')
  }

  return (
    <div className="p-4 md:p-8 max-w-[1100px]">
      {/* Back */}
      <button
        onClick={() => navigate('/events')}
        className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 font-medium mb-5 transition-colors"
      >
        <ArrowLeft size={15} />Back to Events
      </button>

      {/* Event header card */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 md:p-6 mb-5">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="min-w-0">
            <h1 className="text-xl md:text-2xl font-bold text-slate-900 leading-tight">{event.name}</h1>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-slate-400 text-xs mt-2">
              <span className="flex items-center gap-1"><Calendar size={12} />{fmtDate(event.date)}</span>
              <span className="flex items-center gap-1"><Clock size={12} />{fmtTime(event.from)}{event.to ? ` – ${fmtTime(event.to)}` : ''}</span>
              <span className="flex items-center gap-1"><MapPin size={12} />{event.location}</span>
            </div>
          </div>
          <span className={`text-xs font-bold px-2.5 py-1 rounded-full shrink-0 ${STATUS_BADGE[event.status]}`}>
            {event.status}
          </span>
        </div>

        <div>
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="flex items-center gap-1.5 font-semibold text-slate-700"><Users size={14} />Overall Staffing</span>
            <span className="font-bold text-slate-900">{totalAssigned} / {event.total} · {pct}%</span>
          </div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <div className={`h-full rounded-full transition-all duration-500 ${PROGRESS_BAR[event.status]}`} style={{ width: `${pct}%` }} />
          </div>
          <p className="text-xs text-slate-400 mt-1.5">
            {event.staffRoles.length} role{event.staffRoles.length !== 1 ? 's' : ''} · {Math.max(0, event.total - totalAssigned)} spots remaining
          </p>
        </div>
      </div>

      {/* Role cards */}
      <div className="space-y-4">
        {event.staffRoles.length === 0 && (
          <div className="bg-white rounded-xl border border-slate-200 p-10 text-center">
            <p className="text-slate-400 text-sm mb-2">No staffing roles defined for this event.</p>
            <button onClick={() => navigate(`/events/${event.id}`)} className="text-amber-600 text-sm font-semibold">Edit Event →</button>
          </div>
        )}

        {event.staffRoles.map(sr => {
          const assigned  = getRoleAssigned(sr.id)
          const needed    = Math.max(0, sr.count - assigned.length)
          const isAdding  = addingRoleId === sr.id
          const pool      = getFilteredPool(sr.id)
          const rolePct   = sr.count > 0 ? Math.min(100, Math.round((assigned.length / sr.count) * 100)) : 0

          return (
            <div key={sr.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              {/* Role header */}
              <div className="px-5 py-4 border-b border-slate-100">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <h3 className="font-bold text-slate-900 text-base">{sr.role}</h3>
                    {sr.responsibilities && <p className="text-xs text-slate-400 mt-0.5">{sr.responsibilities}</p>}
                    <div className="flex flex-wrap gap-3 mt-2">
                      <span className="text-xs text-slate-500">${sr.rate}/hr</span>
                      <span className="text-xs text-slate-500">{sr.hours}hr shift</span>
                      <span className="text-xs text-slate-500">Budget: ${(sr.rate * sr.hours * sr.count).toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className={`text-sm font-bold ${assigned.length >= sr.count ? 'text-emerald-600' : 'text-amber-600'}`}>
                      {assigned.length}/{sr.count}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{needed > 0 ? `${needed} more needed` : 'Filled ✓'}</p>
                    <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden mt-1.5">
                      <div className={`h-full rounded-full ${rolePct >= 100 ? 'bg-emerald-500' : rolePct >= 50 ? 'bg-amber-500' : 'bg-red-400'}`} style={{ width: `${rolePct}%` }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Body */}
              <div className="px-5 py-3 pb-4">
                {/* Assigned list */}
                {assigned.length > 0 && (
                  <div className="space-y-1.5 mb-3">
                    {assigned.map(p => {
                      const unavail = isUnavailable(p)
                      return (
                        <div key={p.id} className={`flex items-center gap-3 py-1.5 px-3 rounded-lg ${unavail ? 'bg-amber-50 border border-amber-100' : 'bg-slate-50'}`}>
                          <Avatar name={p.name} size="sm" />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5">
                              <p className="text-sm font-semibold text-slate-900 truncate">{p.name}</p>
                              {unavail && (
                                <span className="flex items-center gap-0.5 text-[10px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded whitespace-nowrap">
                                  <AlertTriangle size={9} />Unavailable
                                </span>
                              )}
                            </div>
                            {p.phone && <p className="text-xs text-slate-400">{p.phone}</p>}
                          </div>
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0 ${TIER_BADGE[p.tier]}`}>{p.tier}</span>
                          <button
                            onClick={() => { removeFromRole(event.id, sr.id, p.id); toast.show(`${p.name} removed from ${sr.role}`, 'info') }}
                            className="w-7 h-7 rounded-lg bg-red-50 hover:bg-red-100 flex items-center justify-center shrink-0 transition-colors"
                            title="Remove"
                          >
                            <X size={13} className="text-red-500" />
                          </button>
                        </div>
                      )
                    })}
                  </div>
                )}

                {assigned.length === 0 && !isAdding && (
                  <p className="text-sm text-slate-400 text-center py-3">No staff assigned yet</p>
                )}

                {/* Add panel */}
                {isAdding && (
                  <div className="border border-slate-200 rounded-xl p-4 mb-3 bg-slate-50">
                    {/* Search pool */}
                    <div className="relative mb-3">
                      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Search available staff..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="pl-9 pr-3 py-2 w-full border border-slate-200 bg-white rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-50 transition-colors"
                        autoFocus
                      />
                    </div>

                    {pool.length > 0 ? (
                      <div className="mb-4">
                        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Available Pool</p>
                        <div className="space-y-1 max-h-48 overflow-y-auto">
                          {pool.map(p => {
                            const unavail = isUnavailable(p)
                            return (
                              <div key={p.id} className={`flex items-center gap-3 py-1.5 px-2 rounded-lg hover:bg-white transition-colors ${unavail ? 'opacity-75' : ''}`}>
                                <Avatar name={p.name} size="sm" />
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-1.5">
                                    <p className="text-sm font-semibold text-slate-900 truncate">{p.name}</p>
                                    {unavail && (
                                      <span className="flex items-center gap-0.5 text-[10px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded whitespace-nowrap">
                                        <AlertTriangle size={9} />Unavailable
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-xs text-slate-400">{p.phone}</p>
                                </div>
                                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0 ${TIER_BADGE[p.tier]}`}>{p.tier}</span>
                                <button
                                  onClick={() => { assignToRole(event.id, sr.id, p); toast.show(`${p.name} assigned to ${sr.role}`) }}
                                  className="px-2.5 py-1 bg-amber-600 text-white rounded-lg text-xs font-semibold hover:bg-amber-700 shrink-0 transition-colors"
                                >
                                  Add
                                </button>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    ) : (
                      search && <p className="text-xs text-slate-400 text-center py-2 mb-3">No matching staff found</p>
                    )}

                    <div className="flex items-center gap-3 mb-3">
                      <div className="flex-1 h-px bg-slate-200" />
                      <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap">Or Add New</span>
                      <div className="flex-1 h-px bg-slate-200" />
                    </div>

                    <div className="space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          placeholder="Full name *"
                          value={newName}
                          onChange={e => setNewName(e.target.value)}
                          onKeyDown={e => e.key === 'Enter' && handleAddNew(sr.id)}
                          className="px-3 py-2 border border-slate-200 bg-white rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-50 transition-colors"
                        />
                        <input
                          type="tel"
                          placeholder="Phone (optional)"
                          value={newPhone}
                          onChange={e => setNewPhone(e.target.value)}
                          className="px-3 py-2 border border-slate-200 bg-white rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-50 transition-colors"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <select
                          value={newTier}
                          onChange={e => setNewTier(e.target.value as Tier)}
                          className="flex-1 px-3 py-2 border border-slate-200 bg-white rounded-lg text-sm text-slate-900 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-50 transition-colors"
                        >
                          <option value="Junior">Junior</option>
                          <option value="Senior">Senior</option>
                          <option value="Expert">Expert</option>
                        </select>
                        <button
                          onClick={() => handleAddNew(sr.id)}
                          disabled={!newName.trim()}
                          className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-semibold hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        >
                          <UserPlus size={14} />Add to Role
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Footer row */}
                <div className="flex items-center justify-between pt-1">
                  <p className={`text-xs ${needed <= 0 ? 'text-emerald-600 font-semibold' : 'text-slate-400'}`}>
                    {needed <= 0 ? '✓ Role fully staffed' : `${needed} spot${needed !== 1 ? 's' : ''} remaining`}
                  </p>
                  <button
                    onClick={() => (isAdding ? closeAdd() : openAdd(sr.id))}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                      isAdding
                        ? 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        : 'bg-amber-600 text-white hover:bg-amber-700 shadow-sm shadow-amber-600/25'
                    }`}
                  >
                    {isAdding ? <><X size={12} /> Close</> : <><Plus size={12} /> Add Staff</>}
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
