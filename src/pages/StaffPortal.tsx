import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  CalendarDays, Calendar, Clock, DollarSign, CheckCircle2,
  MapPin, UserCheck, Percent, Briefcase, AlertCircle, Link2, Search, ChevronRight,
} from 'lucide-react'
import Avatar from '../components/Avatar'
import { useAuth } from '../context/AuthContext'
import { useEvents, fmtDate, fmtTime, type AppEvent } from '../context/EventsContext'

type Tab = 'overview' | 'events' | 'schedule' | 'attendance'

// ── Account linking (bridges old pool IDs to Supabase UUIDs) ─────────────────
const LS_LINKS = 'eventos_account_links'

function loadLinks(): Record<string, string[]> {
  try { const r = localStorage.getItem(LS_LINKS); return r ? JSON.parse(r) : {} }
  catch { return {} }
}

function saveLink(supabaseId: string, poolPersonId: string) {
  const all = loadLinks()
  const existing = all[supabaseId] ?? []
  if (existing.includes(poolPersonId)) return
  all[supabaseId] = [...existing, poolPersonId]
  localStorage.setItem(LS_LINKS, JSON.stringify(all))
}

const TIER_COLOR: Record<string, string> = {
  Expert: 'bg-amber-100 text-amber-700',
  Senior: 'bg-blue-100 text-blue-700',
  Junior: 'bg-slate-100 text-slate-600',
}

