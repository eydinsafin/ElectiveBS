import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, Star, AlertTriangle, MapPin, Check } from 'lucide-react'
import Avatar from '../components/Avatar'

const roles = [
  { label: 'Promoters', filled: 4, total: 12 },
  { label: 'Supervisors', filled: 1, total: 2 },
  { label: 'Media', filled: 0, total: 1 },
]

const staff = [
  { name: 'Sarah Jenkins', role: 'Lead Promoter', rate: '$18/hr', rating: 4.9, events: 47, distance: '0.2km', conflict: null },
  { name: 'Marcus Low',    role: 'Promoter',      rate: '$15/hr', rating: 4.7, events: 23, distance: '0.8km', conflict: null },
  { name: 'Aria Gupta',    role: 'Promoter',      rate: '$15/hr', rating: 4.5, events: 18, distance: '1.2km', conflict: 'BMW Roadshow' },
  { name: 'James Wilson',  role: 'Promoter',      rate: '$16/hr', rating: 4.8, events: 35, distance: '1.5km', conflict: null },
]

export default function StaffAssignment() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<'available' | 'busy'>('available')
  const [selected, setSelected] = useState<Set<string>>(new Set(['Sarah Jenkins', 'Marcus Low', 'James Wilson']))

  const toggle = (name: string) =>
    setSelected(prev => {
      const next = new Set(prev)
      next.has(name) ? next.delete(name) : next.add(name)
      return next
    })

  return (
    <div className="min-h-screen bg-zinc-950 pb-32">
      {/* Header */}
      <div className="px-5 pt-14 pb-4 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-full bg-zinc-800 flex items-center justify-center shrink-0">
          <ChevronLeft size={18} className="text-zinc-300" />
        </button>
        <div>
          <h1 className="text-lg font-semibold text-white">Staff Assignment</h1>
          <p className="text-zinc-500 text-xs mt-0.5">Nike Product Launch</p>
        </div>
      </div>

      {/* Role pills */}
      <div className="px-5 mb-4">
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {roles.map(r => {
            const full = r.filled >= r.total
            return (
              <span
                key={r.label}
                className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold border ${
                  full
                    ? 'bg-green-500/10 border-green-500/30 text-green-400'
                    : 'bg-red-500/10 border-red-500/30 text-red-400'
                }`}
              >
                {r.label} ({r.filled}/{r.total})
              </span>
            )
          })}
        </div>
      </div>

      {/* Tabs */}
      <div className="px-5 mb-5">
        <div className="flex bg-zinc-900 rounded-2xl p-1">
          {(['available', 'busy'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-medium capitalize transition-all ${
                activeTab === tab ? 'bg-zinc-700 text-white shadow' : 'text-zinc-500'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Staff cards */}
      <div className="px-5 space-y-3">
        {staff.map(m => {
          const isSelected = selected.has(m.name)
          return (
            <button
              key={m.name}
              onClick={() => toggle(m.name)}
              className={`w-full text-left bg-zinc-900 rounded-3xl p-4 border-2 transition-all active:scale-[0.99] ${
                isSelected ? 'border-blue-600 shadow-md shadow-blue-600/15' : 'border-transparent'
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div className="relative">
                  <Avatar name={m.name} size="lg" />
                  {isSelected && (
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center shadow">
                      <Check size={11} className="text-white" strokeWidth={3} />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-0.5">
                    <p className="text-white font-semibold truncate">{m.name}</p>
                    <span className="text-blue-400 font-semibold text-sm shrink-0">{m.rate}</span>
                  </div>
                  <p className="text-zinc-400 text-xs mb-2">{m.role}</p>
                  <div className="flex items-center gap-4 text-xs text-zinc-500">
                    <span className="flex items-center gap-1">
                      <Star size={11} className="text-yellow-400 fill-yellow-400" />
                      {m.rating}
                    </span>
                    <span>{m.events} events</span>
                    <span className="flex items-center gap-1">
                      <MapPin size={11} />
                      {m.distance}
                    </span>
                  </div>
                  {m.conflict && (
                    <div className="mt-2 flex items-center gap-1.5 text-red-400 text-xs font-medium">
                      <AlertTriangle size={12} />
                      Conflict: {m.conflict}
                    </div>
                  )}
                </div>
              </div>
            </button>
          )
        })}
      </div>

      {/* Bottom CTA */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[390px] bg-zinc-900/95 backdrop-blur border-t border-zinc-800 p-4 grid grid-cols-2 gap-3">
        <button className="py-3.5 border border-zinc-700 rounded-2xl text-zinc-300 font-semibold text-sm active:scale-95 transition-transform">
          Check Conflicts
        </button>
        <button className="py-3.5 bg-blue-600 rounded-2xl text-white font-semibold text-sm shadow-lg shadow-blue-600/25 active:scale-95 transition-transform">
          Confirm ({selected.size} Staff)
        </button>
      </div>
    </div>
  )
}
