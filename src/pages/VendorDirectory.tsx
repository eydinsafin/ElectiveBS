import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Building2, Search, Plus, X, Globe, Loader2, UserPlus } from 'lucide-react'
import { useEvents, AssignedVendor } from '../context/EventsContext'
import { supabase, type Profile } from '../lib/supabase'

const TIER_BADGE: Record<AssignedVendor['tier'], string> = {
  Premium:  'bg-purple-100 text-purple-700',
  Standard: 'bg-sky-100 text-sky-700',
  Budget:   'bg-teal-100 text-teal-700',
}

type Contract = { eventId: string; eventName: string; serviceName: string; quote: number }
type VendorRow = { vendor: AssignedVendor; contracts: Contract[]; status: 'Contracted' | 'Available'; totalQuote: number }
type TabFilter = 'All' | 'Available' | 'Contracted'
type AddPanelTab = 'manual' | 'eventoS'

const inp = 'px-3 py-2 w-full border border-slate-200 bg-white rounded-lg text-sm focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-50'

export default function VendorDirectory() {
  const navigate = useNavigate()
  const { events, vendorPool, addVendorToPool } = useEvents()
  const [search, setSearch] = useState('')
  const [tab, setTab]       = useState<TabFilter>('All')

  // Add Vendor panel
  const [showAdd, setShowAdd]       = useState(false)
  const [addTab, setAddTab]         = useState<AddPanelTab>('manual')

  // Manual form
  const [mnCompany, setMnCompany] = useState('')
  const [mnContact, setMnContact] = useState('')
  const [mnPhone,   setMnPhone]   = useState('')
  const [mnService, setMnService] = useState('')
  const [mnTier,    setMnTier]    = useState<AssignedVendor['tier']>('Standard')

  // EventOS search
  const [eventosQ,       setEventosQ]       = useState('')
  const [eventosResults, setEventosResults] = useState<Profile[]>([])
  const [eventosLoading, setEventosLoading] = useState(false)

  const poolIds = new Set(vendorPool.map(v => v.id))

  const rows = useMemo<VendorRow[]>(() => {
    const contractMap = new Map<string, Contract[]>()
    for (const ev of events) {
      if (!ev.vendorServices || !ev.vendorAssignments) continue
      for (const svc of ev.vendorServices) {
        const assigned = ev.vendorAssignments[svc.id.toString()] || []
        for (const vendor of assigned) {
          if (!contractMap.has(vendor.id)) contractMap.set(vendor.id, [])
          contractMap.get(vendor.id)!.push({ eventId: ev.id, eventName: ev.name, serviceName: svc.service, quote: vendor.quote })
        }
      }
    }

    // Collect custom vendors from event assignments not already in pool
    const seenIds   = new Set(vendorPool.map(v => v.id))
    const customVendors: AssignedVendor[] = []
    for (const ev of events) {
      if (!ev.vendorAssignments) continue
      for (const list of Object.values(ev.vendorAssignments)) {
        for (const vendor of list) {
          if (!seenIds.has(vendor.id)) {
            customVendors.push({ ...vendor, quote: 0 })
            seenIds.add(vendor.id)
          }
        }
      }
    }

    return [...vendorPool, ...customVendors].map(vendor => {
      const contracts  = contractMap.get(vendor.id) || []
      const totalQuote = contracts.reduce((a, c) => a + c.quote, 0)
      return { vendor, contracts, status: contracts.length > 0 ? 'Contracted' : 'Available', totalQuote }
    })
  }, [events, vendorPool])

  const contracted = rows.filter(r => r.status === 'Contracted').length
  const available  = rows.filter(r => r.status === 'Available').length
  const totalSpend = rows.reduce((a, r) => a + r.totalQuote, 0)

  const filtered = rows.filter(row => {
    const matchTab    = tab === 'All' || row.status === tab
    const matchSearch = !search ||
      row.vendor.company.toLowerCase().includes(search.toLowerCase()) ||
      row.vendor.service.toLowerCase().includes(search.toLowerCase()) ||
      row.vendor.contact.toLowerCase().includes(search.toLowerCase())
    return matchTab && matchSearch
  })

  const searchEventOS = async (q: string) => {
    if (!q.trim()) { setEventosResults([]); return }
    setEventosLoading(true)
    const { data } = await supabase.from('profiles').select('*').eq('role', 'Vendor').ilike('name', `%${q}%`).limit(10)
    setEventosResults((data as Profile[]) || [])
    setEventosLoading(false)
  }

  const addFromEventOS = (profile: Profile) => {
    if (poolIds.has(profile.id)) return
    addVendorToPool({
      id:      profile.id,
      company: profile.company ?? profile.name,
      contact: profile.name,
      phone:   profile.phone ?? '',
      service: profile.service ?? '',
      tier:    'Standard',
      quote:   0,
    })
  }

  const handleManualAdd = () => {
    if (!mnCompany.trim()) return
    addVendorToPool({
      id:      `custom-vendor-${Date.now()}`,
      company: mnCompany.trim(),
      contact: mnContact.trim(),
      phone:   mnPhone.trim(),
      service: mnService.trim(),
      tier:    mnTier,
      quote:   0,
    })
    setMnCompany(''); setMnContact(''); setMnPhone(''); setMnService('')
    setShowAdd(false)
  }

  const tabCls = (active: boolean) =>
    `flex-1 py-1.5 px-2 rounded-md text-xs font-semibold transition-colors ${active ? 'bg-white text-amber-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`

  return (
    <div className="p-4 md:p-8 max-w-[1400px]">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 mb-6 md:mb-7">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900">Vendors</h1>
          <p className="text-slate-500 text-sm mt-1">Manage supplier relationships and vendor contracts across events</p>
        </div>
        <button
          onClick={() => { setShowAdd(v => !v); setAddTab('manual') }}
          className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-xl text-sm font-bold hover:bg-amber-700 active:scale-95 transition-all shadow-sm shadow-amber-600/25"
        >
          <Plus size={15} />Add Vendor
        </button>
      </div>

      {/* Add Vendor panel */}
      {showAdd && (
        <div className="bg-white rounded-xl border border-amber-200 p-5 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <UserPlus size={16} className="text-amber-600" />
              <h3 className="font-bold text-slate-900 text-sm">Add Vendor to Directory</h3>
            </div>
            <button onClick={() => setShowAdd(false)} className="p-1 text-slate-400 hover:text-slate-700"><X size={15} /></button>
          </div>

          <div className="flex gap-1 p-1 bg-slate-100 rounded-lg mb-4">
            <button onClick={() => setAddTab('manual')}  className={tabCls(addTab === 'manual')}>Add Manually</button>
            <button onClick={() => setAddTab('eventoS')} className={tabCls(addTab === 'eventoS')}>
              <span className="flex items-center justify-center gap-1"><Globe size={10} />EventOS Accounts</span>
            </button>
          </div>

          {/* Manual form */}
          {addTab === 'manual' && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Company Name *</label>
                  <input type="text" placeholder="e.g. Pro AV Solutions" value={mnCompany} onChange={e => setMnCompany(e.target.value)} className={inp} />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Contact Person</label>
                  <input type="text" placeholder="e.g. Kevin Tan" value={mnContact} onChange={e => setMnContact(e.target.value)} className={inp} />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Phone</label>
                  <input type="tel" placeholder="e.g. 8111 2233" value={mnPhone} onChange={e => setMnPhone(e.target.value)} className={inp} />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Service Type</label>
                  <input type="text" placeholder="e.g. AV & Sound" value={mnService} onChange={e => setMnService(e.target.value)} className={inp} />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Tier</label>
                <div className="flex gap-2">
                  {(['Premium', 'Standard', 'Budget'] as AssignedVendor['tier'][]).map(t => (
                    <button key={t} onClick={() => setMnTier(t)}
                      className={`flex-1 py-2 rounded-lg border-2 text-xs font-bold transition-all ${mnTier === t ? 'border-amber-500 bg-amber-50 text-amber-700' : 'border-slate-200 text-slate-600 hover:border-slate-300'}`}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              <button onClick={handleManualAdd} disabled={!mnCompany.trim()}
                className="w-full py-2.5 bg-amber-600 text-white rounded-xl text-sm font-bold hover:bg-amber-700 disabled:opacity-40 transition-colors">
                Add to Directory
              </button>
            </div>
          )}

          {/* EventOS search */}
          {addTab === 'eventoS' && (
            <div>
              <div className="relative mb-3">
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type="text" placeholder="Search EventOS vendor accounts by name…" value={eventosQ}
                  onChange={e => { setEventosQ(e.target.value); searchEventOS(e.target.value) }}
                  className="pl-8 pr-3 py-2 w-full border border-slate-200 bg-white rounded-lg text-sm placeholder:text-slate-400 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-50" />
              </div>
              {eventosLoading && <div className="flex justify-center py-4"><Loader2 size={18} className="animate-spin text-amber-500" /></div>}
              {!eventosLoading && eventosQ && eventosResults.length === 0 && (
                <p className="text-center text-slate-400 text-xs py-4">No EventOS vendor accounts found</p>
              )}
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {eventosResults.map(profile => {
                  const inPool = poolIds.has(profile.id)
                  return (
                    <div key={profile.id} className={`flex items-center justify-between p-3 rounded-lg border ${inPool ? 'bg-emerald-50 border-emerald-200' : 'bg-white border-slate-200'}`}>
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                          <span className="text-[10px] font-bold text-emerald-700">{(profile.company ?? profile.name).slice(0, 2).toUpperCase()}</span>
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <p className="text-sm font-semibold text-slate-900">{profile.company ?? profile.name}</p>
                            <span className="text-[9px] font-bold px-1.5 py-0.5 bg-emerald-100 text-emerald-700 rounded">EVENTOS</span>
                          </div>
                          <p className="text-xs text-slate-500">{profile.name} · {profile.service}</p>
                        </div>
                      </div>
                      {inPool ? (
                        <span className="text-xs font-semibold text-emerald-600">In Directory ✓</span>
                      ) : (
                        <button onClick={() => addFromEventOS(profile)}
                          className="px-3 py-1.5 bg-amber-600 text-white rounded-lg text-xs font-bold hover:bg-amber-700 transition-colors">
                          Add
                        </button>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-5 mb-6 md:mb-7">
        {[
          { label: 'Total Vendors', value: rows.length.toString(),            sub: 'In directory',      color: 'text-slate-900'   },
          { label: 'Contracted',    value: contracted.toString(),             sub: 'Active agreements', color: 'text-amber-600'   },
          { label: 'Available',     value: available.toString(),              sub: 'Ready to engage',   color: 'text-emerald-600' },
          { label: 'Total Spend',   value: `$${totalSpend.toLocaleString()}`, sub: 'Across all events', color: 'text-amber-600'   },
        ].map(({ label, value, sub, color }) => (
          <div key={label} className="bg-white rounded-xl border border-slate-200 p-4 md:p-5">
            <p className="text-[10px] md:text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 md:mb-3">{label}</p>
            <p className={`text-2xl md:text-3xl font-bold ${color}`}>{value}</p>
            <p className="text-slate-400 text-xs mt-1 hidden md:block">{sub}</p>
          </div>
        ))}
      </div>

      {/* Search + filter tabs */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input type="text" placeholder="Search by company, service or contact..." value={search} onChange={e => setSearch(e.target.value)}
            className="pl-9 pr-3 py-2 w-full border border-slate-200 bg-white rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-50 transition-colors" />
        </div>
        <div className="flex gap-1.5">
          {(['All', 'Available', 'Contracted'] as TabFilter[]).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors border ${tab === t ? 'bg-amber-100 text-amber-700 border-amber-200' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}>
              {t} <span className="ml-1 opacity-70">{t === 'All' ? rows.length : t === 'Contracted' ? contracted : available}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/60">
                <th className="text-left px-4 md:px-5 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wide">Company</th>
                <th className="text-left px-4 md:px-5 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wide hidden sm:table-cell">Service Type</th>
                <th className="text-left px-4 md:px-5 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wide hidden sm:table-cell">Tier</th>
                <th className="text-left px-4 md:px-5 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wide">Status</th>
                <th className="text-left px-4 md:px-5 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wide hidden md:table-cell">Contracted Events</th>
                <th className="text-right px-4 md:px-5 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wide">Total Quote</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan={6} className="text-center py-12 text-slate-400 text-sm">No vendors match your search.</td></tr>
              )}
              {filtered.map(({ vendor, contracts, status, totalQuote }) => (
                <tr key={vendor.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/40 transition-colors">
                  <td className="px-4 md:px-5 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center shrink-0"><Building2 size={14} className="text-amber-600" /></div>
                      <div>
                        <p className="font-semibold text-slate-900">{vendor.company}</p>
                        <p className="text-xs text-slate-500">{vendor.contact} · {vendor.phone}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 md:px-5 py-3.5 text-slate-600 hidden sm:table-cell">{vendor.service}</td>
                  <td className="px-4 md:px-5 py-3.5 hidden sm:table-cell">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${TIER_BADGE[vendor.tier]}`}>{vendor.tier}</span>
                  </td>
                  <td className="px-4 md:px-5 py-3.5">
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${status === 'Contracted' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>{status}</span>
                  </td>
                  <td className="px-4 md:px-5 py-3.5 hidden md:table-cell">
                    {contracts.length === 0 ? <span className="text-slate-400 text-xs">—</span> : (
                      <div className="space-y-1">
                        {contracts.map((c, i) => (
                          <div key={i} className="flex items-center gap-1.5 text-xs">
                            <button onClick={() => navigate(`/events/${c.eventId}/vendors`)} className="text-amber-600 hover:text-amber-700 hover:underline font-medium">{c.eventName}</button>
                            <span className="text-slate-300">·</span>
                            <span className="text-slate-500">{c.serviceName}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </td>
                  <td className="px-4 md:px-5 py-3.5 text-right">
                    <span className={`font-bold ${totalQuote > 0 ? 'text-slate-900' : 'text-slate-300'}`}>{totalQuote > 0 ? `$${totalQuote.toLocaleString()}` : '—'}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
