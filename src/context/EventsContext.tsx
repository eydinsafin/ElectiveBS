import { createContext, useContext, useState, ReactNode } from 'react'

export type StaffRole = {
  id: number
  role: string
  responsibilities: string
  count: number
  rate: number
  hours: number
}

export type AssignedPerson = {
  id: string
  name: string
  phone: string
  tier: 'Expert' | 'Senior' | 'Junior'
}

export const STAFF_POOL: AssignedPerson[] = [
  { id: 'sp-1', name: 'Sarah Jenkins', phone: '07712 345678', tier: 'Expert' },
  { id: 'sp-2', name: 'Marcus Low',    phone: '07723 456789', tier: 'Senior' },
  { id: 'sp-3', name: 'Aria Gupta',    phone: '07734 567890', tier: 'Senior' },
  { id: 'sp-4', name: 'James Wilson',  phone: '07745 678901', tier: 'Senior' },
  { id: 'sp-5', name: 'Emma Chen',     phone: '07756 789012', tier: 'Expert' },
  { id: 'sp-6', name: 'David Park',    phone: '07767 890123', tier: 'Junior' },
  { id: 'sp-7', name: 'Lisa Torres',   phone: '07778 901234', tier: 'Senior' },
  { id: 'sp-8', name: 'Tom Hayes',     phone: '07789 012345', tier: 'Junior' },
]

export type AppEvent = {
  id: string
  name: string
  date: string       // YYYY-MM-DD
  from: string       // HH:MM
  to: string         // HH:MM
  location: string
  status: 'On Track' | 'Filling' | 'Critical' | 'Planning'
  staffRoles: StaffRole[]
  filled: number
  total: number
  createdAt: number
  assignments?: { [roleId: string]: AssignedPerson[] }
}

type EventPatch = Partial<Pick<AppEvent, 'name' | 'date' | 'from' | 'to' | 'location' | 'status'>>

type Ctx = {
  events: AppEvent[]
  addEvent: (e: AppEvent) => void
  updateEvent: (eventId: string, patch: EventPatch) => void
  updateEventRoles: (eventId: string, roles: StaffRole[]) => void
  assignToRole: (eventId: string, roleId: number, person: AssignedPerson) => void
  removeFromRole: (eventId: string, roleId: number, personId: string) => void
}

const EventsContext = createContext<Ctx>({
  events: [],
  addEvent: () => {},
  updateEvent: () => {},
  updateEventRoles: () => {},
  assignToRole: () => {},
  removeFromRole: () => {},
})

const LS_KEY = 'eventos_events'

function load(): AppEvent[] {
  try { return JSON.parse(localStorage.getItem(LS_KEY) || '[]') } catch { return [] }
}

function save(evts: AppEvent[]) {
  localStorage.setItem(LS_KEY, JSON.stringify(evts))
}

function computeStatus(filled: number, total: number): AppEvent['status'] {
  if (total === 0) return 'Planning'
  const pct = filled / total
  if (pct >= 1)   return 'On Track'
  if (pct >= 0.6) return 'Filling'
  if (pct > 0)    return 'Critical'
  return 'Planning'
}

export function EventsProvider({ children }: { children: ReactNode }) {
  const [events, setEvents] = useState<AppEvent[]>(load)

  const addEvent = (e: AppEvent) => {
    setEvents(prev => {
      const next = [...prev, e]
      save(next)
      return next
    })
  }

  const updateEvent = (eventId: string, patch: EventPatch) => {
    setEvents(prev => {
      const next = prev.map(e => e.id === eventId ? { ...e, ...patch } : e)
      save(next)
      return next
    })
  }

  const updateEventRoles = (eventId: string, roles: StaffRole[]) => {
    setEvents(prev => {
      const next = prev.map(e => {
        if (e.id !== eventId) return e
        const total = roles.reduce((a, r) => a + r.count, 0)
        return { ...e, staffRoles: roles, total, status: computeStatus(e.filled, total) }
      })
      save(next)
      return next
    })
  }

  const assignToRole = (eventId: string, roleId: number, person: AssignedPerson) => {
    setEvents(prev => {
      const next = prev.map(e => {
        if (e.id !== eventId) return e
        const key = roleId.toString()
        const existing = (e.assignments?.[key]) || []
        if (existing.find(p => p.id === person.id)) return e
        const assignments = { ...(e.assignments || {}), [key]: [...existing, person] }
        const filled = Object.values(assignments).reduce((a, arr) => a + arr.length, 0)
        return { ...e, assignments, filled, status: computeStatus(filled, e.total) }
      })
      save(next)
      return next
    })
  }

  const removeFromRole = (eventId: string, roleId: number, personId: string) => {
    setEvents(prev => {
      const next = prev.map(e => {
        if (e.id !== eventId) return e
        const key = roleId.toString()
        const assignments = {
          ...(e.assignments || {}),
          [key]: ((e.assignments?.[key]) || []).filter(p => p.id !== personId),
        }
        const filled = Object.values(assignments).reduce((a, arr) => a + arr.length, 0)
        return { ...e, assignments, filled, status: computeStatus(filled, e.total) }
      })
      save(next)
      return next
    })
  }

  return (
    <EventsContext.Provider value={{ events, addEvent, updateEvent, updateEventRoles, assignToRole, removeFromRole }}>
      {children}
    </EventsContext.Provider>
  )
}

export const useEvents = () => useContext(EventsContext)

// ── helpers ────────────────────────────────────────────────────────────────────

export function fmtDate(d: string): string {
  if (!d) return ''
  const [y, m, day] = d.split('-')
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  return `${months[parseInt(m) - 1]} ${parseInt(day)}, ${y}`
}

export function fmtTime(t: string): string {
  if (!t) return ''
  const [h, min] = t.split(':').map(Number)
  const ampm = h >= 12 ? 'PM' : 'AM'
  const h12 = h % 12 || 12
  return `${h12}:${min.toString().padStart(2, '0')} ${ampm}`
}

export const STATUS_BADGE: Record<string, string> = {
  'On Track': 'bg-emerald-100 text-emerald-700',
  'Critical':  'bg-red-100 text-red-700',
  'Filling':   'bg-amber-100 text-amber-700',
  'Planning':  'bg-blue-100 text-blue-700',
}

export const PROGRESS_BAR: Record<string, string> = {
  'On Track': 'bg-emerald-500',
  'Critical':  'bg-red-500',
  'Filling':   'bg-amber-500',
  'Planning':  'bg-blue-400',
}
