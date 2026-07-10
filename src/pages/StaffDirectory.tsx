import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Plus, Pencil, Trash2, Check, X, UserPlus, CalendarX, Globe, Loader2 } from 'lucide-react'
import Avatar from '../components/Avatar'
import { useEvents, AssignedPerson } from '../context/EventsContext'
import { useToast } from '../context/ToastContext'
import { supabase, type Profile } from '../lib/supabase'

type Tier = 'Expert' | 'Senior' | 'Junior'

const TIER_BADGE: Record<Tier, string> = {
  Expert: 'bg-amber-100 text-amber-700',
  Senior: 'bg-blue-100 text-blue-700',
  Junior: 'bg-slate-100 text-slate-600',
}

const emptyDraft = (): Omit<AssignedPerson, 'id'> => ({
  name: '', phone: '', tier: 'Junior', unavailableDates: [],
})

interface StaffRow {
  person: AssignedPerson
  assignedEvents: { eventName: string; eventId: string; roleName: string }[]
  status: 'On-Duty' | 'Available'
}

export default function StaffDirectory() {
  const navigate = useNavigate()
  const { events, staffPool, addStaffMember, editStaffMember, removeStaffMember } = useEvents()
  const toast = useToast()

  const [tab, setTab]           = useState<'All' | 'Available' | 'Assigned'>('All')
  const [search, setSearch]     = useState('')
  const [showAdd, setShowAdd]   = useState(false)
  const [addPanel, setAddPanel] = useState<'manual' | 'eventoS'>('manual')
  const [addDraft, setAddDraft] = useState(emptyDraft())
  const [addDate, setAddDate]   = useState('')

  // EventOS account search
  const [eventosQ, setEventosQ]           = useState('')
  const [eventosResults, setEventosResults] = useState<Profile[]>([])
  const [eventosLoading, setEventosLoading] = useState(false)

  const [editingId, setEditingId]   = useState<string | null>(null)
  const [editDraft, setEditDraft]   = useState<AssignedPerson | null>(null)
  const [editDate, setEditDate]     = useState('')
  const [deleteError, setDeleteError] = useState<string | null>(null)

  // Build assignment map: personId → list of assignments
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

  // Custom people (in event assignments but not in managed pool)
  const seenCustom = new Set<string>()
  const customPeople: AssignedPerson[] = []
  events.forEach(ev => {
    Object.values(ev.assignments || {}).forEach(people => {
      people.forEach(person => {
        if (!staffPool.find(p => p.id === person.id) && !seenCustom.has(person.id)) {
          customPeople.push(person)
          seenCustom.add(person.id)
        }
      })
    })
  })

  const fullPool = [...staffPool, ...customPeople]

  const rows: StaffRow[] = fullPool.map(person => ({
    person,
    assignedEvents: assignmentMap.get(person.id) || [],
    status: assignmentMap.has(person.id) ? 'On-Duty' : 'Available',
  }))

  const filtered = rows.filter(row => {
    if (tab === 'Available' && row.status !== 'Available') return false
    if (tab === 'Assigned'  && row.status !== 'On-Duty')  return false
    if (search && !row.person.name.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const totalStaff = fullPool.length
  const onDuty     = rows.filter(r => r.status === 'On-Duty').length
  const available  = totalStaff - onDuty

  // EventOS search
  const searchEventOS = async (q: string) => {
    if (!q.trim()) { setEventosResults([]); return }
    setEventosLoading(true)
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'Staff')
      .ilike('name', `%${q.trim()}%`)
      .limit(15)
    setEventosResults(data ?? [])
    setEventosLoading(false)
  }

  const addFromEventOS = (profile: Profile) => {
    if (fullPool.find(p => p.id === profile.id)) {
      toast.show(`${profile.name} is already in the pool`, 'info')
      return
    }
    addStaffMember({
      id: profile.id,
      name: profile.name,
      phone: profile.phone || '',
      tier: (profile.tier as Tier) || 'Junior',
      unavailableDates: [],
    })
    toast.show(`${profile.name} added to staff pool`)
  }

  // Add staff
  const handleAdd = () => {
    if (!addDraft.name.trim()) return
    addStaffMember({
      id: `sp-${Date.now()}`,
      name: addDraft.name.trim(),
      phone: addDraft.phone.trim(),
      tier: addDraft.tier,
      unavailableDates: addDraft.unavailableDates || [],
    })
    toast.show(`${addDraft.name.trim()} added to the staff pool`)
    setAddDraft(emptyDraft())
    setAddDate('')
    setShowAdd(false)
  }

  const addUnavailableDate = (date: string, list: string[], setList: (d: string[]) => void, setDate: (s: string) => void) => {
    if (!date || list.includes(date)) return
    setList([...list, date].sort())
    setDate('')
  }

  // Edit staff
  const startEdit = (person: AssignedPerson) => {
    setEditingId(person.id)
    setEditDraft({ ...person, unavailableDates: person.unavailableDates || [] })
    setEditDate('')
    setDeleteError(null)
  }

  const saveEdit = () => {
    if (!editDraft || !editDraft.name.trim()) return
    editStaffMember(editDraft)
    toast.show(`${editDraft.name.trim()}'s profile updated`)
    setEditingId(null)
    setEditDraft(null)
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditDraft(null)
  }

  // Delete staff
  const handleDelete = (personId: string) => {
    const isAssigned = assignmentMap.has(personId)
    if (isAssigned) {
      setDeleteError(personId)
      setTimeout(() => setDeleteError(null), 3000)
      toast.show('Cannot remove staff with active assignments', 'error')
      return
    }
    const person = fullPool.find(p => p.id === personId)
    removeStaffMember(personId)
    toast.show(`${person?.name || 'Staff member'} removed from pool`, 'info')
  }

  return (
    <div className="p-4 md:p-8 max-w-[1400px]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6 md:mb-7">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900">Staff Directory</h1>
          <p className="text-slate-500 text-sm mt-1">Manage your staff pool and track assignments</p>
        </div>
        <button
          onClick={() => { setShowAdd(v => !v); setDeleteError(null) }}
          className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg text-sm font-semibold hover:bg-amber-700 transition-colors shadow-md shadow-amber-600/20 self-start"
        >
          <UserPlus size={15} />
          Add Staff
        </button>
      </div>

      {/* Add Staff Panel */}
      {showAdd && (
        <div className="bg-white border border-slate-200 rounded-xl mb-5 shadow-sm overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-slate-200">
            <button
              onClick={() => setAddPanel('manual')}
              className={`flex items-center gap-2 px-5 py-3.5 text-sm font-semibold border-b-2 transition-colors ${addPanel === 'manual' ? 'border-amber-500 text-amber-700 bg-amber-50/40' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
            >
              <Plus size={14} /> Add Manually
            </button>
            <button
              onClick={() => setAddPanel('eventoS')}
              className={`flex items-center gap-2 px-5 py-3.5 text-sm font-semibold border-b-2 transition-colors ${addPanel === 'eventoS' ? 'border-blue-500 text-blue-700 bg-blue-50/40' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
            >
              <Globe size={14} /> EventOS Accounts
            </button>
            <button
              onClick={() => { setShowAdd(false); setAddDraft(emptyDraft()); setAddDate(''); setEventosQ(''); setEventosResults([]) }}
              className="ml-auto px-4 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X size={15} />
            </button>
          </div>

          <div className="p-5">
            {/* ── Manual tab ───────────────────────────────────── */}
            {addPanel === 'manual' && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1 block">Full Name *</label>
                    <input type="text" placeholder="e.g. John Tan" value={addDraft.name}
                      onChange={e => setAddDraft(d => ({ ...d, name: e.target.value }))} autoFocus
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-50 transition-colors" />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1 block">Phone</label>
                    <input type="tel" placeholder="e.g. 9123 4567" value={addDraft.phone}
                      onChange={e => setAddDraft(d => ({ ...d, phone: e.target.value }))}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-50 transition-colors" />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1 block">Tier</label>
                    <select value={addDraft.tier} onChange={e => setAddDraft(d => ({ ...d, tier: e.target.value as Tier }))}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-50 transition-colors">
                      <option value="Junior">Junior</option>
                      <option value="Senior">Senior</option>
                      <option value="Expert">Expert</option>
                    </select>
                  </div>
                </div>
                <div className="mb-4">
                  <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1 block">
                    <CalendarX size={11} />Unavailable Dates
                  </label>
                  <div className="flex gap-2 mb-2">
                    <input type="date" value={addDate} onChange={e => setAddDate(e.target.value)}
                      className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-amber-400 transition-colors" />
                    <button onClick={() => addUnavailableDate(addDate, addDraft.unavailableDates || [], d => setAddDraft(p => ({ ...p, unavailableDates: d })), setAddDate)}
                      className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-200 transition-colors">
                      Block date
                    </button>
                  </div>
                  {(addDraft.unavailableDates || []).length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {(addDraft.unavailableDates || []).map(d => (
                        <span key={d} className="flex items-center gap-1 px-2 py-0.5 bg-red-50 text-red-700 rounded text-xs font-medium border border-red-100">
                          {d}
                          <button onClick={() => setAddDraft(p => ({ ...p, unavailableDates: (p.unavailableDates || []).filter(x => x !== d) }))}><X size={10} /></button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <button onClick={handleAdd} disabled={!addDraft.name.trim()}
                  className="px-4 py-2 bg-amber-600 text-white rounded-lg text-sm font-semibold hover:bg-amber-700 disabled:opacity-40 transition-colors">
                  Add to Pool
                </button>
              </>
            )}

            {/* ── EventOS Accounts tab ─────────────────────────── */}
            {addPanel === 'eventoS' && (
              <>
                <p className="text-sm text-slate-500 mb-4">Search staff who have created an EventOS account and add them to your pool.</p>
                <div className="relative mb-4">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input type="text" placeholder="Search by name..." value={eventosQ} autoFocus
                    onChange={e => { setEventosQ(e.target.value); searchEventOS(e.target.value) }}
                    className="pl-9 pr-3 py-2.5 w-full border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition-colors" />
                </div>

                {eventosLoading && (
                  <div className="flex items-center gap-2 text-slate-400 text-sm py-4 justify-center">
                    <Loader2 size={15} className="animate-spin" /> Searching EventOS...
                  </div>
                )}

                {!eventosLoading && eventosResults.length > 0 && (
                  <div className="space-y-2">
                    {eventosResults.map(profile => {
                      const inPool = !!fullPool.find(p => p.id === profile.id)
                      return (
                        <div key={profile.id} className="flex items-center gap-3 p-3 border border-slate-100 rounded-xl hover:bg-slate-50 transition-colors">
                          <Avatar name={profile.name} size="sm" />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-semibold text-slate-900 truncate">{profile.name}</p>
                              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-600 shrink-0">EVENTOS</span>
                            </div>
                            <p className="text-xs text-slate-400">{profile.phone || profile.email}</p>
                          </div>
                          {profile.tier && (
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0 ${
                              profile.tier === 'Expert' ? 'bg-amber-100 text-amber-700' :
                              profile.tier === 'Senior' ? 'bg-blue-100 text-blue-700' :
                              'bg-slate-100 text-slate-600'
                            }`}>{profile.tier}</span>
                          )}
                          <button
                            onClick={() => addFromEventOS(profile)}
                            disabled={inPool}
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors shrink-0 disabled:opacity-50 disabled:cursor-not-allowed bg-blue-600 text-white hover:bg-blue-700 disabled:bg-slate-100 disabled:text-slate-500"
                          >
                            {inPool ? 'In Pool ✓' : 'Add to Pool'}
                          </button>
                        </div>
                      )
                    })}
                  </div>
                )}

                {!eventosLoading && eventosQ && eventosResults.length === 0 && (
                  <p className="text-sm text-slate-400 text-center py-6">No registered EventOS staff found for "{eventosQ}"</p>
                )}

                {!eventosQ && (
                  <p className="text-sm text-slate-400 text-center py-6">Start typing to search registered staff accounts</p>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-5 mb-6 md:mb-7">
        {[
          { label: 'Total in Pool', value: totalStaff, sub: 'Registered members',   dot: 'bg-slate-400' },
          { label: 'Available Now', value: available,  sub: 'Ready to be assigned', dot: 'bg-emerald-500' },
          { label: 'On-Duty',       value: onDuty,     sub: 'Currently at events',  dot: 'bg-blue-500' },
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
                  tab === t ? 'bg-amber-600 text-white' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
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
              className="pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-50 w-full sm:w-52 transition-colors"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto mt-3">
          <table className="w-full min-w-[680px]">
            <thead>
              <tr className="border-y border-slate-100 bg-slate-50">
                {['Staff Member', 'Tier', 'Status', 'Assigned Event / Role', 'Unavailable Dates', 'Actions'].map((col, i) => (
                  <th key={col} className={`px-4 md:px-5 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider ${i === 5 ? 'text-right' : 'text-left'}`}>
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(({ person, assignedEvents, status }) => {
                const isEditing = editingId === person.id
                const isCustom  = !staffPool.find(p => p.id === person.id)

                if (isEditing && editDraft) {
                  return (
                    <tr key={person.id} className="bg-amber-50/30">
                      <td className="px-4 md:px-5 py-3">
                        <div className="space-y-1.5">
                          <input
                            type="text"
                            value={editDraft.name}
                            onChange={e => setEditDraft(d => d ? { ...d, name: e.target.value } : d)}
                            autoFocus
                            className="w-full px-2.5 py-1.5 border border-amber-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-100"
                          />
                          <input
                            type="tel"
                            value={editDraft.phone}
                            onChange={e => setEditDraft(d => d ? { ...d, phone: e.target.value } : d)}
                            placeholder="Phone"
                            className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-amber-400 transition-colors"
                          />
                        </div>
                      </td>
                      <td className="px-4 md:px-5 py-3">
                        <select
                          value={editDraft.tier}
                          onChange={e => setEditDraft(d => d ? { ...d, tier: e.target.value as Tier } : d)}
                          className="px-2 py-1.5 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-amber-400 transition-colors"
                        >
                          <option value="Junior">Junior</option>
                          <option value="Senior">Senior</option>
                          <option value="Expert">Expert</option>
                        </select>
                      </td>
                      <td className="px-4 md:px-5 py-3" />
                      <td className="px-4 md:px-5 py-3" />
                      <td className="px-4 md:px-5 py-3">
                        <div className="flex gap-1.5 mb-1.5">
                          <input
                            type="date"
                            value={editDate}
                            onChange={e => setEditDate(e.target.value)}
                            className="px-2 py-1 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-amber-400 transition-colors"
                          />
                          <button
                            onClick={() => addUnavailableDate(editDate, editDraft.unavailableDates || [], d => setEditDraft(p => p ? { ...p, unavailableDates: d } : p), setEditDate)}
                            className="px-2 py-1 bg-slate-100 text-slate-700 rounded-lg text-[10px] font-semibold hover:bg-slate-200 transition-colors whitespace-nowrap"
                          >
                            Block
                          </button>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {(editDraft.unavailableDates || []).map(d => (
                            <span key={d} className="flex items-center gap-0.5 px-1.5 py-0.5 bg-red-50 text-red-700 rounded text-[10px] font-medium border border-red-100">
                              {d}<button onClick={() => setEditDraft(p => p ? { ...p, unavailableDates: (p.unavailableDates || []).filter(x => x !== d) } : p)}><X size={9} /></button>
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 md:px-5 py-3 text-right">
                        <div className="flex items-center gap-1.5 justify-end">
                          <button onClick={saveEdit} className="p-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors" title="Save"><Check size={13} /></button>
                          <button onClick={cancelEdit} className="p-1.5 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors" title="Cancel"><X size={13} /></button>
                        </div>
                      </td>
                    </tr>
                  )
                }

                return (
                  <tr key={person.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 md:px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <Avatar name={person.name} size="sm" />
                        <div>
                          <p className="text-sm font-semibold text-slate-900 whitespace-nowrap">
                            {person.name}
                            {isCustom && <span className="ml-1.5 text-[9px] font-bold text-slate-400 uppercase">custom</span>}
                          </p>
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
                            <button key={i} onClick={() => navigate(`/events/${ae.eventId}/staff`)} className="block text-xs text-amber-600 font-semibold hover:underline text-left whitespace-nowrap">
                              {ae.eventName} · {ae.roleName}
                            </button>
                          ))}
                          {assignedEvents.length > 2 && <p className="text-xs text-slate-400">+{assignedEvents.length - 2} more</p>}
                        </div>
                      )}
                    </td>
                    <td className="px-4 md:px-5 py-3.5">
                      {(person.unavailableDates || []).length === 0 ? (
                        <span className="text-xs text-slate-400">None</span>
                      ) : (
                        <div className="flex flex-wrap gap-1">
                          {(person.unavailableDates || []).slice(0, 2).map(d => (
                            <span key={d} className="px-1.5 py-0.5 bg-red-50 text-red-700 rounded text-[10px] font-medium border border-red-100">{d}</span>
                          ))}
                          {(person.unavailableDates || []).length > 2 && (
                            <span className="text-[10px] text-slate-400">+{(person.unavailableDates || []).length - 2}</span>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="px-4 md:px-5 py-3.5">
                      <div className="flex items-center gap-1.5 justify-end flex-wrap">
                        {deleteError === person.id && (
                          <span className="text-[10px] text-red-600 font-medium">Unassign first</span>
                        )}
                        {!isCustom && (
                          <>
                            <button onClick={() => startEdit(person)} className="p-1.5 border border-slate-200 rounded-lg text-slate-500 hover:text-amber-600 hover:border-amber-200 hover:bg-amber-50 transition-colors" title="Edit">
                              <Pencil size={12} />
                            </button>
                            <button onClick={() => handleDelete(person.id)} className="p-1.5 border border-slate-200 rounded-lg text-slate-500 hover:text-red-600 hover:border-red-200 hover:bg-red-50 transition-colors" title="Remove from pool">
                              <Trash2 size={12} />
                            </button>
                          </>
                        )}
                        {assignedEvents.length > 0 ? (
                          <button onClick={() => navigate(`/events/${assignedEvents[0].eventId}/staff`)} className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors">
                            View
                          </button>
                        ) : (
                          <button onClick={() => navigate('/events')} className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors">
                            Assign
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-slate-400 text-sm">
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
          <p className="text-sm text-slate-400">Showing {filtered.length} of {rows.length} staff members</p>
        </div>
      </div>
    </div>
  )
}
