import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronRight, Plus, Minus, Info, Trash2, MapPin, AlertCircle } from 'lucide-react'
import { useEvents, fmtDate, fmtTime } from '../context/EventsContext'
import type { AppEvent, StaffRole } from '../context/EventsContext'

let _id = 1
const newRow = (): StaffRole => ({ id: _id++, role: '', responsibilities: '', count: 1, rate: 0, hours: 8 })

const INPUT = 'w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-300 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition-colors bg-white'

export default function CreateEvent() {
  const navigate = useNavigate()
  const { addEvent } = useEvents()
  const [form, setForm] = useState({ name: '', date: '', location: '', from: '', to: '' })
  const [rows, setRows] = useState<StaffRole[]>([newRow()])
  const [mapLocation, setMapLocation] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [posted, setPosted] = useState(false)
  const locationRef = useRef<HTMLInputElement>(null)

  const setField = (k: keyof typeof form, v: string) => {
    setForm(p => ({ ...p, [k]: v }))
    if (errors[k]) setErrors(p => { const n = { ...p }; delete n[k]; return n })
  }

  const update = (id: number, field: keyof StaffRole, val: string | number) =>
    setRows(prev => prev.map(r => r.id === id ? { ...r, [field]: val } : r))

  const changeCount = (id: number, d: number) =>
    setRows(prev => prev.map(r => r.id === id ? { ...r, count: Math.max(1, r.count + d) } : r))

  const removeRow = (id: number) => setRows(prev => prev.filter(r => r.id !== id))
  const addRow = () => setRows(prev => [...prev, newRow()])

  const totalStaff  = rows.reduce((a, r) => a + r.count, 0)
  const totalBudget = rows.reduce((a, r) => a + r.count * r.rate * r.hours, 0)
  const serviceFee  = totalBudget * 0.15

  const validate = () => {
    const e: Record<string, string> = {}
    if (!form.name.trim())     e.name     = 'Event name is required'
    if (!form.date)            e.date     = 'Date is required'
    if (!form.location.trim()) e.location = 'Venue is required'
    if (!form.from)            e.from     = 'Start time required'
    if (!form.to)              e.to       = 'End time required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handlePost = () => {
    if (!validate()) return

    const event: AppEvent = {
      id: `EVT-${Date.now()}`,
      name: form.name.trim(),
      date: form.date,
      from: form.from,
      to: form.to,
      location: form.location.trim(),
      status: 'Planning',
      staffRoles: rows,
      filled: 0,
      total: totalStaff,
      createdAt: Date.now(),
    }

    addEvent(event)
    setPosted(true)
    setTimeout(() => navigate('/events'), 1200)
  }

  return (
    <div className="p-4 md:p-8 max-w-[1400px]">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-slate-400 mb-5">
        <button onClick={() => navigate('/events')} className="hover:text-slate-600 transition-colors">Events</button>
        <ChevronRight size={13} />
        <span className="text-slate-700 font-medium">Create Event</span>
      </div>

      <div className="mb-6 md:mb-7">
        <h1 className="text-xl md:text-2xl font-bold text-slate-900">Setup New Event</h1>
        <p className="text-slate-500 text-sm mt-1">Define event details and staffing requirements</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 md:gap-7">
        {/* Form */}
        <div className="lg:col-span-2 space-y-5 md:space-y-6">

          {/* Step 1: Event Information */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 md:p-6">
            <div className="flex items-center gap-2.5 mb-5">
              <span className="w-6 h-6 bg-blue-600 text-white text-xs font-bold rounded-full flex items-center justify-center shrink-0">1</span>
              <h2 className="font-semibold text-slate-900">Event Information</h2>
            </div>

            <div className="space-y-4">
              {/* Event Name */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Event Name</label>
                <input
                  type="text"
                  placeholder="e.g. Corporate Product Launch"
                  value={form.name}
                  onChange={e => setField('name', e.target.value)}
                  className={INPUT + (errors.name ? ' border-red-400 ring-2 ring-red-50' : '')}
                />
                {errors.name && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle size={11} />{errors.name}</p>}
              </div>

              {/* Date + Venue */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Event Date</label>
                  <input
                    type="date"
                    value={form.date}
                    onChange={e => setField('date', e.target.value)}
                    className={INPUT + (errors.date ? ' border-red-400 ring-2 ring-red-50' : '')}
                  />
                  {errors.date && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle size={11} />{errors.date}</p>}
                </div>

                {/* Time range */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Start Time</label>
                    <input
                      type="time"
                      value={form.from}
                      onChange={e => setField('from', e.target.value)}
                      className={INPUT + (errors.from ? ' border-red-400' : '')}
                    />
                    {errors.from && <p className="text-xs text-red-500 mt-1"><AlertCircle size={11} className="inline mr-1" />Required</p>}
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">End Time</label>
                    <input
                      type="time"
                      value={form.to}
                      onChange={e => setField('to', e.target.value)}
                      className={INPUT + (errors.to ? ' border-red-400' : '')}
                    />
                    {errors.to && <p className="text-xs text-red-500 mt-1"><AlertCircle size={11} className="inline mr-1" />Required</p>}
                  </div>
                </div>
              </div>

              {/* Venue */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  <MapPin size={11} className="inline mr-1 text-slate-400" />Venue / Location
                </label>
                <input
                  ref={locationRef}
                  type="text"
                  placeholder="e.g. ExCeL London, Royal Docks, London"
                  value={form.location}
                  onChange={e => setField('location', e.target.value)}
                  onBlur={() => setMapLocation(form.location.trim())}
                  className={INPUT + (errors.location ? ' border-red-400 ring-2 ring-red-50' : '')}
                />
                {errors.location && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle size={11} />{errors.location}</p>}

                {/* Map embed — shows after user blurs the field with content */}
                {mapLocation && (
                  <div className="mt-3 rounded-xl overflow-hidden border border-slate-200 shadow-sm">
                    <iframe
                      title="venue-map"
                      src={`https://maps.google.com/maps?q=${encodeURIComponent(mapLocation)}&output=embed`}
                      className="w-full h-44 md:h-56"
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                    />
                    <div className="px-3 py-2 bg-slate-50 border-t border-slate-100 flex items-center gap-2">
                      <MapPin size={12} className="text-slate-400 shrink-0" />
                      <p className="text-xs text-slate-500 truncate">{mapLocation}</p>
                      <a
                        href={`https://maps.google.com/maps?q=${encodeURIComponent(mapLocation)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-blue-600 font-medium shrink-0 hover:underline ml-auto"
                      >
                        Open in Maps →
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Step 2: Staffing */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 md:p-6">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2.5">
                <span className="w-6 h-6 bg-blue-600 text-white text-xs font-bold rounded-full flex items-center justify-center shrink-0">2</span>
                <h2 className="font-semibold text-slate-900">Staffing Requirements</h2>
              </div>
              <span className="text-xs text-slate-400">{totalStaff} staff · {totalBudget > 0 ? `$${totalBudget.toFixed(0)} est.` : 'no cost yet'}</span>
            </div>

            <div className="space-y-3">
              {rows.map((row, idx) => (
                <div key={row.id} className="border border-slate-200 rounded-xl overflow-hidden">
                  <div className="bg-slate-50 px-4 py-2 flex items-center justify-between border-b border-slate-100">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Role {idx + 1}</span>
                    {rows.length > 1 && (
                      <button onClick={() => removeRow(row.id)} className="p-1 rounded hover:bg-red-50 text-slate-300 hover:text-red-500 transition-colors">
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>

                  <div className="p-4 space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Role Title</label>
                        <input
                          type="text"
                          placeholder="e.g. Brand Ambassador"
                          value={row.role}
                          onChange={e => update(row.id, 'role', e.target.value)}
                          className={INPUT}
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Responsibilities</label>
                        <input
                          type="text"
                          placeholder="e.g. Product demos, customer engagement"
                          value={row.responsibilities}
                          onChange={e => update(row.id, 'responsibilities', e.target.value)}
                          className={INPUT}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Headcount</label>
                        <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-white">
                          <button onClick={() => changeCount(row.id, -1)} className="w-9 flex items-center justify-center py-2.5 hover:bg-slate-50 border-r border-slate-200 text-slate-500">
                            <Minus size={13} />
                          </button>
                          <input
                            type="number"
                            min={1}
                            value={row.count}
                            onChange={e => update(row.id, 'count', Math.max(1, parseInt(e.target.value) || 1))}
                            className="flex-1 text-center text-sm font-bold text-slate-900 py-2.5 focus:outline-none w-0"
                          />
                          <button onClick={() => changeCount(row.id, 1)} className="w-9 flex items-center justify-center py-2.5 hover:bg-slate-50 border-l border-slate-200 text-slate-500">
                            <Plus size={13} />
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Pay Rate ($/hr)</label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">$</span>
                          <input
                            type="number"
                            min={0}
                            placeholder="0"
                            value={row.rate || ''}
                            onChange={e => update(row.id, 'rate', parseFloat(e.target.value) || 0)}
                            className={INPUT + ' pl-7'}
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Shift (hrs)</label>
                        <input
                          type="number"
                          min={1}
                          max={24}
                          value={row.hours}
                          onChange={e => update(row.id, 'hours', Math.max(1, parseInt(e.target.value) || 1))}
                          className={INPUT}
                        />
                      </div>
                    </div>

                    {row.rate > 0 && (
                      <div className="flex items-center justify-between bg-blue-50 rounded-lg px-3 py-2">
                        <span className="text-xs text-blue-600">{row.count} staff × ${row.rate}/hr × {row.hours}h</span>
                        <span className="text-sm font-bold text-blue-700">${(row.count * row.rate * row.hours).toFixed(2)}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              <button
                onClick={addRow}
                className="flex items-center gap-2 text-sm text-blue-600 font-medium w-full justify-center border border-dashed border-blue-200 hover:border-blue-400 rounded-xl py-3 bg-blue-50/50 hover:bg-blue-50 transition-all"
              >
                <Plus size={14} /> Add Another Role
              </button>
            </div>
          </div>

          {/* Budget summary mobile */}
          <div className="lg:hidden bg-white rounded-xl border border-slate-200 p-4">
            <h3 className="font-semibold text-slate-900 mb-3">Budget Estimate</h3>
            <div className="space-y-2.5">
              <div className="flex justify-between"><span className="text-sm text-slate-500">Total Staff</span><span className="text-sm font-bold text-slate-900">{totalStaff} persons</span></div>
              <div className="flex justify-between"><span className="text-sm text-slate-500">Labour Cost</span><span className="text-sm font-bold text-slate-900">${totalBudget.toFixed(2)}</span></div>
              <div className="flex justify-between"><span className="text-sm text-slate-500">Service Fee (15%)</span><span className="text-sm text-slate-500">{totalBudget > 0 ? `$${serviceFee.toFixed(2)}` : '—'}</span></div>
              {totalBudget > 0 && <div className="flex justify-between pt-2 border-t border-slate-100"><span className="text-sm font-bold text-slate-900">Total Estimate</span><span className="text-sm font-bold text-blue-600">${(totalBudget + serviceFee).toFixed(2)}</span></div>}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={handlePost}
              disabled={posted}
              className={`flex-1 py-3 rounded-xl font-semibold text-sm transition-colors shadow-md ${
                posted
                  ? 'bg-emerald-500 text-white shadow-emerald-500/20 cursor-default'
                  : 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-600/20'
              }`}
            >
              {posted ? '✓ Event Posted! Redirecting...' : 'Create & Post Event'}
            </button>
            <button className="flex-1 py-3 border border-slate-200 bg-white text-slate-700 rounded-xl font-semibold text-sm hover:bg-slate-50 transition-colors">
              Save as Draft
            </button>
          </div>

          <p className="flex items-start gap-2 text-xs text-slate-400">
            <Info size={13} className="shrink-0 mt-0.5" />
            Created events are automatically listed for verified workers on the EventOS mobile app.
          </p>
        </div>

        {/* Summary Panel — desktop */}
        <div className="hidden lg:block">
          <div className="bg-white rounded-xl border border-slate-200 p-5 sticky top-8">
            <h3 className="font-semibold text-slate-900 mb-4">Event Summary</h3>

            {(form.name || form.date || form.location) ? (
              <div className="space-y-3 mb-4">
                {form.name     && <div><p className="text-[11px] text-slate-400 mb-0.5">Event</p><p className="text-sm font-semibold text-slate-900">{form.name}</p></div>}
                {form.date     && <div><p className="text-[11px] text-slate-400 mb-0.5">Date</p><p className="text-sm font-semibold text-slate-900">{fmtDate(form.date)}</p></div>}
                {(form.from || form.to) && (
                  <div><p className="text-[11px] text-slate-400 mb-0.5">Time</p>
                    <p className="text-sm font-semibold text-slate-900">{fmtTime(form.from)}{form.from && form.to ? ' – ' : ''}{fmtTime(form.to)}</p>
                  </div>
                )}
                {form.location && <div><p className="text-[11px] text-slate-400 mb-0.5">Venue</p><p className="text-sm font-semibold text-slate-900">{form.location}</p></div>}
              </div>
            ) : (
              <p className="text-sm text-slate-400 mb-4">Fill in event details to see summary</p>
            )}

            <div className="h-px bg-slate-100 mb-4" />

            {rows.some(r => r.role) && (
              <div className="space-y-2 mb-4">
                {rows.map((r, i) => (
                  <div key={r.id} className="flex justify-between items-center">
                    <span className="text-sm text-slate-600 truncate mr-2">{r.role || `Role ${i + 1}`} ×{r.count}</span>
                    <span className="text-sm font-semibold text-slate-900 shrink-0">{r.rate > 0 ? `$${(r.count * r.rate * r.hours).toFixed(0)}` : '—'}</span>
                  </div>
                ))}
                <div className="h-px bg-slate-100 mt-1" />
              </div>
            )}

            <div className="space-y-2.5">
              <div className="flex justify-between"><span className="text-sm text-slate-500">Total Staff</span><span className="text-sm font-bold text-slate-900">{totalStaff} persons</span></div>
              <div className="flex justify-between"><span className="text-sm text-slate-500">Labour Cost</span><span className="text-sm font-bold text-slate-900">${totalBudget.toFixed(2)}</span></div>
              <div className="flex justify-between"><span className="text-sm text-slate-500">Service Fee (15%)</span><span className="text-sm text-slate-500">{totalBudget > 0 ? `$${serviceFee.toFixed(2)}` : '—'}</span></div>
            </div>
            {totalBudget > 0 && (
              <>
                <div className="h-px bg-slate-200 my-4" />
                <div className="flex justify-between">
                  <span className="text-sm font-bold text-slate-900">Total Estimate</span>
                  <span className="text-base font-bold text-blue-600">${(totalBudget + serviceFee).toFixed(2)}</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
