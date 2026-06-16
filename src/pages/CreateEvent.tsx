import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronRight, Plus, Minus, Info } from 'lucide-react'

const FIELD_DEFS = [
  { label: 'Event Name',       key: 'name',     placeholder: 'e.g. Nike Product Launch',   span: true },
  { label: 'Event Date',       key: 'date',     placeholder: 'MM / DD / YYYY',             span: false },
  { label: 'Venue / Location', key: 'location', placeholder: 'Venue name or full address', span: false },
] as const

export default function CreateEvent() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', date: '', location: '', from: '', to: '' })
  const [staffing, setStaffing] = useState([
    { role: 'Promoters',    desc: 'Product demonstration & flyering',  rate: 18, count: 0 },
    { role: 'Team Leaders', desc: 'Supervision & report coordination', rate: 25, count: 0 },
  ])

  const changeCount = (i: number, d: number) =>
    setStaffing(prev => prev.map((s, idx) => idx === i ? { ...s, count: Math.max(0, s.count + d) } : s))

  const totalStaff  = staffing.reduce((a, s) => a + s.count, 0)
  const totalBudget = staffing.reduce((a, s) => a + s.count * s.rate, 0)
  const serviceFee  = totalBudget * 0.15

  return (
    <div className="p-4 md:p-8 max-w-[1400px]">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-slate-400 mb-5">
        <button onClick={() => navigate('/')} className="hover:text-slate-600 transition-colors">Events</button>
        <ChevronRight size={13} />
        <span className="text-slate-700 font-medium">Create Event</span>
      </div>

      <div className="mb-6 md:mb-7">
        <h1 className="text-xl md:text-2xl font-bold text-slate-900">Setup New Event</h1>
        <p className="text-slate-500 text-sm mt-1">Define event details and initial staffing requirements</p>
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {FIELD_DEFS.map(({ label, key, placeholder, span }) => (
                <div key={key} className={span ? 'sm:col-span-2' : ''}>
                  <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">{label}</label>
                  <input
                    type="text"
                    placeholder={placeholder}
                    value={form[key]}
                    onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
                    className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-300 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition-colors"
                  />
                </div>
              ))}
              {/* Time range */}
              {[
                { label: 'Start Time', key: 'from', placeholder: '08:00 AM' },
                { label: 'End Time',   key: 'to',   placeholder: '06:00 PM' },
              ].map(({ label, key, placeholder }) => (
                <div key={key}>
                  <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">{label}</label>
                  <input
                    type="text"
                    placeholder={placeholder}
                    value={form[key as 'from' | 'to']}
                    onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
                    className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-300 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition-colors"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Step 2: Staffing */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 md:p-6">
            <div className="flex items-center gap-2.5 mb-5">
              <span className="w-6 h-6 bg-blue-600 text-white text-xs font-bold rounded-full flex items-center justify-center shrink-0">2</span>
              <h2 className="font-semibold text-slate-900">Staffing Requirements</h2>
            </div>
            <div className="space-y-3">
              {staffing.map((item, i) => (
                <div key={item.role} className="flex items-center gap-3 p-3 md:p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900">{item.role}</p>
                    <p className="text-xs text-slate-400 mt-0.5 hidden sm:block">{item.desc}</p>
                    <p className="text-xs text-slate-400 mt-0.5 sm:hidden">${item.rate}/hr</p>
                  </div>
                  <span className="text-xs text-slate-400 shrink-0 hidden sm:block">${item.rate}/hr est.</span>
                  <div className="flex items-center gap-2 md:gap-3 shrink-0">
                    <button
                      onClick={() => changeCount(i, -1)}
                      className="w-8 h-8 rounded-full border border-slate-200 bg-white flex items-center justify-center hover:bg-slate-100 transition-colors"
                    >
                      <Minus size={14} className="text-slate-600" />
                    </button>
                    <span className="text-slate-900 font-bold w-5 text-center">{item.count}</span>
                    <button
                      onClick={() => changeCount(i, 1)}
                      className="w-8 h-8 rounded-full border border-slate-200 bg-white flex items-center justify-center hover:bg-slate-100 transition-colors"
                    >
                      <Plus size={14} className="text-slate-600" />
                    </button>
                  </div>
                </div>
              ))}
              <button
                onClick={() => setStaffing(p => [...p, { role: 'Custom Role', desc: 'Define responsibilities', rate: 20, count: 0 }])}
                className="flex items-center gap-2 text-sm text-blue-600 font-medium hover:text-blue-700 transition-colors mt-1"
              >
                <Plus size={14} /> Add Custom Staff Category
              </button>
            </div>
          </div>

          {/* Budget summary on mobile (replaces sticky panel) */}
          <div className="lg:hidden bg-white rounded-xl border border-slate-200 p-4">
            <h3 className="font-semibold text-slate-900 mb-3">Budget Estimate</h3>
            <div className="space-y-2.5">
              <div className="flex justify-between">
                <span className="text-sm text-slate-500">Total Staff</span>
                <span className="text-sm font-bold text-slate-900">{totalStaff} persons</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-slate-500">Estimated</span>
                <span className="text-sm font-bold text-slate-900">${totalBudget.toFixed(2)}</span>
              </div>
              {totalBudget > 0 && (
                <div className="flex justify-between pt-2 border-t border-slate-100">
                  <span className="text-sm font-bold text-slate-900">Total (incl. 15% fee)</span>
                  <span className="text-sm font-bold text-blue-600">${(totalBudget + serviceFee).toFixed(2)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-semibold text-sm hover:bg-blue-700 transition-colors shadow-md shadow-blue-600/20">
              Create &amp; Post Event
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

        {/* Summary Panel — desktop only */}
        <div className="hidden lg:block">
          <div className="bg-white rounded-xl border border-slate-200 p-5 sticky top-8">
            <h3 className="font-semibold text-slate-900 mb-4">Event Summary</h3>
            {(form.name || form.date || form.location) ? (
              <div className="space-y-3 mb-5">
                {form.name     && <div><p className="text-[11px] text-slate-400 mb-0.5">Event</p><p className="text-sm font-semibold text-slate-900">{form.name}</p></div>}
                {form.date     && <div><p className="text-[11px] text-slate-400 mb-0.5">Date</p><p className="text-sm font-semibold text-slate-900">{form.date}</p></div>}
                {form.location && <div><p className="text-[11px] text-slate-400 mb-0.5">Venue</p><p className="text-sm font-semibold text-slate-900">{form.location}</p></div>}
              </div>
            ) : (
              <p className="text-sm text-slate-400 mb-5">Fill in event details to see summary</p>
            )}
            <div className="h-px bg-slate-100 mb-4" />
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-slate-500">Total Staff Required</span>
                <span className="text-sm font-bold text-slate-900">{totalStaff} Persons</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-slate-500">Estimated Budget</span>
                <span className="text-sm font-bold text-slate-900">${totalBudget.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-slate-500">Service Fee (15%)</span>
                <span className="text-sm text-slate-500">{totalBudget > 0 ? `$${serviceFee.toFixed(2)}` : '—'}</span>
              </div>
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
