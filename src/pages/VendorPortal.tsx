import { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  CalendarDays, Calendar, Clock, DollarSign, CheckCircle2,
  MapPin, Package, Percent, TrendingUp, AlertCircle, Store,
} from 'lucide-react'
import Avatar from '../components/Avatar'
import { useAuth } from '../context/AuthContext'
import { useEvents, fmtDate, fmtTime, type AppEvent, type AssignedVendor } from '../context/EventsContext'

type Tab = 'overview' | 'bookings' | 'schedule' | 'revenue'

const TIER_COLOR: Record<string, string> = {
  Premium:  'bg-amber-100 text-amber-700',
  Standard: 'bg-blue-100 text-blue-700',
  Budget:   'bg-slate-100 text-slate-600',
}

export default function VendorPortal() {
  const { user } = useAuth()
  const { events, checkIn, checkOut } = useEvents()
  const [searchParams] = useSearchParams()
  const tab = (searchParams.get('tab') ?? 'overview') as Tab

  const today = new Date().toISOString().split('T')[0]

  // Match by Supabase ID or by company name (for demo vendors added manually)
  const matchesVendor = (v: AssignedVendor) =>
    (user?.id && v.id === user.id) ||
    (user?.company && v.company.toLowerCase() === user.company.toLowerCase())

  const myBookings = useMemo(() => {
    if (!user) return []
    return events
      .filter(ev =>
        Object.values(ev.vendorAssignments || {}).some(vendors =>
          vendors.some(v => matchesVendor(v))
        )
      )
      .sort((a, b) => a.date.localeCompare(b.date))
  }, [events, user])

  const getMyVendorEntry = (ev: AppEvent): AssignedVendor | null => {
    for (const vendors of Object.values(ev.vendorAssignments || {})) {
      const found = vendors.find(v => matchesVendor(v))
      if (found) return found
    }
    return null
  }

  const getMyService = (ev: AppEvent) => {
    for (const [serviceIdStr, vendors] of Object.entries(ev.vendorAssignments || {})) {
      if (vendors.some(v => matchesVendor(v))) {
        return ev.vendorServices?.find(s => s.id.toString() === serviceIdStr) ?? null
      }
    }
    return null
  }

  const upcoming       = myBookings.filter(ev => ev.date >= today)
  const nextBooking    = upcoming[0] ?? null
  const totalRevenue   = myBookings.reduce((s, ev) => s + (getMyVendorEntry(ev)?.quote ?? 0), 0)
  // Use the stored vendor assignment ID (covers both pool IDs and Supabase UUIDs)
  const getVendorId    = (ev: AppEvent) => getMyVendorEntry(ev)?.id ?? user?.id ?? ''
  const isCheckedIn    = (ev: AppEvent) => { const vid = getVendorId(ev); return !!(vid && ev.attendance?.[vid]) }
  const getCheckInTime = (ev: AppEvent) => {
    const ts = ev.attendance?.[getVendorId(ev)]
    return ts ? new Date(ts).toLocaleTimeString('en-SG', { hour: '2-digit', minute: '2-digit' }) : null
  }
  const checkedInCount = myBookings.filter(isCheckedIn).length
  const arrivalRate    = myBookings.length > 0 ? Math.round((checkedInCount / myBookings.length) * 100) : 0

  const handleCheckIn  = (ev: AppEvent) => checkIn(ev.id, getVendorId(ev))
  const handleCheckOut = (ev: AppEvent) => checkOut(ev.id, getVendorId(ev))

  const byMonth = useMemo(() => {
    const map: Record<string, AppEvent[]> = {}
    for (const ev of myBookings) {
      const key = ev.date.slice(0, 7)
      ;(map[key] ??= []).push(ev)
    }
    return Object.entries(map)
  }, [myBookings])

  return (
    <div className="p-4 md:p-8 max-w-[1100px]">

      {/* ── Header ─────────────────────────────────────────────────── */}
      <div className="flex items-start gap-4 mb-6">
        <Avatar name={user?.company ?? user?.name ?? 'V'} size="lg" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl font-bold text-slate-900 truncate">
              {user?.company ?? user?.name ?? 'Vendor'}
            </h1>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
              Vendor
            </span>
          </div>
          <p className="text-slate-500 text-sm mt-0.5">
            {user?.service && <span className="mr-2">{user.service}</span>}
            {new Date().toLocaleDateString('en-SG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
      </div>


      {/* ═══════════════════════════════════════════════════════════ */}
      {/* OVERVIEW                                                   */}
      {/* ═══════════════════════════════════════════════════════════ */}
      {tab === 'overview' && (
        <div>
          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
            {[
              { label: 'Active Bookings', value: upcoming.length,                       icon: CalendarDays, c: 'text-emerald-600', bg: 'bg-emerald-50' },
              { label: 'Total Bookings',  value: myBookings.length,                     icon: Store,        c: 'text-slate-700',   bg: 'bg-slate-50'   },
              { label: 'Total Revenue',   value: `$${totalRevenue.toLocaleString()}`,   icon: DollarSign,   c: 'text-emerald-600', bg: 'bg-emerald-50' },
              { label: 'Arrival Rate',    value: `${arrivalRate}%`,                     icon: Percent,      c: arrivalRate >= 80 ? 'text-emerald-600' : 'text-amber-600', bg: arrivalRate >= 80 ? 'bg-emerald-50' : 'bg-amber-50' },
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

          {/* Next booking hero */}
          {nextBooking ? (() => {
            const vendorEntry = getMyVendorEntry(nextBooking)
            const service     = getMyService(nextBooking)
            const checkedIn   = isCheckedIn(nextBooking)
            const ciTime      = getCheckInTime(nextBooking)
            return (
              <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-2xl p-5 md:p-6 mb-6 text-white">
                <p className="text-emerald-200 text-xs font-bold uppercase tracking-wider mb-3">Next Event</p>
                <h2 className="text-xl font-bold mb-2">{nextBooking.name}</h2>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-emerald-100 text-sm mb-4">
                  <span className="flex items-center gap-1"><Calendar size={13} />{fmtDate(nextBooking.date)}</span>
                  <span className="flex items-center gap-1"><Clock size={13} />{fmtTime(nextBooking.from)}{nextBooking.to ? ` – ${fmtTime(nextBooking.to)}` : ''}</span>
                  <span className="flex items-center gap-1"><MapPin size={13} />{nextBooking.location}</span>
                </div>
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  {service && <span className="px-2.5 py-1 bg-white/15 rounded-lg text-sm font-bold">{service.service}</span>}
                  {service?.type === 'participant'
                    ? <span className="text-emerald-200 text-sm">Booth fee: ${service.budget.toLocaleString()}</span>
                    : vendorEntry?.quote
                    ? <span className="text-emerald-200 text-sm">Quote: ${vendorEntry.quote.toLocaleString()}</span>
                    : null
                  }
                  {vendorEntry?.tier && (
                    <span className="px-2 py-0.5 bg-white/10 rounded text-xs font-semibold text-emerald-100">{vendorEntry.tier}</span>
                  )}
                </div>
                {checkedIn ? (
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2 px-4 py-2 bg-white/20 rounded-xl">
                      <CheckCircle2 size={15} strokeWidth={2.5} />
                      <span className="font-bold text-sm">Confirmed arrival at {ciTime}</span>
                    </div>
                    <button onClick={() => handleCheckOut(nextBooking)} className="text-emerald-200 hover:text-white text-xs underline px-2">Undo</button>
                  </div>
                ) : (
                  <button
                    onClick={() => handleCheckIn(nextBooking)}
                    className="flex items-center gap-2 px-5 py-2.5 bg-white text-emerald-700 rounded-xl font-bold text-sm hover:bg-emerald-50 active:scale-95 transition-all"
                  >
                    <CheckCircle2 size={15} /> Confirm Arrival
                  </button>
                )}
              </div>
            )
          })() : (
            <div className="bg-white rounded-xl border border-slate-200 p-8 text-center mb-6">
              <Package size={32} className="text-slate-200 mx-auto mb-3" />
              <p className="text-slate-500 font-medium">No upcoming bookings</p>
              <p className="text-slate-400 text-sm mt-1">Directors will book your services for their events</p>
            </div>
          )}

          {/* All bookings compact list */}
          {myBookings.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-slate-600 mb-3">All My Bookings ({myBookings.length})</h3>
              <div className="space-y-2">
                {myBookings.map(ev => {
                  const service   = getMyService(ev)
                  const entry     = getMyVendorEntry(ev)
                  const checkedIn = isCheckedIn(ev)
                  const isPast    = ev.date < today
                  return (
                    <div key={ev.id} className={`bg-white rounded-xl border p-4 flex items-center gap-3 ${isPast ? 'border-slate-100 opacity-70' : 'border-slate-200'}`}>
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isPast ? 'bg-slate-100' : 'bg-emerald-50'}`}>
                        <Package size={16} className={isPast ? 'text-slate-400' : 'text-emerald-600'} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-slate-900 text-sm truncate">{ev.name}</p>
                        <p className="text-xs text-slate-400">{fmtDate(ev.date)} · {service?.service ?? 'Vendor Service'}</p>
                      </div>
                      {entry?.quote ? (
                        <span className="text-xs font-semibold text-slate-500 hidden sm:block shrink-0">
                          ${entry.quote.toLocaleString()}
                        </span>
                      ) : null}
                      {checkedIn
                        ? <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600 shrink-0"><CheckCircle2 size={12} />Arrived</span>
                        : isPast
                        ? <span className="text-xs text-slate-400 shrink-0">—</span>
                        : <button onClick={() => handleCheckIn(ev)} className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700 transition-colors shrink-0">Confirm</button>
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
      {/* MY BOOKINGS                                                */}
      {/* ═══════════════════════════════════════════════════════════ */}
      {tab === 'bookings' && (
        <div className="space-y-4">
          {myBookings.length === 0 && (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
              <Package size={32} className="text-slate-200 mx-auto mb-3" />
              <p className="text-slate-500 font-medium mb-1">No bookings yet</p>
              <p className="text-slate-400 text-sm">Event directors will book your services and you'll see them here</p>
            </div>
          )}
          {myBookings.map(ev => {
            const service   = getMyService(ev)
            const entry     = getMyVendorEntry(ev)
            const checkedIn = isCheckedIn(ev)
            const ciTime    = getCheckInTime(ev)
            const isPast    = ev.date < today
            return (
              <div key={ev.id} className={`bg-white rounded-xl border border-slate-200 p-5 ${isPast ? 'opacity-80' : ''}`}>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-block mb-1.5 ${isPast ? 'bg-slate-100 text-slate-500' : 'bg-emerald-100 text-emerald-700'}`}>
                      {isPast ? 'Past' : 'Upcoming'}
                    </span>
                    <h3 className="font-bold text-slate-900 text-base">{ev.name}</h3>
                  </div>
                  {checkedIn ? (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-100 text-emerald-700 rounded-lg shrink-0">
                      <CheckCircle2 size={13} strokeWidth={2.5} />
                      <span className="text-xs font-bold">Arrived at {ciTime}</span>
                    </div>
                  ) : !isPast ? (
                    <button
                      onClick={() => handleCheckIn(ev)}
                      className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700 active:scale-95 transition-all shrink-0"
                    >
                      <CheckCircle2 size={13} /> Confirm Arrival
                    </button>
                  ) : null}
                </div>

                <div className="flex flex-wrap gap-x-4 gap-y-1 text-slate-400 text-xs mb-4">
                  <span className="flex items-center gap-1"><Calendar size={11} />{fmtDate(ev.date)}</span>
                  <span className="flex items-center gap-1"><Clock size={11} />{fmtTime(ev.from)}{ev.to ? ` – ${fmtTime(ev.to)}` : ''}</span>
                  <span className="flex items-center gap-1"><MapPin size={11} />{ev.location}</span>
                </div>

                <div className="bg-slate-50 rounded-xl p-4">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                      { label: 'Service Type',  value: service?.service ?? user?.service ?? '—', color: 'text-slate-900' },
                      { label: 'Tier',          value: entry?.tier ?? '—',                       color: 'text-slate-900' },
                      { label: 'Quote',         value: entry?.quote ? `$${entry.quote.toLocaleString()}` : 'TBC', color: 'text-emerald-600' },
                      { label: 'Type',          value: service?.type === 'participant' ? 'Exhibitor Booth' : 'Service Provider', color: 'text-slate-900' },
                    ].map(({ label, value, color }) => (
                      <div key={label}>
                        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-0.5">{label}</p>
                        <p className={`text-sm font-bold ${color}`}>{value}</p>
                      </div>
                    ))}
                  </div>
                  {service?.description && (
                    <p className="text-xs text-slate-500 mt-3 pt-3 border-t border-slate-200">{service.description}</p>
                  )}
                </div>

                {ev.notes && (
                  <div className="flex items-start gap-2 mt-3 p-3 bg-amber-50 border border-amber-100 rounded-lg">
                    <AlertCircle size={13} className="text-amber-500 mt-0.5 shrink-0" />
                    <p className="text-xs text-amber-800">{ev.notes}</p>
                  </div>
                )}

                {checkedIn && (
                  <div className="mt-2 text-right">
                    <button onClick={() => handleCheckOut(ev)} className="text-xs text-slate-400 hover:text-red-500 transition-colors">
                      Undo arrival confirmation
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
          {myBookings.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
              <Calendar size={32} className="text-slate-200 mx-auto mb-3" />
              <p className="text-slate-500 font-medium">No bookings scheduled</p>
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
                        const service   = getMyService(ev)
                        const entry     = getMyVendorEntry(ev)
                        const checkedIn = isCheckedIn(ev)
                        const isPast    = ev.date < today
                        const day       = new Date(ev.date + 'T00:00:00')
                        return (
                          <div key={ev.id} className={`flex items-center gap-4 bg-white border rounded-xl p-4 transition-colors ${isPast ? 'border-slate-100 opacity-70' : 'border-slate-200 hover:border-emerald-200'}`}>
                            <div className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center shrink-0 ${isPast ? 'bg-slate-100' : 'bg-emerald-50'}`}>
                              <p className={`text-[10px] font-bold uppercase ${isPast ? 'text-slate-400' : 'text-emerald-500'}`}>
                                {day.toLocaleString('en-SG', { month: 'short' })}
                              </p>
                              <p className={`text-lg font-bold leading-none ${isPast ? 'text-slate-500' : 'text-emerald-700'}`}>
                                {day.getDate()}
                              </p>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-slate-900 text-sm truncate">{ev.name}</p>
                              <p className="text-xs text-slate-400 mt-0.5">
                                {fmtTime(ev.from)}{ev.to ? ` – ${fmtTime(ev.to)}` : ''} · {service?.service ?? 'Service'} · {ev.location}
                              </p>
                            </div>
                            {entry?.quote ? (
                              <span className="text-sm font-bold text-emerald-600 shrink-0 hidden sm:block">
                                ${entry.quote.toLocaleString()}
                              </span>
                            ) : null}
                            {checkedIn
                              ? <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600 shrink-0"><CheckCircle2 size={12} />Arrived</span>
                              : !isPast
                              ? <button onClick={() => handleCheckIn(ev)} className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700 transition-colors shrink-0">Confirm</button>
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
      {/* REVENUE                                                    */}
      {/* ═══════════════════════════════════════════════════════════ */}
      {tab === 'revenue' && (
        <div>
          {/* Revenue summary */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
            {[
              { label: 'Total Revenue',   value: `$${totalRevenue.toLocaleString()}`,                                                  c: 'text-emerald-600' },
              { label: 'Confirmed Events', value: checkedInCount,                                                                       c: 'text-slate-900'   },
              { label: 'Pending Events',  value: myBookings.filter(ev => ev.date >= today && !isCheckedIn(ev)).length,                 c: 'text-amber-600'   },
            ].map(({ label, value, c }) => (
              <div key={label} className="bg-white rounded-xl border border-slate-200 p-4 text-center">
                <p className={`text-2xl font-bold ${c}`}>{value}</p>
                <p className="text-xs text-slate-500 mt-1">{label}</p>
              </div>
            ))}
          </div>

          {/* Revenue breakdown table */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="px-5 py-3 bg-slate-50 border-b border-slate-100">
              <div className="grid grid-cols-[1fr_120px_100px_auto] gap-4">
                {['Event', 'Date', 'Service', 'Quote'].map(h => (
                  <span key={h} className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{h}</span>
                ))}
              </div>
            </div>
            {myBookings.length === 0 ? (
              <div className="p-10 text-center text-slate-400 text-sm">No bookings yet</div>
            ) : (
              <div className="divide-y divide-slate-100">
                {[...myBookings].reverse().map(ev => {
                  const service   = getMyService(ev)
                  const entry     = getMyVendorEntry(ev)
                  const checkedIn = isCheckedIn(ev)
                  return (
                    <div key={ev.id} className="px-5 py-3.5 grid grid-cols-[1fr_120px_100px_auto] gap-4 items-center hover:bg-slate-50 transition-colors">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-900 truncate">{ev.name}</p>
                      </div>
                      <p className="text-xs text-slate-500 whitespace-nowrap">{fmtDate(ev.date)}</p>
                      <p className="text-xs text-slate-500 truncate">{service?.service ?? '—'}</p>
                      <div className="text-right">
                        {entry?.quote
                          ? <span className="text-sm font-bold text-emerald-600">${entry.quote.toLocaleString()}</span>
                          : <span className="text-xs text-slate-400">TBC</span>
                        }
                        {checkedIn && <span className="ml-2 text-[10px] text-emerald-500">✓</span>}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
            {totalRevenue > 0 && (
              <div className="px-5 py-3.5 border-t-2 border-slate-200 bg-slate-50 flex items-center justify-between">
                <span className="text-sm font-bold text-slate-700">Total</span>
                <span className="text-base font-bold text-emerald-600">${totalRevenue.toLocaleString()}</span>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  )
}
