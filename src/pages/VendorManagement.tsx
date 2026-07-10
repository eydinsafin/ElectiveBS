import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft, Package, Plus, X, ChevronDown,
  Building2, Search, AlertCircle, CheckCircle2, Globe, Loader2,
} from 'lucide-react'
import {
  useEvents, fmtDate,
  type VendorService, type AssignedVendor,
} from '../context/EventsContext'
import { supabase, type Profile } from '../lib/supabase'

const TIER_BADGE: Record<AssignedVendor['tier'], string> = {
  Premium:  'bg-purple-100 text-purple-700',
  Standard: 'bg-sky-100 text-sky-700',
  Budget:   'bg-teal-100 text-teal-700',
}

type AddTab = 'pool' | 'eventoS' | 'new'

export default function VendorManagement() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { events, vendorPool, assignVendor, removeVendor, updateEventVendorServices } = useEvents()

  const event = events.find(e => e.id === id)

  // Panel state per-service
  const [addingServiceId, setAddingServiceId] = useState<number | null>(null)
  const [addTab, setAddTab]                   = useState<AddTab>('pool')
  const [selectedVendor, setSelectedVendor]   = useState<AssignedVendor | null>(null)
  const [quoteInput, setQuoteInput]           = useState('')
  const [search, setSearch]                   = useState('')

  // EventOS search
  const [eventosQ, setEventosQ]           = useState('')
  const [eventosResults, setEventosResults] = useState<Profile[]>([])
  const [eventosLoading, setEventosLoading] = useState(false)
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null)
  const [profileQuote, setProfileQuote]       = useState('')

  // New custom vendor form
  const [newCompany, setNewCompany] = useState('')
  const [newContact, setNewContact] = useState('')
  const [newPhone, setNewPhone]     = useState('')
  const [newSvcType, setNewSvcType] = useState('')
  const [newTier, setNewTier]       = useState<AssignedVendor['tier']>('Standard')
  const [newQuote, setNewQuote]     = useState('')

  // Add service requirement form
  const [addingService, setAddingService]       = useState(false)
  const [newServiceName, setNewServiceName]     = useState('')
  const [newServiceDesc, setNewServiceDesc]     = useState('')
  const [newServiceBudget, setNewServiceBudget] = useState('')
  const [newServiceType, setNewServiceType]     = useState<'service' | 'participant'>('service')

  if (!event) {
    return (
      <div className="p-8 text-center text-slate-500">
        Event not found.{' '}
        <button onClick={() => navigate('/events')} className="text-amber-600 underline">Back to Events</button>
      </div>
    )
  }

  const services    = event.vendorServices    || []
  const assignments = event.vendorAssignments || {}

  const openAdd = (serviceId: number) => {
    if (addingServiceId === serviceId) {
      setAddingServiceId(null)
    } else {
      setAddingServiceId(serviceId)
      setAddTab('pool')
      setSelectedVendor(null)
      setQuoteInput('')
      setSearch('')
      setEventosQ('')
      setEventosResults([])
      setSelectedProfile(null)
      setProfileQuote('')
    }
  }

  const handleConfirmAdd = (serviceId: number) => {
    if (!selectedVendor || !quoteInput) return
    assignVendor(event.id, serviceId, { ...selectedVendor, quote: Number(quoteInput) })
    setSelectedVendor(null); setQuoteInput(''); setSearch(''); setAddingServiceId(null)
  }

  const searchEventOS = async (q: string) => {
    if (!q.trim()) { setEventosResults([]); return }
    setEventosLoading(true)
    const { data } = await supabase.from('profiles').select('*').eq('role', 'Vendor').ilike('name', `%${q}%`).limit(10)
    setEventosResults((data as Profile[]) || [])
    setEventosLoading(false)
  }

  const handleAddFromEventOS = (serviceId: number) => {
    if (!selectedProfile || !profileQuote) return
    const already = assignments[serviceId.toString()] || []
    if (already.some(v => v.id === selectedProfile.id)) return
    const vendor: AssignedVendor = {
      id:      selectedProfile.id,
      company: selectedProfile.company ?? selectedProfile.name,
      contact: selectedProfile.name,
      phone:   selectedProfile.phone ?? '',
      service: selectedProfile.service ?? '',
      tier:    'Standard',
      quote:   Number(profileQuote) || 0,
    }
    assignVendor(event.id, serviceId, vendor)
    setSelectedProfile(null); setProfileQuote(''); setEventosQ(''); setEventosResults([]); setAddingServiceId(null)
  }

  const handleAddNew = (serviceId: number) => {
    if (!newCompany.trim()) return
    const vendor: AssignedVendor = {
      id:      `custom-vendor-${Date.now()}`,
      company: newCompany.trim(),
      contact: newContact.trim(),
      phone:   newPhone.trim(),
      service: newSvcType.trim(),
      tier:    newTier,
      quote:   Number(newQuote) || 0,
    }
    assignVendor(event.id, serviceId, vendor)
    setNewCompany(''); setNewContact(''); setNewPhone(''); setNewSvcType(''); setNewQuote(''); setAddingServiceId(null)
  }

  const handleAddService = () => {
    if (!newServiceName.trim()) return
    const svc: VendorService = {
      id: Date.now(), service: newServiceName.trim(), description: newServiceDesc.trim(),
      budget: Number(newServiceBudget) || 0, count: 1, type: newServiceType,
    }
    updateEventVendorServices(event.id, [...services, svc])
    setNewServiceName(''); setNewServiceDesc(''); setNewServiceBudget(''); setNewServiceType('service'); setAddingService(false)
  }

  const handleDeleteService = (serviceId: number) =>
    updateEventVendorServices(event.id, services.filter(s => s.id !== serviceId))

  const coveredCount      = services.filter(s => (assignments[s.id.toString()] || []).length >= s.count).length
  const totalVendorCost   = services.filter(s => (s.type || 'service') === 'service').reduce((a, s) => a + (assignments[s.id.toString()] || []).reduce((b, vn) => b + vn.quote, 0), 0)
  const totalBoothRevenue = services.filter(s => s.type === 'participant').reduce((a, s) => a + (assignments[s.id.toString()] || []).reduce((b, vn) => b + vn.quote, 0), 0)

  const tabCls = (active: boolean) =>
    `flex-1 py-1.5 px-2 rounded-md text-xs font-semibold transition-colors ${active ? 'bg-white text-amber-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`

  return (
    <div className="p-4 md:p-8 max-w-4xl">
      <button onClick={() => navigate(`/events/${event.id}`)} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 mb-5 transition-colors">
        <ArrowLeft size={15} /> Back to Event Details
      </button>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1"><Package size={18} className="text-amber-600" /><h1 className="text-xl font-bold text-slate-900">{event.name}</h1></div>
          <p className="text-slate-500 text-sm">{fmtDate(event.date)} · {event.location}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Services Required', value: services.length.toString(),               color: 'text-slate-900'   },
          { label: 'Fully Covered',     value: `${coveredCount}/${services.length}`,     color: 'text-emerald-600' },
          { label: 'Vendor Cost',       value: `$${totalVendorCost.toLocaleString()}`,   color: 'text-amber-600'   },
          { label: 'Booth Revenue',     value: `$${totalBoothRevenue.toLocaleString()}`, color: 'text-emerald-600' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-white rounded-xl border border-slate-200 p-4">
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">{label}</p>
            <p className={`text-xl font-bold ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Service cards */}
      <div className="space-y-4">
        {services.length === 0 && (
          <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-400 text-sm">
            No vendor services defined yet. Add a service requirement below.
          </div>
        )}

        {services.map(svc => {
          const assigned      = assignments[svc.id.toString()] || []
          const isFilled      = assigned.length >= svc.count
          const quotedAmt     = assigned.reduce((a, vn) => a + vn.quote, 0)
          const overBudget    = quotedAmt > svc.budget && quotedAmt > 0
          const isAdding      = addingServiceId === svc.id
          const isParticipant = svc.type === 'participant'

          const poolFiltered = vendorPool.filter(vp =>
            !assigned.find(a => a.id === vp.id) &&
            (!search || vp.company.toLowerCase().includes(search.toLowerCase()) || vp.service.toLowerCase().includes(search.toLowerCase()))
          )

          return (
            <div key={svc.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div className="p-4 md:p-5">
                {/* Header */}
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h3 className="font-bold text-slate-900 text-base">{svc.service}</h3>
                      {isParticipant ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">Booth Rental · {assigned.length}/{svc.count} slots</span>
                      ) : (
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isFilled ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                          {assigned.length}/{svc.count} vendor{svc.count !== 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                    <p className="text-slate-500 text-xs">{svc.description}</p>
                  </div>
                  <button onClick={() => handleDeleteService(svc.id)} className="p-1 text-slate-300 hover:text-red-500 transition-colors shrink-0"><X size={15} /></button>
                </div>

                {/* Budget / revenue */}
                {isParticipant ? (
                  <div className="flex items-center gap-4 text-xs mb-3">
                    <span className="text-slate-500">Booth Fee: <span className="font-semibold text-slate-900">${svc.budget.toLocaleString()} per slot</span></span>
                    {quotedAmt > 0 && <span className="flex items-center gap-1 font-semibold text-emerald-600"><CheckCircle2 size={12} />Revenue: ${quotedAmt.toLocaleString()}</span>}
                  </div>
                ) : (
                  <div className="flex items-center gap-4 text-xs mb-3">
                    <span className="text-slate-500">Budget: <span className="font-semibold text-slate-900">${svc.budget.toLocaleString()}</span></span>
                    {quotedAmt > 0 && (
                      <span className={`flex items-center gap-1 font-semibold ${overBudget ? 'text-red-600' : 'text-emerald-600'}`}>
                        {overBudget ? <AlertCircle size={12} /> : <CheckCircle2 size={12} />}
                        Quoted ${quotedAmt.toLocaleString()} · {overBudget ? `$${(quotedAmt - svc.budget).toLocaleString()} over` : `$${(svc.budget - quotedAmt).toLocaleString()} under`} budget
                      </span>
                    )}
                  </div>
                )}

                {/* Assigned vendors */}
                {assigned.length > 0 && (
                  <div className="space-y-2 mb-3">
                    {assigned.map(vendor => (
                      <div key={vendor.id} className="flex items-center justify-between gap-2 p-2.5 bg-slate-50 rounded-lg">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center shrink-0"><Building2 size={14} className="text-amber-600" /></div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-slate-900 truncate">{vendor.company}</p>
                            <p className="text-xs text-slate-500">{vendor.contact} · {vendor.phone}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${TIER_BADGE[vendor.tier]}`}>{vendor.tier}</span>
                          <span className="text-sm font-bold text-slate-900">${vendor.quote.toLocaleString()}</span>
                          <button onClick={() => removeVendor(event.id, svc.id, vendor.id)} className="p-1 text-slate-300 hover:text-red-500 transition-colors"><X size={14} /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <button onClick={() => openAdd(svc.id)} className="flex items-center gap-1.5 text-sm font-semibold text-amber-600 hover:text-amber-700 transition-colors">
                  <Plus size={15} className={`transition-transform ${isAdding ? 'rotate-45' : ''}`} />
                  {isAdding ? 'Close' : 'Add Vendor'}
                  <ChevronDown size={13} className={`text-amber-400 transition-transform ${isAdding ? 'rotate-180' : ''}`} />
                </button>
              </div>

              {/* ── Add Vendor panel ─────────────────────────────────────── */}
              {isAdding && (
                <div className="border-t border-slate-100 bg-slate-50 p-4 md:p-5">
                  {/* Tab switcher */}
                  <div className="flex gap-1 p-1 bg-slate-100 rounded-lg mb-4">
                    <button onClick={() => setAddTab('pool')}    className={tabCls(addTab === 'pool')}>Vendor Pool</button>
                    <button onClick={() => setAddTab('eventoS')} className={tabCls(addTab === 'eventoS')}>
                      <span className="flex items-center justify-center gap-1"><Globe size={10} />EventOS Accounts</span>
                    </button>
                    <button onClick={() => setAddTab('new')}     className={tabCls(addTab === 'new')}>Add Manually</button>
                  </div>

                  {/* ── Pool tab ──────────────────────────────────────────── */}
                  {addTab === 'pool' && (
                    <>
                      <div className="relative mb-3">
                        <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input type="text" placeholder="Search vendor pool..." value={search} onChange={e => setSearch(e.target.value)}
                          className="pl-8 pr-3 py-2 w-full border border-slate-200 bg-white rounded-lg text-sm placeholder:text-slate-400 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-50 transition-colors" />
                      </div>
                      <div className="space-y-1.5 mb-3 max-h-48 overflow-y-auto">
                        {poolFiltered.length === 0 && <p className="text-slate-400 text-xs py-2 text-center">No matching vendors in pool</p>}
                        {poolFiltered.map(vendor => (
                          <button key={vendor.id} onClick={() => { setSelectedVendor(vendor); setQuoteInput('') }}
                            className={`w-full flex items-center justify-between p-2.5 rounded-lg text-left transition-colors ${selectedVendor?.id === vendor.id ? 'bg-amber-50 border border-amber-200' : 'bg-white border border-slate-200 hover:border-amber-200 hover:bg-amber-50/40'}`}>
                            <div className="flex items-center gap-2.5">
                              <Building2 size={14} className="text-slate-400" />
                              <div><p className="text-sm font-semibold text-slate-900">{vendor.company}</p><p className="text-xs text-slate-500">{vendor.service} · {vendor.contact}</p></div>
                            </div>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${TIER_BADGE[vendor.tier]}`}>{vendor.tier}</span>
                          </button>
                        ))}
                      </div>
                      {selectedVendor && (
                        <div className="bg-white border border-amber-200 rounded-lg p-3 mb-1">
                          <p className="text-xs font-semibold text-slate-700 mb-2">Adding <span className="text-amber-700">{selectedVendor.company}</span></p>
                          <div className="flex gap-2">
                            <div className="relative flex-1">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">$</span>
                              <input type="number" placeholder={isParticipant ? 'Booth fee they pay' : 'Quote amount'} value={quoteInput} onChange={e => setQuoteInput(e.target.value)}
                                className="pl-6 pr-3 py-2 w-full border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-50" />
                            </div>
                            <button onClick={() => handleConfirmAdd(svc.id)} disabled={!quoteInput} className="px-4 py-2 bg-amber-600 text-white rounded-lg text-sm font-semibold hover:bg-amber-700 disabled:opacity-40 transition-colors">Confirm</button>
                            <button onClick={() => setSelectedVendor(null)} className="px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50">Cancel</button>
                          </div>
                        </div>
                      )}
                    </>
                  )}

                  {/* ── EventOS tab ──────────────────────────────────────── */}
                  {addTab === 'eventoS' && (
                    <>
                      <div className="relative mb-3">
                        <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input type="text" placeholder="Search by company or contact name…" value={eventosQ}
                          onChange={e => { setEventosQ(e.target.value); searchEventOS(e.target.value) }}
                          className="pl-8 pr-3 py-2 w-full border border-slate-200 bg-white rounded-lg text-sm placeholder:text-slate-400 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-50" />
                      </div>
                      {eventosLoading && <div className="flex justify-center py-4"><Loader2 size={18} className="animate-spin text-amber-500" /></div>}
                      {!eventosLoading && eventosQ && eventosResults.length === 0 && (
                        <p className="text-center text-slate-400 text-xs py-3">No EventOS vendor accounts found</p>
                      )}
                      <div className="space-y-1.5 mb-3 max-h-48 overflow-y-auto">
                        {eventosResults.map(profile => {
                          const alreadyIn = (assignments[svc.id.toString()] || []).some(v => v.id === profile.id)
                          return (
                            <button key={profile.id} onClick={() => { if (!alreadyIn) { setSelectedProfile(profile); setProfileQuote('') } }}
                              disabled={alreadyIn}
                              className={`w-full flex items-center justify-between p-2.5 rounded-lg text-left transition-colors ${alreadyIn ? 'bg-emerald-50 border border-emerald-200 opacity-60 cursor-default' : selectedProfile?.id === profile.id ? 'bg-amber-50 border border-amber-200' : 'bg-white border border-slate-200 hover:border-amber-200 hover:bg-amber-50/40'}`}>
                              <div className="flex items-center gap-2.5">
                                <div className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
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
                              {alreadyIn
                                ? <span className="text-xs font-semibold text-emerald-600">Added ✓</span>
                                : <span className="text-xs text-slate-400">Select</span>
                              }
                            </button>
                          )
                        })}
                      </div>
                      {selectedProfile && (
                        <div className="bg-white border border-amber-200 rounded-lg p-3 mb-1">
                          <p className="text-xs font-semibold text-slate-700 mb-2">Adding <span className="text-amber-700">{selectedProfile.company ?? selectedProfile.name}</span></p>
                          <div className="flex gap-2">
                            <div className="relative flex-1">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">$</span>
                              <input type="number" placeholder={isParticipant ? 'Booth fee they pay' : 'Quote amount'} value={profileQuote} onChange={e => setProfileQuote(e.target.value)}
                                className="pl-6 pr-3 py-2 w-full border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-50" />
                            </div>
                            <button onClick={() => handleAddFromEventOS(svc.id)} disabled={!profileQuote} className="px-4 py-2 bg-amber-600 text-white rounded-lg text-sm font-semibold hover:bg-amber-700 disabled:opacity-40 transition-colors">Confirm</button>
                            <button onClick={() => setSelectedProfile(null)} className="px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50">Cancel</button>
                          </div>
                        </div>
                      )}
                    </>
                  )}

                  {/* ── Manual tab ───────────────────────────────────────── */}
                  {addTab === 'new' && (
                    <div className="space-y-2">
                      <input type="text" placeholder="Company name *" value={newCompany} onChange={e => setNewCompany(e.target.value)}
                        className="px-3 py-2 w-full border border-slate-200 bg-white rounded-lg text-sm focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-50" />
                      <div className="grid grid-cols-2 gap-2">
                        <input type="text" placeholder="Contact person" value={newContact} onChange={e => setNewContact(e.target.value)} className="px-3 py-2 border border-slate-200 bg-white rounded-lg text-sm focus:outline-none focus:border-amber-400" />
                        <input type="text" placeholder="Phone number" value={newPhone} onChange={e => setNewPhone(e.target.value)} className="px-3 py-2 border border-slate-200 bg-white rounded-lg text-sm focus:outline-none focus:border-amber-400" />
                        <input type="text" placeholder="Service type" value={newSvcType} onChange={e => setNewSvcType(e.target.value)} className="px-3 py-2 border border-slate-200 bg-white rounded-lg text-sm focus:outline-none focus:border-amber-400" />
                        <select value={newTier} onChange={e => setNewTier(e.target.value as AssignedVendor['tier'])} className="px-3 py-2 border border-slate-200 bg-white rounded-lg text-sm focus:outline-none focus:border-amber-400">
                          <option>Premium</option><option>Standard</option><option>Budget</option>
                        </select>
                      </div>
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">$</span>
                          <input type="number" placeholder={isParticipant ? 'Booth fee they pay' : 'Quote amount'} value={newQuote} onChange={e => setNewQuote(e.target.value)}
                            className="pl-6 pr-3 py-2 w-full border border-slate-200 bg-white rounded-lg text-sm focus:outline-none focus:border-amber-400" />
                        </div>
                        <button onClick={() => handleAddNew(svc.id)} disabled={!newCompany.trim()} className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-semibold hover:bg-slate-800 disabled:opacity-40 transition-colors">Add</button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}

        {/* Add Service Requirement */}
        <div className="bg-white rounded-xl border border-dashed border-slate-300 overflow-hidden">
          <button onClick={() => setAddingService(v => !v)} className="w-full flex items-center gap-2 px-5 py-4 text-sm font-semibold text-amber-600 hover:text-amber-700 hover:bg-amber-50/30 transition-colors">
            <Plus size={16} className={`transition-transform ${addingService ? 'rotate-45' : ''}`} /> Add Service Requirement
          </button>
          {addingService && (
            <div className="border-t border-slate-100 bg-slate-50 p-4 space-y-2">
              <div className="flex gap-1 p-1 bg-slate-100 rounded-lg mb-1">
                <button onClick={() => setNewServiceType('service')} className={`flex-1 py-1.5 px-2 rounded-md text-xs font-semibold transition-colors ${newServiceType === 'service' ? 'bg-white text-amber-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Service Provider (you pay them)</button>
                <button onClick={() => setNewServiceType('participant')} className={`flex-1 py-1.5 px-2 rounded-md text-xs font-semibold transition-colors ${newServiceType === 'participant' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Booth / Exhibitor (they pay you)</button>
              </div>
              <input type="text" placeholder={newServiceType === 'participant' ? 'Booth type *' : 'Service name *'} value={newServiceName} onChange={e => setNewServiceName(e.target.value)} className="px-3 py-2 w-full border border-slate-200 bg-white rounded-lg text-sm focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-50" />
              <input type="text" placeholder="Description" value={newServiceDesc} onChange={e => setNewServiceDesc(e.target.value)} className="px-3 py-2 w-full border border-slate-200 bg-white rounded-lg text-sm focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-50" />
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">$</span>
                  <input type="number" placeholder={newServiceType === 'participant' ? 'Booth fee per vendor' : 'Budget'} value={newServiceBudget} onChange={e => setNewServiceBudget(e.target.value)} className="pl-6 pr-3 py-2 w-full border border-slate-200 bg-white rounded-lg text-sm focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-50" />
                </div>
                <button onClick={handleAddService} disabled={!newServiceName.trim()} className="px-4 py-2 bg-amber-600 text-white rounded-lg text-sm font-semibold hover:bg-amber-700 disabled:opacity-40 transition-colors">Add</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