export default function StaffPortal() {
  const { user } = useAuth()
  const { events, checkIn, checkOut } = useEvents()
  const [searchParams] = useSearchParams()
  const tab = (searchParams.get('tab') ?? 'overview') as Tab

  const [linkSearch, setLinkSearch] = useState('')
  const [linkedIds, setLinkedIds] = useState<string[]>(() =>
    user?.id ? (loadLinks()[user.id] ?? []) : []
  )

  const today = new Date().toISOString().split('T')[0]

  // Match by UUID, exact name, OR any claimed/linked pool IDs
  const matchesMe = (p: { id: string; name: string }) =>
    (user?.id && p.id === user.id) ||
    (user?.name && p.name.toLowerCase().trim() === user.name.toLowerCase().trim()) ||
    linkedIds.includes(p.id)

  const myEvents = useMemo(() => {
    if (!user) return []
    return events
      .filter(ev =>
        Object.values(ev.assignments || {}).some(people => people.some(matchesMe))
      )
      .sort((a, b) => a.date.localeCompare(b.date))
  }, [events, user, linkedIds])

  // Returns both the role and the stored assignment (to get the correct person ID for attendance)
  const getMyAssignment = (ev: AppEvent): { role: ReturnType<typeof ev.staffRoles.find>; personId: string } | null => {
    for (const [roleIdStr, people] of Object.entries(ev.assignments || {})) {
      const person = people.find(matchesMe)
      if (person) {
        return {
          role: ev.staffRoles.find(r => r.id.toString() === roleIdStr),
          personId: person.id,
        }
      }
    }
    return null
  }

  const getMyRole = (ev: AppEvent) => getMyAssignment(ev)?.role ?? null

  const upcoming       = myEvents.filter(ev => ev.date >= today)
  const nextEvent      = upcoming[0] ?? null
  const totalHours     = myEvents.reduce((s, ev) => s + (getMyRole(ev)?.hours ?? 0), 0)
  const totalEarnings  = myEvents.reduce((s, ev) => { const r = getMyRole(ev); return s + (r ? r.rate * r.hours : 0) }, 0)

  // Use the stored assignment ID for attendance (works for both pool IDs and Supabase UUIDs)
  const getPersonId    = (ev: AppEvent) => getMyAssignment(ev)?.personId ?? user?.id ?? ''
  const isCheckedIn    = (ev: AppEvent) => { const pid = getPersonId(ev); return !!(pid && ev.attendance?.[pid]) }
  const getCheckInTime = (ev: AppEvent) => {
    const ts = ev.attendance?.[getPersonId(ev)]
    return ts ? new Date(ts).toLocaleTimeString('en-SG', { hour: '2-digit', minute: '2-digit' }) : null
  }
  const checkedInCount = myEvents.filter(isCheckedIn).length
  const attRate        = myEvents.length > 0 ? Math.round((checkedInCount / myEvents.length) * 100) : 0

  const handleCheckIn  = (ev: AppEvent) => checkIn(ev.id, getPersonId(ev))
  const handleCheckOut = (ev: AppEvent) => checkOut(ev.id, getPersonId(ev))

  // ── Account linking helpers ────────────────────────────────────────────
  const handleClaimId = (personId: string) => {
    if (!user?.id) return
    saveLink(user.id, personId)
    setLinkedIds(prev => prev.includes(personId) ? prev : [...prev, personId])
  }

  // All assignment entries across all events that aren't already mine
  const linkCandidates = useMemo(() => {
    const q = linkSearch.toLowerCase().trim()
    if (!q) return []
    const seen = new Set<string>()
    const results: { eventId: string; eventName: string; personId: string; personName: string; role: string }[] = []
    for (const ev of events) {
      for (const [roleIdStr, people] of Object.entries(ev.assignments ?? {})) {
        for (const p of people) {
          if (matchesMe(p)) continue               // already mine — skip
          if (!p.name.toLowerCase().includes(q)) continue
          if (seen.has(`${ev.id}::${p.id}`)) continue
          seen.add(`${ev.id}::${p.id}`)
          const role = ev.staffRoles.find(r => r.id.toString() === roleIdStr)
          results.push({ eventId: ev.id, eventName: ev.name, personId: p.id, personName: p.name, role: role?.role ?? 'Staff' })
        }
      }
    }
    return results
  }, [events, linkSearch, linkedIds])

  // ── Month-grouped events for Schedule tab ──────────────────────────────
  const byMonth = useMemo(() => {
    const map: Record<string, AppEvent[]> = {}
    for (const ev of myEvents) {
      const key = ev.date.slice(0, 7)
      ;(map[key] ??= []).push(ev)
    }
    return Object.entries(map)
  }, [myEvents])

  return (
    <div className="p-4 md:p-8 max-w-[1100px]">

      {/* ── Header ─────────────────────────────────────────────────── */}
      <div className="flex items-start gap-4 mb-6">
        <Avatar name={user?.name ?? 'S'} size="lg" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl font-bold text-slate-900 truncate">
              Welcome back, {user?.name?.split(' ')[0]}
            </h1>
            {user?.tier && (
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${TIER_COLOR[user.tier] ?? 'bg-slate-100 text-slate-600'}`}>
                {user.tier}
              </span>
            )}
          </div>
          <p className="text-slate-500 text-sm mt-0.5">
            {new Date().toLocaleDateString('en-SG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
      </div>


      {/* ═══════════════════════════════════════════════════════════ */}
      {/* OVERVIEW                                                   */}
      {/* ═══════════════════════════════════════════════════════════ */}
      {tab === 'overview' && (
        <div>
          {/* Stats row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
            {[
              { label: 'Upcoming Shifts',  value: upcoming.length,                              icon: CalendarDays, c: 'text-blue-600',    bg: 'bg-blue-50'    },
              { label: 'Total Hours',      value: `${totalHours}h`,                             icon: Clock,        c: 'text-slate-700',   bg: 'bg-slate-50'   },
              { label: 'Est. Earnings',    value: `$${totalEarnings.toLocaleString()}`,         icon: DollarSign,   c: 'text-emerald-600', bg: 'bg-emerald-50' },
              { label: 'Attendance Rate',  value: `${attRate}%`,                                icon: Percent,      c: attRate >= 80 ? 'text-emerald-600' : 'text-amber-600', bg: attRate >= 80 ? 'bg-emerald-50' : 'bg-amber-50' },
            ].map(({ label, value, icon: Icon, c, bg }) => (
              <div key={label} className="bg-white rounded-xl border border-slate-200 p-4">
                <div className={`w-8 h-8 rounded-lg ${bg} flex items-center justify-center mb-3`}>
                  <Icon size={15} className={c} />
                </div>
                <p className={`text-2xl font-bold ${c}`}>{value}</p>
                <p className="text-xs text-slate-500 mt-0.5">{label}</p>
              </div>
            ))}
          </div>

          {/* Account linking panel — shown when no events found */}
          {myEvents.length === 0 && (
            <div className="bg-white rounded-xl border border-amber-200 p-5 mb-6">
              <div className="flex items-center gap-2 mb-1">
                <Link2 size={16} className="text-amber-500" />
                <h3 className="font-semibold text-slate-900 text-sm">Find Your Assignments</h3>
              </div>
              <p className="text-xs text-slate-500 mb-4">
                If your account was added to the staff pool before the EventOS update, search your name below to link your shifts.
              </p>
              <div className="relative mb-3">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  value={linkSearch}
                  onChange={e => setLinkSearch(e.target.value)}
                  placeholder="Type your name…"
                  className="w-full pl-8 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                />
              </div>
              {linkSearch.trim().length >= 2 && linkCandidates.length === 0 && (
                <p className="text-xs text-slate-400 text-center py-3">No assignments found for "{linkSearch}"</p>
              )}
              {linkCandidates.length > 0 && (
                <div className="space-y-2">
                  {linkCandidates.map(c => (
                    <div key={`${c.eventId}::${c.personId}`} className="flex items-center gap-3 p-3 rounded-lg border border-slate-100 hover:border-amber-200 bg-slate-50 hover:bg-amber-50 transition-colors">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-900 truncate">{c.personName}</p>
                        <p className="text-xs text-slate-400 truncate">{c.eventName} · {c.role}</p>
                      </div>
                      <button
                        onClick={() => handleClaimId(c.personId)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-amber-500 text-white rounded-lg text-xs font-bold hover:bg-amber-600 active:scale-95 transition-all shrink-0"
                      >
                        This is me <ChevronRight size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Next shift hero */}
          {nextEvent ? (() => {
            const role      = getMyRole(nextEvent)
            const checkedIn = isCheckedIn(nextEvent)
            const ciTime    = getCheckInTime(nextEvent)
            return (
              <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-5 md:p-6 mb-6 text-white">
                <p className="text-blue-200 text-xs font-bold uppercase tracking-wider mb-3">Next Shift</p>
                <h2 className="text-xl font-bold mb-2">{nextEvent.name}</h2>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-blue-100 text-sm mb-4">
                  <span className="flex items-center gap-1"><Calendar size={13} />{fmtDate(nextEvent.date)}</span>
                  <span className="flex items-center gap-1"><Clock size={13} />{fmtTime(nextEvent.from)}{nextEvent.to ? ` – ${fmtTime(nextEvent.to)}` : ''}</span>
                  <span className="flex items-center gap-1"><MapPin size={13} />{nextEvent.location}</span>
                </div>
                {role && (
                  <div className="flex flex-wrap items-center gap-2 mb-4">
                    <span className="px-2.5 py-1 bg-white/15 rounded-lg text-sm font-bold">{role.role}</span>
                    <span className="text-blue-200 text-sm">${role.rate}/hr · {role.hours} hrs = ${(role.rate * role.hours).toLocaleString()}</span>
                  </div>
                )}
                {checkedIn ? (
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500 rounded-xl">
                      <CheckCircle2 size={15} strokeWidth={2.5} />
                      <span className="font-bold text-sm">Clocked in at {ciTime}</span>
                    </div>
                    <button onClick={() => handleCheckOut(nextEvent)} className="text-blue-200 hover:text-white text-xs underline px-2">Undo</button>
                  </div>
                ) : (
                  <button
                    onClick={() => handleCheckIn(nextEvent)}
                    className="flex items-center gap-2 px-5 py-2.5 bg-white text-blue-700 rounded-xl font-bold text-sm hover:bg-blue-50 active:scale-95 transition-all"
                  >
                    <UserCheck size={15} /> Clock In
                  </button>
                )}
              </div>
            )
          })() : (
            <div className="bg-white rounded-xl border border-slate-200 p-8 text-center mb-6">
              <CalendarDays size={32} className="text-slate-200 mx-auto mb-3" />
              <p className="text-slate-500 font-medium">No upcoming shifts</p>
              <p className="text-slate-400 text-sm mt-1">Your director will assign you to upcoming events</p>
            </div>
          )}

          {/* All events compact list */}
          {myEvents.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-slate-600 mb-3">All My Events ({myEvents.length})</h3>
              <div className="space-y-2">
                {myEvents.map(ev => {
                  const role      = getMyRole(ev)
                  const checkedIn = isCheckedIn(ev)
                  const isPast    = ev.date < today
                  return (
                    <div key={ev.id} className={`bg-white rounded-xl border p-4 flex items-center gap-3 ${isPast ? 'border-slate-100 opacity-70' : 'border-slate-200'}`}>
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isPast ? 'bg-slate-100' : 'bg-blue-50'}`}>
                        <CalendarDays size={16} className={isPast ? 'text-slate-400' : 'text-blue-600'} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-slate-900 text-sm truncate">{ev.name}</p>
                        <p className="text-xs text-slate-400">{fmtDate(ev.date)} · {role?.role ?? 'Staff'}</p>
                      </div>
                      {role && <span className="text-xs font-semibold text-slate-500 hidden sm:block shrink-0">${(role.rate * role.hours).toLocaleString()}</span>}
                      {checkedIn
                        ? <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600 shrink-0"><CheckCircle2 size={12} />Attended</span>
                        : isPast
                        ? <span className="text-xs text-slate-400 shrink-0">—</span>
                        : <button onClick={() => handleCheckIn(ev)} className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 transition-colors shrink-0">Clock In</button>
                      }
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* MY EVENTS                                                  */}
      {/* ═══════════════════════════════════════════════════════════ */}
      {tab === 'events' && (
        <div className="space-y-4">
          {myEvents.length === 0 && (
            <>
              <div className="bg-white rounded-xl border border-slate-200 p-10 text-center mb-4">
                <Briefcase size={32} className="text-slate-200 mx-auto mb-3" />
                <p className="text-slate-500 font-medium mb-1">No events assigned yet</p>
                <p className="text-slate-400 text-sm">Your agency director will assign you to upcoming events</p>
              </div>
              <div className="bg-white rounded-xl border border-amber-200 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Link2 size={14} className="text-amber-500" />
                  <span className="text-sm font-semibold text-slate-900">Were you added before the EventOS update?</span>
                </div>
                <div className="relative mb-2">
                  <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    value={linkSearch}
                    onChange={e => setLinkSearch(e.target.value)}
                    placeholder="Search your name to link your shifts…"
                    className="w-full pl-8 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                  />
                </div>
                {linkCandidates.length > 0 && (
                  <div className="space-y-2 mt-2">
                    {linkCandidates.map(c => (
                      <div key={`${c.eventId}::${c.personId}`} className="flex items-center gap-3 p-3 rounded-lg border border-slate-100 bg-slate-50 hover:bg-amber-50 hover:border-amber-200 transition-colors">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-slate-900 truncate">{c.personName}</p>
                          <p className="text-xs text-slate-400 truncate">{c.eventName} · {c.role}</p>
                        </div>
                        <button
                          onClick={() => handleClaimId(c.personId)}
                          className="flex items-center gap-1 px-3 py-1.5 bg-amber-500 text-white rounded-lg text-xs font-bold hover:bg-amber-600 active:scale-95 transition-all shrink-0"
                        >
                          This is me <ChevronRight size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
          {myEvents.map(ev => {
            const role      = getMyRole(ev)
            const checkedIn = isCheckedIn(ev)
            const ciTime    = getCheckInTime(ev)
            const isPast    = ev.date < today
            return (
              <div key={ev.id} className={`bg-white rounded-xl border border-slate-200 p-5 ${isPast ? 'opacity-80' : ''}`}>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-block mb-1.5 ${isPast ? 'bg-slate-100 text-slate-500' : 'bg-blue-100 text-blue-700'}`}>
                      {isPast ? 'Past' : 'Upcoming'}
                    </span>
                    <h3 className="font-bold text-slate-900 text-base">{ev.name}</h3>
                  </div>
                  {checkedIn ? (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-100 text-emerald-700 rounded-lg shrink-0">
                      <CheckCircle2 size={13} strokeWidth={2.5} />
                      <span className="text-xs font-bold">In at {ciTime}</span>
                    </div>
                  ) : !isPast ? (
                    <button
                      onClick={() => handleCheckIn(ev)}
                      className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 active:scale-95 transition-all shrink-0"
                    >
                      <UserCheck size={13} /> Clock In
                    </button>
                  ) : null}
                </div>

                <div className="flex flex-wrap gap-x-4 gap-y-1 text-slate-400 text-xs mb-4">
                  <span className="flex items-center gap-1"><Calendar size={11} />{fmtDate(ev.date)}</span>
                  <span className="flex items-center gap-1"><Clock size={11} />{fmtTime(ev.from)}{ev.to ? ` – ${fmtTime(ev.to)}` : ''}</span>
                  <span className="flex items-center gap-1"><MapPin size={11} />{ev.location}</span>
                </div>

                {role && (
                  <div className="bg-slate-50 rounded-xl p-4">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {[
                        { label: 'Your Role',   value: role.role,                             color: 'text-slate-900' },
                        { label: 'Rate',        value: `$${role.rate}/hr`,                   color: 'text-slate-900' },
                        { label: 'Hours',       value: `${role.hours} hrs`,                  color: 'text-slate-900' },
                        { label: 'Earnings',    value: `$${(role.rate * role.hours).toLocaleString()}`, color: 'text-emerald-600' },
                      ].map(({ label, value, color }) => (
                        <div key={label}>
                          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-0.5">{label}</p>
                          <p className={`text-sm font-bold ${color}`}>{value}</p>
                        </div>
                      ))}
                    </div>
                    {role.responsibilities && (
                      <p className="text-xs text-slate-500 mt-3 pt-3 border-t border-slate-200">{role.responsibilities}</p>
                    )}
                  </div>
                )}

                {ev.notes && (
                  <div className="flex items-start gap-2 mt-3 p-3 bg-amber-50 border border-amber-100 rounded-lg">
                    <AlertCircle size={13} className="text-amber-500 mt-0.5 shrink-0" />
                    <p className="text-xs text-amber-800">{ev.notes}</p>
                  </div>
                )}

                {checkedIn && (
                  <div className="mt-2 text-right">
                    <button onClick={() => handleCheckOut(ev)} className="text-xs text-slate-400 hover:text-red-500 transition-colors">
                      Undo clock-in
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* SCHEDULE                                                   */}
      {/* ═══════════════════════════════════════════════════════════ */}
      {tab === 'schedule' && (
        <div>
          {myEvents.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
              <Calendar size={32} className="text-slate-200 mx-auto mb-3" />
              <p className="text-slate-500 font-medium">No shifts scheduled</p>
            </div>
          ) : (
            <div className="space-y-8">
              {byMonth.map(([monthKey, monthEvents]) => {
                const [y, m] = monthKey.split('-')
                const monthLabel = new Date(Number(y), Number(m) - 1).toLocaleString('en-SG', { month: 'long', year: 'numeric' })
                return (
                  <div key={monthKey}>
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">{monthLabel}</h3>
                    <div className="space-y-2">
                      {monthEvents.map(ev => {
                        const role      = getMyRole(ev)
                        const checkedIn = isCheckedIn(ev)
                        const isPast    = ev.date < today
                        const day       = new Date(ev.date + 'T00:00:00')
                        return (
                          <div key={ev.id} className={`flex items-center gap-4 bg-white border rounded-xl p-4 transition-colors ${isPast ? 'border-slate-100 opacity-70' : 'border-slate-200 hover:border-blue-200'}`}>
                            <div className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center shrink-0 ${isPast ? 'bg-slate-100' : 'bg-blue-50'}`}>
                              <p className={`text-[10px] font-bold uppercase ${isPast ? 'text-slate-400' : 'text-blue-500'}`}>
                                {day.toLocaleString('en-SG', { month: 'short' })}
                              </p>
                              <p className={`text-lg font-bold leading-none ${isPast ? 'text-slate-500' : 'text-blue-700'}`}>
                                {day.getDate()}
                              </p>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-slate-900 text-sm truncate">{ev.name}</p>
                              <p className="text-xs text-slate-400 mt-0.5">
                                {fmtTime(ev.from)}{ev.to ? ` – ${fmtTime(ev.to)}` : ''} · {role?.role ?? 'Staff'} · {ev.location}
                              </p>
                            </div>
                            {role && (
                              <span className="text-sm font-bold text-emerald-600 shrink-0 hidden sm:block">
                                ${(role.rate * role.hours).toLocaleString()}
                              </span>
                            )}
                            {checkedIn
                              ? <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600 shrink-0"><CheckCircle2 size={12} />Done</span>
                              : !isPast
                              ? <button onClick={() => handleCheckIn(ev)} className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 transition-colors shrink-0">Clock In</button>
                              : <span className="text-xs text-slate-400 shrink-0">—</span>
                            }
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* ATTENDANCE                                                 */}
      {/* ═══════════════════════════════════════════════════════════ */}
      {tab === 'attendance' && (
        <div>
          {/* Summary stats */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            {[
              { label: 'Total Events',  value: myEvents.length, color: 'text-slate-900' },
              { label: 'Attended',      value: checkedInCount,  color: 'text-emerald-600' },
              { label: 'Rate',          value: `${attRate}%`,   color: attRate >= 80 ? 'text-emerald-600' : 'text-amber-600' },
            ].map(({ label, value, color }) => (
              <div key={label} className="bg-white rounded-xl border border-slate-200 p-4 text-center">
                <p className={`text-2xl font-bold ${color}`}>{value}</p>
                <p className="text-xs text-slate-500 mt-1">{label}</p>
              </div>
            ))}
          </div>

          <div className="h-2 bg-slate-100 rounded-full overflow-hidden mb-6">
            <div
              className={`h-full rounded-full transition-all ${attRate >= 80 ? 'bg-emerald-500' : 'bg-amber-500'}`}
              style={{ width: `${attRate}%` }}
            />
          </div>

          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="px-5 py-3 bg-slate-50 border-b border-slate-100">
              <div className="grid grid-cols-[1fr_120px_auto] gap-4">
                {['Event', 'Date', 'Status'].map(h => (
                  <span key={h} className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{h}</span>
                ))}
              </div>
            </div>
            {myEvents.length === 0 ? (
              <div className="p-10 text-center text-slate-400 text-sm">No events yet</div>
            ) : (
              <div className="divide-y divide-slate-100">
                {[...myEvents].reverse().map(ev => {
                  const role      = getMyRole(ev)
                  const checkedIn = isCheckedIn(ev)
                  const ciTime    = getCheckInTime(ev)
                  const isPast    = ev.date < today
                  return (
                    <div key={ev.id} className="px-5 py-3.5 grid grid-cols-[1fr_120px_auto] gap-4 items-center hover:bg-slate-50 transition-colors">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-900 truncate">{ev.name}</p>
                        {role && <p className="text-xs text-slate-400 truncate">{role.role}</p>}
                      </div>
                      <p className="text-xs text-slate-500 whitespace-nowrap">{fmtDate(ev.date)}</p>
                      {checkedIn
                        ? <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600 whitespace-nowrap">
                            <CheckCircle2 size={12} strokeWidth={2.5} />{ciTime}
                          </span>
                        : !isPast
                        ? <button onClick={() => handleCheckIn(ev)} className="text-xs font-semibold text-blue-600 hover:underline whitespace-nowrap">Clock In</button>
                        : <span className="text-xs text-slate-400 whitespace-nowrap">Not attended</span>
                      }
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  )
}
