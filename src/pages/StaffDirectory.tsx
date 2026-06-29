import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search } from 'lucide-react'
import Avatar from '../components/Avatar'
import { useEvents, STAFF_POOL, AssignedPerson } from '../context/EventsContext'

type Tier = 'Expert' | 'Senior' | 'Junior'

const TIER_BADGE: Record<Tier, string> = {
  Expert: 'bg-amber-100 text-amber-700',
  Senior: 'bg-blue-100 text-blue-700',
  Junior: 'bg-slate-100 text-slate-600',
}

interface StaffRow {
  person: AssignedPerson
  assignedEvents: { eventName: string; eventId: string; roleName: string }[]
  status: 'On-Duty' | 'Available'
}

export default function StaffDirectory() {
  const navigate = useNavigate()
  const { events } = useEvents()
  const [tab, setTab] = useState<'All' | 'Available' | 'Assigned'>('All')
  const [search, setSearch] = useState('')

  // Build assignment map: personId → list of {event, role} assignments
  const assignmentMap = new Map<string, { eventName: string; eventId: string; roleName: string }[]>()
  events.forEach(ev => {
    Object.entries(ev.assignments || {}).forEach(([roleIdStr, people]) => {
      const roleDef = ev.staffRoles.find(r => r.id.toString() === roleIdStr)
      people.forEach(person => {
        const existing = assignmentMap.get(person.id) || []
        existing.push({ eventName: ev.name, eventId: ev.id, roleName: roleDef?.role || 'Staff' })
        assignmentMap.set(person.id, existing)
      })
    })
  })

  // Collect custom people (assigned to events but not in pool) — deduplicated
  const seenCustom = new Set<string>()
  const customPeople: AssignedPerson[] = []
  events.forEach(ev => {
    Object.values(ev.assignments || {}).forEach(people => {
      people.forEach(person => {
        if (!STAFF_POOL.find(p => p.id === person.id) && !seenCustom.has(person.id)) {
          customPeople.push(person)
          seenCustom.add(person.id)
        }
      })
    })
  })

  const fullPool = [...STAFF_POOL, ...customPeople]

  const rows: StaffRow[] = fullPool.map(person => ({
    person,
    assignedEvents: assignmentMap.get(person.id) || [],
    status: assignmentMap.has(person.id) ? 'On-Duty' : 'Available',
  }))

  const filtered = rows.filter(row => {
    if (tab === 'Available' && row.status !== 'Available') return false
    if (tab === 'Assigned' && row.status !== 'On-Duty') return false
    if (search && !row.person.name.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const totalStaff = fullPool.length
  const onDuty = rows.filter(r => r.status === 'On-Duty').length
  const available = totalStaff - onDuty

  return (
    <div className="p-4 md:p-8 max-w-[1400px]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6 md:mb-7">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900">Staff Directory</h1>
          <p className="text-slate-500 text-sm mt-1">Track all staff assigned across your events</p>
        </div>
        <button
          onClick={() => navigate('/events')}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors shadow-md shadow-blue-600/20 self-start"
        >
          Assign via Events →
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-5 mb-6 md:mb-7">
        {[
          { label: 'Total in Pool', value: totalStaff, sub: 'Registered members',    dot: 'bg-slate-400' },
          { label: 'Available Now', value: available,  sub: 'Ready to be assigned',  dot: 'bg-emerald-500' },
          { label: 'On-Duty',       value: onDuty,     sub: 'Currently at events',   dot: 'bg-blue-500' },
        ].map(({ label, value, sub, dot }) => (
          <div key={label} className="bg-white rounded-xl border border-slate-200 p-4 md:p-5 flex items-center gap-4">
            <div className={`w-3 h-3 rounded-full shrink-0 ${dot}`} />
            <div>
              <p className="text-2xl md:text-3xl font-bold text-slate-900">{value}</p>
              <p className="text-sm font-medium text-slate-500 mt-0.5">{label}</p>
              <p className="text-xs text-slate-400 hidden md:block">{sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Table card */}
      <div className="bg-white rounded-xl border border-slate-200">
        {/* Tabs + search */}
        <div className="px-4 md:px-5 pt-4 pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex gap-1">
            {(['All', 'Available', 'Assigned'] as const).map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-3 md:px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  tab === t ? 'bg-blue-600 text-white' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                }`}
              >
                {t}
                {t === 'Assigned' && onDuty > 0 && (
                  <span className={`ml-1.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full ${tab === 'Assigned' ? 'bg-white/20 text-white' : 'bg-blue-100 text-blue-700'}`}>
                    {onDuty}
                  </span>
                )}
              </button>
            ))}
          </div>
          <div className="relative flex-1 sm:flex-none">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search staff..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 w-full sm:w-52 transition-colors"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto mt-3">
          <table className="w-full min-w-[620px]">
            <thead>
              <tr className="border-y border-slate-100 bg-slate-50">
                {['Staff Member', 'Tier', 'Status', 'Assigned Event / Role', 'Actions'].map((col, i) => (
                  <th
                    key={col}
                    className={`px-4 md:px-5 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider ${
                      i === 5 ? 'text-right' : 'text-left'
                    }`}
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(({ person, assignedEvents, status }) => (
                <tr key={person.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 md:px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <Avatar name={person.name} size="sm" />
                      <div>
                        <p className="text-sm font-semibold text-slate-900 whitespace-nowrap">{person.name}</p>
                        {person.phone && <p className="text-xs text-slate-400">{person.phone}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 md:px-5 py-3.5">
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${TIER_BADGE[person.tier]}`}>
                      {person.tier}
                    </span>
                  </td>
                  <td className="px-4 md:px-5 py-3.5">
                    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap ${
                      status === 'On-Duty' ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${status === 'On-Duty' ? 'bg-blue-500' : 'bg-emerald-500'}`} />
                      {status}
                    </span>
                  </td>
                  <td className="px-4 md:px-5 py-3.5">
                    {assignedEvents.length === 0 ? (
                      <span className="text-xs text-slate-400">—</span>
                    ) : (
                      <div className="space-y-0.5">
                        {assignedEvents.slice(0, 2).map((ae, i) => (
                          <button
                            key={i}
                            onClick={() => navigate(`/events/${ae.eventId}/staff`)}
                            className="block text-xs text-blue-600 font-semibold hover:underline text-left whitespace-nowrap"
                          >
                            {ae.eventName} · {ae.roleName}
                          </button>
                        ))}
                        {assignedEvents.length > 2 && (
                          <p className="text-xs text-slate-400">+{assignedEvents.length - 2} more</p>
                        )}
                      </div>
                    )}
                  </td>
                  <td className="px-4 md:px-5 py-3.5 text-right">
                    {assignedEvents.length > 0 ? (
                      <button
                        onClick={() => navigate(`/events/${assignedEvents[0].eventId}/staff`)}
                        className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
                      >
                        View
                      </button>
                    ) : (
                      <button
                        onClick={() => navigate('/events')}
                        className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
                      >
                        Assign
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-slate-400 text-sm">
                    {tab === 'Assigned'
                      ? 'No staff currently on duty. Go to Events → Manage Staff to assign people.'
                      : 'No staff members found.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="px-4 md:px-5 py-3.5 border-t border-slate-100">
          <p className="text-sm text-slate-400">
            Showing {filtered.length} of {rows.length} staff members
          </p>
        </div>
      </div>
    </div>
  )
}
