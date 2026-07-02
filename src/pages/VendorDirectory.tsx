import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Building2, Search } from 'lucide-react'
import { useEvents, VENDOR_POOL, AssignedVendor } from '../context/EventsContext'

const TIER_BADGE: Record<AssignedVendor['tier'], string> = {
  Premium:  'bg-purple-100 text-purple-700',
  Standard: 'bg-sky-100 text-sky-700',
  Budget:   'bg-teal-100 text-teal-700',
}

type Contract = {
  eventId: string
  eventName: string
  serviceName: string
  quote: number
}

type VendorRow = {
  vendor: AssignedVendor
  contracts: Contract[]
  status: 'Contracted' | 'Available'
  totalQuote: number
}

type TabFilter = 'All' | 'Available' | 'Contracted'

export default function VendorDirectory() {
  const navigate = useNavigate()
  const { events } = useEvents()
  const [search, setSearch] = useState('')
  const [tab, setTab]       = useState<TabFilter>('All')

  const rows = useMemo<VendorRow[]>(() => {
    const contractMap = new Map<string, Contract[]>()

    for (const ev of events) {
      if (!ev.vendorServices || !ev.vendorAssignments) continue
      for (const svc of ev.vendorServices) {
        const key = svc.id.toString()
        const assigned = ev.vendorAssignments[key] || []
        for (const vendor of assigned) {
          if (!contractMap.has(vendor.id)) contractMap.set(vendor.id, [])
          contractMap.get(vendor.id)!.push({
            eventId:     ev.id,
            eventName:   ev.name,
            serviceName: svc.service,
            quote:       vendor.quote,
          })
        }
      }
    }

    // Collect custom vendors (not in VENDOR_POOL) from event assignments
    const poolIds = new Set(VENDOR_POOL.map(vn => vn.id))
    const customVendors: AssignedVendor[] = []
    const seenIds = new Set<string>()

    for (const ev of events) {
      if (!ev.vendorAssignments) continue
      for (const list of Object.values(ev.vendorAssignments)) {
        for (const vendor of list) {
          if (!poolIds.has(vendor.id) && !seenIds.has(vendor.id)) {
            customVendors.push({ ...vendor, quote: 0 })
            seenIds.add(vendor.id)
          }
        }
      }
    }

    return [...VENDOR_POOL, ...customVendors].map(vendor => {
      const contracts  = contractMap.get(vendor.id) || []
      const totalQuote = contracts.reduce((a, c) => a + c.quote, 0)
      return {
        vendor,
        contracts,
        status: contracts.length > 0 ? 'Contracted' : 'Available',
        totalQuote,
      }
    })
  }, [events])

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

  return (
    <div className="p-4 md:p-8 max-w-[1400px]">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 mb-6 md:mb-7">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900">Vendors</h1>
          <p className="text-slate-500 text-sm mt-1">Manage supplier relationships and vendor contracts across events</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-5 mb-6 md:mb-7">
        {[
          { label: 'Total Vendors', value: rows.length.toString(),              sub: 'In directory',          color: 'text-slate-900' },
          { label: 'Contracted',    value: contracted.toString(),               sub: 'Active agreements',     color: 'text-amber-600' },
          { label: 'Available',     value: available.toString(),                sub: 'Ready to engage',       color: 'text-emerald-600' },
          { label: 'Total Spend',   value: `$${totalSpend.toLocaleString()}`,   sub: 'Across all events',     color: 'text-amber-600' },
        ].map(({ label, value, sub, color }) => (
          <div key={label} className="card-hover bg-white rounded-xl border border-slate-200 p-4 md:p-5">
            <p className="text-[10px] md:text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 md:mb-3">{label}</p>
            <p className={`text-2xl md:text-3xl font-bold ${color}`}>{value}</p>
            <p className="text-slate-400 text-xs mt-1 hidden md:block">{sub}</p>
          </div>
        ))}
      </div>

      {/* Search + tabs */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by company, service or contact..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 pr-3 py-2 w-full border border-slate-200 bg-white rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-50 transition-colors"
          />
        </div>
        <div className="flex gap-1.5">
          {(['All', 'Available', 'Contracted'] as TabFilter[]).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors border ${
                tab === t
                  ? 'bg-amber-100 text-amber-700 border-amber-200'
                  : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
              }`}
            >
              {t}
              <span className="ml-1 opacity-70">
                {t === 'All' ? rows.length : t === 'Contracted' ? contracted : available}
              </span>
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
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400 text-sm">
                    No vendors match your search.
                  </td>
                </tr>
              )}
              {filtered.map(({ vendor, contracts, status, totalQuote }) => (
                <tr key={vendor.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/40 transition-colors">
                  <td className="px-4 md:px-5 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center shrink-0">
                        <Building2 size={14} className="text-amber-600" />
                      </div>
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
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${
                      status === 'Contracted'
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-emerald-100 text-emerald-700'
                    }`}>
                      {status}
                    </span>
                  </td>
                  <td className="px-4 md:px-5 py-3.5 hidden md:table-cell">
                    {contracts.length === 0 ? (
                      <span className="text-slate-400 text-xs">—</span>
                    ) : (
                      <div className="space-y-1">
                        {contracts.map((c, i) => (
                          <div key={i} className="flex items-center gap-1.5 text-xs">
                            <button
                              onClick={() => navigate(`/events/${c.eventId}/vendors`)}
                              className="text-amber-600 hover:text-amber-700 hover:underline font-medium"
                            >
                              {c.eventName}
                            </button>
                            <span className="text-slate-300">·</span>
                            <span className="text-slate-500">{c.serviceName}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </td>
                  <td className="px-4 md:px-5 py-3.5 text-right">
                    <span className={`font-bold ${totalQuote > 0 ? 'text-slate-900' : 'text-slate-300'}`}>
                      {totalQuote > 0 ? `$${totalQuote.toLocaleString()}` : '—'}
                    </span>
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
