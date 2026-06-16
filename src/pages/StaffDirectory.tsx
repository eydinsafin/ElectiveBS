import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { UserPlus, ChevronDown, Search, Star, ChevronLeft, ChevronRight } from 'lucide-react'
import Avatar from '../components/Avatar'

type StaffStatus = 'Available' | 'On-Duty' | 'Offline'
type StaffTier   = 'Expert' | 'Senior' | 'Junior'

const ALL_STAFF: {
  id: string; name: string; idNum: string; role: string; tier: StaffTier
  status: StaffStatus; rating: number; reviews: number; events: number
}[] = [
  { id: '1', name: 'Sarah Jenkins', idNum: '#ID-10021', role: 'Lead Promoter', tier: 'Expert',  status: 'Available', rating: 4.9, reviews: 24, events: 47 },
  { id: '2', name: 'Marcus Low',    idNum: '#ID-10022', role: 'Promoter',      tier: 'Senior',  status: 'On-Duty',  rating: 4.7, reviews: 18, events: 23 },
  { id: '3', name: 'Aria Gupta',    idNum: '#ID-10023', role: 'Promoter',      tier: 'Senior',  status: 'Available', rating: 4.5, reviews: 15, events: 18 },
  { id: '4', name: 'James Wilson',  idNum: '#ID-10024', role: 'Promoter',      tier: 'Senior',  status: 'Available', rating: 4.8, reviews: 21, events: 35 },
  { id: '5', name: 'Emma Chen',     idNum: '#ID-10025', role: 'Supervisor',    tier: 'Expert',  status: 'On-Duty',  rating: 4.9, reviews: 31, events: 52 },
]

const ROLE_OPTIONS = ['All Roles', 'Promoter', 'Lead Promoter', 'Supervisor', 'Event Crew']

const STATUS_BADGE: Record<StaffStatus, string> = {
  'Available': 'bg-emerald-100 text-emerald-700',
  'On-Duty':   'bg-blue-100 text-blue-700',
  'Offline':   'bg-slate-100 text-slate-500',
}
const TIER_BADGE: Record<StaffTier, string> = {
  'Expert': 'bg-amber-100 text-amber-700',
  'Senior': 'bg-blue-100 text-blue-700',
  'Junior': 'bg-slate-100 text-slate-600',
}

export default function StaffDirectory() {
  const navigate = useNavigate()
  const [tab, setTab] = useState<'All' | 'Available' | 'Assigned'>('All')
  const [role, setRole] = useState('All Roles')
  const [showRole, setShowRole] = useState(false)
  const [search, setSearch] = useState('')

  const filtered = ALL_STAFF.filter(s => {
    if (tab === 'Available' && s.status !== 'Available') return false
    if (tab === 'Assigned'  && s.status !== 'On-Duty') return false
    if (role !== 'All Roles' && s.role !== role) return false
    if (search && !s.name.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  return (
    <div className="p-4 md:p-8 max-w-[1400px]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6 md:mb-7">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900">Staff Directory</h1>
          <p className="text-slate-500 text-sm mt-1">Manage and monitor your agency's talent pool</p>
        </div>
        <button
          onClick={() => navigate('/staff/new')}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors shadow-md shadow-blue-600/20 self-start"
        >
          <UserPlus size={16} />
          Add Staff
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-5 mb-6 md:mb-7">
        {[
          { label: 'Total Staff',    value: '370', sub: 'Registered members',  dot: 'bg-slate-400' },
          { label: 'Available Now',  value: '242', sub: 'Ready to be assigned', dot: 'bg-emerald-500' },
          { label: 'On-Duty',        value: '128', sub: 'Currently at events',  dot: 'bg-blue-500' },
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

      {/* Filters + Table card */}
      <div className="bg-white rounded-xl border border-slate-200">
        {/* Tab + search row */}
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
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            {/* Search */}
            <div className="relative flex-1 sm:flex-none">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search staff..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 w-full sm:w-44 md:w-52 transition-colors"
              />
            </div>
            {/* Role filter */}
            <div className="relative shrink-0">
              <button
                onClick={() => setShowRole(v => !v)}
                className="flex items-center gap-1.5 px-3 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
              >
                <span className="hidden sm:inline">{role}</span>
                <span className="sm:hidden">Role</span>
                <ChevronDown size={13} className={`text-slate-400 transition-transform ${showRole ? 'rotate-180' : ''}`} />
              </button>
              {showRole && (
                <div className="absolute right-0 mt-1 w-44 bg-white border border-slate-200 rounded-xl shadow-lg z-10 overflow-hidden">
                  {ROLE_OPTIONS.map(r => (
                    <button
                      key={r}
                      onClick={() => { setRole(r); setShowRole(false) }}
                      className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${role === r ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-slate-700 hover:bg-slate-50'}`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto mt-3">
          <table className="w-full min-w-[560px]">
            <thead>
              <tr className="border-y border-slate-100 bg-slate-50">
                {['Staff Member', 'Role', 'Status', 'Rating', 'Events', 'Actions'].map((col, i) => (
                  <th key={col} className={`px-4 md:px-5 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider ${i === 5 ? 'text-right' : 'text-left'}`}>
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(s => (
                <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 md:px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <Avatar name={s.name} size="sm" />
                      <div>
                        <p className="text-sm font-semibold text-slate-900 whitespace-nowrap">{s.name}</p>
                        <p className="text-xs text-slate-400 font-mono">{s.idNum}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 md:px-5 py-3.5">
                    <p className="text-sm text-slate-700 whitespace-nowrap">{s.role}</p>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${TIER_BADGE[s.tier]}`}>{s.tier}</span>
                  </td>
                  <td className="px-4 md:px-5 py-3.5">
                    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap ${STATUS_BADGE[s.status]}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${s.status === 'Available' ? 'bg-emerald-500' : s.status === 'On-Duty' ? 'bg-blue-500' : 'bg-slate-400'}`} />
                      {s.status}
                    </span>
                  </td>
                  <td className="px-4 md:px-5 py-3.5">
                    <div className="flex items-center gap-1 whitespace-nowrap">
                      <Star size={13} className="text-amber-400 fill-amber-400" />
                      <span className="text-sm font-semibold text-slate-900">{s.rating}</span>
                      <span className="text-xs text-slate-400">({s.reviews})</span>
                    </div>
                  </td>
                  <td className="px-4 md:px-5 py-3.5">
                    <span className="text-sm font-semibold text-slate-900">{s.events}</span>
                  </td>
                  <td className="px-4 md:px-5 py-3.5 text-right">
                    <button
                      onClick={() => navigate(`/staff/${s.id}`)}
                      className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
                    >
                      Manage
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-slate-400 text-sm">
                    No staff members match your filters
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-4 md:px-5 py-3.5 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <p className="text-sm text-slate-400">Showing 1–{filtered.length} of 370 staff members</p>
          <div className="flex items-center gap-1">
            <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 hover:bg-slate-50">
              <ChevronLeft size={15} className="text-slate-400" />
            </button>
            {[1, 2, 3].map(p => (
              <button key={p} className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium ${p === 1 ? 'bg-blue-600 text-white' : 'border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                {p}
              </button>
            ))}
            <span className="text-slate-400 text-sm px-1">…</span>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50">74</button>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 hover:bg-slate-50">
              <ChevronRight size={15} className="text-slate-400" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
