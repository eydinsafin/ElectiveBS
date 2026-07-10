import { useMemo, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ChevronLeft, Search, CheckCircle2, Clock, Users,
  UserCheck, UserX, Percent, CheckSquare,
} from 'lucide-react'
import { useEvents, fmtDate, fmtTime, type AssignedPerson } from '../context/EventsContext'

type Filter = 'all' | 'in' | 'pending'

const TIER_COLORS: Record<string, string> = {
  Expert: 'bg-amber-100 text-amber-700',
  Senior: 'bg-blue-100  text-blue-700',
  Junior: 'bg-slate-100 text-slate-600',
}

const AVATAR_COLORS: Record<string, string> = {
  Expert: 'bg-amber-500',
  Senior: 'bg-blue-500',
  Junior: 'bg-slate-400',
}

function initials(name: string) {
  return name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()
}

function fmtCheckInTime(iso: string) {
  return new Date(iso).toLocaleTimeString('en-SG', { hour: '2-digit', minute: '2-digit' })
}

export default function Attendance() {
  const { id }    = useParams<{ id: string }>()
  const navigate  = useNavigate()
  const { events, checkIn, checkOut } = useEvents()

  const event = events.find(e => e.id === id)

  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<Filter>('all')

  // Collect every unique assigned person across all roles
  const roster = useMemo((): { person: AssignedPerson; roles: string[] }[] => {
    if (!event) return []
    const map = new Map<string, { person: AssignedPerson; roles: string[] }>()
    Object.entries(event.assignments || {}).forEach(([roleIdStr, persons]) => {
      const roleName = event.staffRoles.find(r => r.id.toString() === roleIdStr)?.role ?? ''
      persons.forEach(person => {
        if (map.has(person.id)) {
          const entry = map.get(person.id)!
          if (roleName && !entry.roles.includes(roleName)) entry.roles.push(roleName)
        } else {
          map.set(person.id, { person, roles: roleName ? [roleName] : [] })
        }
      })
    })
    return Array.from(map.values()).sort((a, b) => a.person.name.localeCompare(b.person.name))
  }, [event])

  if (!event) {
    return (
      <div className="p-8 text-center text-slate-400">
        Event not found.{' '}
        <button onClick={() => navigate('/events')} className="text-amber-600 font-semibold hover:underline">
          Back to Events
        </button>
      </div>
    )
  }

  const attendance    = event.attendance || {}
  const checkedInSet  = new Set(Object.keys(attendance))
  const totalAssigned = roster.length
  const checkedInCount = checkedInSet.size
  const pendingCount  = totalAssigned - checkedInCount
  const pct           = totalAssigned > 0 ? Math.round((checkedInCount / totalAssigned) * 100) : 0

  const filtered = roster
    .filter(({ person }) => {
      const q  = search.toLowerCase()
      const ok = !q || person.name.toLowerCase().includes(q) || person.phone.includes(q)
      if (!ok) return false
      if (filter === 'in')      return checkedInSet.has(person.id)
      if (filter === 'pending') return !checkedInSet.has(person.id)
      return true
    })

  const handleMarkAll = () => {
    roster.forEach(({ person }) => {
      if (!checkedInSet.has(person.id)) checkIn(event.id, person.id)
    })
  }

  return (
    <div className="p-4 md:p-8 max-w-[900px]">

      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate(`/events/${event.id}`)}
          className="flex items-center gap-1.5 text-slate-500 hover:text-slate-800 text-sm font-medium mb-4 transition-colors"
        >
          <ChevronLeft size={16} /> Back to Event
        </button>

        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <CheckSquare size={18} className="text-amber-600" />
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Attendance</span>
            </div>
            <h1 className="text-xl md:text-2xl font-bold text-slate-900 leading-tight">{event.name}</h1>
            <p className="text-slate-500 text-sm mt-1">
              {fmtDate(event.date)} · {fmtTime(event.from)}
              {event.to ? ` – ${fmtTime(event.to)}` : ''} · {event.location}
            </p>
          </div>

          {totalAssigned > 0 && checkedInCount < totalAssigned && (
            <button
              onClick={handleMarkAll}
              className="shrink-0 px-3 py-2 border border-emerald-200 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-lg hover:bg-emerald-100 transition-colors"
            >
              Mark All Present
            </button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { icon: Users,      label: 'Assigned',   value: totalAssigned,  color: 'text-slate-900' },
          { icon: UserCheck,  label: 'Checked In', value: checkedInCount, color: 'text-emerald-600' },
          { icon: UserX,      label: 'Pending',    value: pendingCount,   color: 'text-amber-600' },
          { icon: Percent,    label: 'Present',    value: `${pct}%`,      color: pct === 100 ? 'text-emerald-600' : pct > 50 ? 'text-amber-600' : 'text-red-600' },
        ].map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Icon size={14} className="text-slate-400" />
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{label}</span>
            </div>
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Progress bar */}
      {totalAssigned > 0 && (
        <div className="mb-6">
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${pct === 100 ? 'bg-emerald-500' : pct > 50 ? 'bg-amber-500' : 'bg-red-500'}`}
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      )}

      {/* Search + filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name or phone..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 pr-3 py-2 w-full border border-slate-200 bg-white rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-50 transition-colors"
          />
        </div>
        <div className="flex gap-1.5">
          {([
            { key: 'all',     label: 'All',        count: totalAssigned  },
            { key: 'in',      label: 'Checked In', count: checkedInCount },
            { key: 'pending', label: 'Pending',     count: pendingCount   },
          ] as { key: Filter; label: string; count: number }[]).map(({ key, label, count }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors border ${
                filter === key
                  ? 'bg-amber-600 text-white border-amber-600'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {label} <span className="opacity-70">{count}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Empty state: no staff assigned yet */}
      {totalAssigned === 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <Users size={32} className="text-slate-200 mx-auto mb-3" />
          <p className="text-slate-500 font-medium mb-1">No staff assigned yet</p>
          <p className="text-slate-400 text-sm mb-4">Assign staff roles first, then track attendance here.</p>
          <button
            onClick={() => navigate(`/events/${event.id}/staff`)}
            className="px-4 py-2 bg-amber-600 text-white rounded-lg text-sm font-semibold hover:bg-amber-700 transition-colors"
          >
            Manage Staff
          </button>
        </div>
      )}

      {/* Roster list */}
      {totalAssigned > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          {/* Column headers */}
          <div className="hidden sm:grid grid-cols-[1fr_auto_auto] gap-4 px-5 py-3 border-b border-slate-100 bg-slate-50">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Staff Member</span>
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider text-right">Time</span>
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider w-28 text-right">Status</span>
          </div>

          {filtered.length === 0 && (
            <div className="p-10 text-center text-slate-400 text-sm">No staff match your search.</div>
          )}

          <div className="divide-y divide-slate-100">
            {filtered.map(({ person, roles }) => {
              const isIn     = checkedInSet.has(person.id)
              const inTime   = attendance[person.id]

              return (
                <div
                  key={person.id}
                  className={`flex items-center gap-4 px-4 sm:px-5 py-4 transition-colors ${isIn ? 'bg-emerald-50/40' : 'hover:bg-slate-50/60'}`}
                >
                  {/* Avatar */}
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0 ${AVATAR_COLORS[person.tier] ?? 'bg-slate-400'}`}>
                    {initials(person.name)}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`font-semibold text-sm ${isIn ? 'text-emerald-800' : 'text-slate-900'}`}>
                        {person.name}
                      </span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${TIER_COLORS[person.tier]}`}>
                        {person.tier.slice(0, 3).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      <span className="text-slate-400 text-xs">{person.phone}</span>
                      {roles.length > 0 && (
                        <>
                          <span className="text-slate-200 text-xs">·</span>
                          <span className="text-slate-500 text-xs truncate max-w-[200px]">{roles.join(', ')}</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Check-in time (desktop) */}
                  <div className="hidden sm:block w-20 text-right">
                    {isIn && inTime && (
                      <span className="text-xs text-emerald-600 font-medium flex items-center justify-end gap-1">
                        <Clock size={11} />
                        {fmtCheckInTime(inTime)}
                      </span>
                    )}
                  </div>

                  {/* Action button */}
                  <div className="shrink-0">
                    {isIn ? (
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-100 text-emerald-700">
                          <CheckCircle2 size={14} strokeWidth={2.5} />
                          <span className="text-xs font-bold hidden sm:inline">Checked In</span>
                        </div>
                        <button
                          onClick={() => checkOut(event.id, person.id)}
                          className="text-xs text-slate-400 hover:text-red-500 transition-colors px-1"
                          title="Undo check-in"
                        >
                          Undo
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => checkIn(event.id, person.id)}
                        className="px-3 py-1.5 border-2 border-emerald-500 text-emerald-700 text-xs font-bold rounded-lg hover:bg-emerald-50 active:scale-95 transition-all"
                      >
                        Check In
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Mobile check-in time note */}
      {checkedInCount > 0 && (
        <p className="sm:hidden text-xs text-slate-400 mt-3 text-center">
          Tap a checked-in person to view their time
        </p>
      )}
    </div>
  )
}
