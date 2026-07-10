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
  unavailableDates?: string[]
}

export type VendorService = {
  id: number
  service: string
  description: string
  budget: number   // for 'service': organiser's budget; for 'participant': booth fee per vendor
  count: number    // for 'service': vendors needed; for 'participant': max booth slots
  type?: 'service' | 'participant'  // defaults to 'service'
}

export type AssignedVendor = {
  id: string
  company: string
  contact: string
  phone: string
  service: string
  tier: 'Premium' | 'Standard' | 'Budget'
  quote: number
}

export const DEFAULT_STAFF_POOL: AssignedPerson[] = [
  { id: 'sp-1',  name: 'Lin Mei Xuan',          phone: '9123 4567', tier: 'Expert', unavailableDates: [] },
  { id: 'sp-2',  name: 'Marcus Low Wei Jie',   phone: '9234 5678', tier: 'Expert', unavailableDates: [] },
  { id: 'sp-3',  name: 'Priya Nair',           phone: '9345 6789', tier: 'Expert', unavailableDates: [] },
  { id: 'sp-4',  name: 'Nicole Ong Mei Lin',   phone: '9456 7890', tier: 'Expert', unavailableDates: [] },
  { id: 'sp-5',  name: 'Kavitha Pillai',       phone: '9567 8901', tier: 'Expert', unavailableDates: [] },
  { id: 'sp-6',  name: 'Emma Chen Jia Hui',    phone: '9678 9012', tier: 'Senior', unavailableDates: [] },
  { id: 'sp-7',  name: 'Jasmine Koh Xin Yi',  phone: '9789 0123', tier: 'Senior', unavailableDates: [] },
  { id: 'sp-8',  name: 'Hafiz Bin Mohamad',    phone: '9890 1234', tier: 'Senior', unavailableDates: [] },
  { id: 'sp-9',  name: 'Kevin Raj',            phone: '9012 3456', tier: 'Senior', unavailableDates: [] },
  { id: 'sp-10', name: 'Melissa Wong Shu Fen', phone: '9111 2233', tier: 'Senior', unavailableDates: [] },
  { id: 'sp-11', name: 'Daniel Ang Boon Kiat', phone: '9222 3344', tier: 'Senior', unavailableDates: [] },
  { id: 'sp-12', name: 'Fatimah Binte Hassan', phone: '9333 4455', tier: 'Senior', unavailableDates: [] },
  { id: 'sp-13', name: 'Yong Jian Hao',         phone: '9444 5566', tier: 'Senior', unavailableDates: [] },
  { id: 'sp-14', name: 'Lisa Tan Hui Ling',    phone: '9555 6677', tier: 'Senior', unavailableDates: [] },
  { id: 'sp-15', name: 'Aditya Sharma',        phone: '9666 7788', tier: 'Junior', unavailableDates: [] },
  { id: 'sp-16', name: 'Ryan Lim Jian Hao',   phone: '9777 8899', tier: 'Junior', unavailableDates: [] },
  { id: 'sp-17', name: 'Chloe Tan Rui En',    phone: '9888 9900', tier: 'Junior', unavailableDates: [] },
  { id: 'sp-18', name: 'Brandon Lee Kai Xin',  phone: '9900 1122', tier: 'Junior', unavailableDates: [] },
  { id: 'sp-19', name: 'Siti Nurhaliza Bte R', phone: '8123 4567', tier: 'Junior', unavailableDates: [] },
  { id: 'sp-20', name: 'Aaron Teo Wei Liang',  phone: '8234 5678', tier: 'Junior', unavailableDates: [] },
  { id: 'sp-21', name: 'Nurul Ain Binte Aziz', phone: '8345 6789', tier: 'Junior', unavailableDates: [] },
  { id: 'sp-22', name: 'Ethan Goh Zhi Hao',   phone: '8456 7890', tier: 'Junior', unavailableDates: [] },
  { id: 'sp-23', name: 'Raewyn Chew Pei Shan', phone: '8567 8901', tier: 'Junior', unavailableDates: [] },
  { id: 'sp-24', name: 'Muhammad Farid Bin S', phone: '8678 9012', tier: 'Junior', unavailableDates: [] },
  { id: 'sp-25', name: 'Cheryl Lim Shi Ting', phone: '8789 0123', tier: 'Senior', unavailableDates: [] },
  { id: 'sp-26', name: 'Rayyan Bin Hashim',   phone: '8890 1234', tier: 'Junior', unavailableDates: [] },
  { id: 'sp-27', name: 'Jacelyn Tan Pei Ying',phone: '8901 2345', tier: 'Senior', unavailableDates: [] },
  { id: 'sp-28', name: 'Rishav Mehta',        phone: '9010 2345', tier: 'Junior', unavailableDates: [] },
  { id: 'sp-29', name: 'Joanna Lee Wen Qi',   phone: '9120 3456', tier: 'Expert', unavailableDates: [] },
]

// backward-compat alias
export const STAFF_POOL = DEFAULT_STAFF_POOL

export const VENDOR_POOL: AssignedVendor[] = [
  { id: 'vp-1', company: 'Pro AV Solutions',     contact: 'Kevin Tan',   phone: '8111 2233', service: 'AV & Sound',    tier: 'Premium',  quote: 0 },
  { id: 'vp-2', company: 'Fresh Catering Co.',   contact: 'Linda Ho',    phone: '8222 3344', service: 'Catering',      tier: 'Standard', quote: 0 },
  { id: 'vp-3', company: 'Elite Security Group', contact: 'Marcus Reid', phone: '8333 4455', service: 'Security',      tier: 'Premium',  quote: 0 },
  { id: 'vp-4', company: 'Bloom Floral Studio',  contact: 'Amy Chen',    phone: '8444 5566', service: 'Decoration',    tier: 'Standard', quote: 0 },
  { id: 'vp-5', company: 'Click Photography',    contact: 'Jake Lim',    phone: '8555 6677', service: 'Photography',   tier: 'Premium',  quote: 0 },
  { id: 'vp-6', company: 'FastTrack Logistics',  contact: 'Dan Park',    phone: '8666 7788', service: 'Logistics',     tier: 'Budget',   quote: 0 },
  { id: 'vp-7', company: 'Spark Entertainment',  contact: 'Suki Tan',    phone: '8777 8899', service: 'Entertainment', tier: 'Standard', quote: 0 },
  { id: 'vp-8', company: 'CleanPro Services',    contact: 'Roy Ng',      phone: '8888 9900', service: 'Cleaning',      tier: 'Budget',   quote: 0 },
]

const p = (id: string): AssignedPerson => {
  const found = DEFAULT_STAFF_POOL.find(s => s.id === id)!
  return { id: found.id, name: found.name, phone: found.phone, tier: found.tier }
}

const v = (id: string, quote: number): AssignedVendor => {
  const found = VENDOR_POOL.find(vendor => vendor.id === id)!
  return { ...found, quote }
}

export type AppEvent = {
  id: string
  name: string
  date: string
  from: string
  to: string
  location: string
  status: 'On Track' | 'Filling' | 'Critical' | 'Planning'
  staffRoles: StaffRole[]
  filled: number
  total: number
  createdAt: number
  assignments?: { [roleId: string]: AssignedPerson[] }
  attendance?: { [personId: string]: string }   // personId → ISO check-in timestamp
  vendorServices?: VendorService[]
  vendorAssignments?: { [serviceId: string]: AssignedVendor[] }
  notes?: string
}

const SAMPLE_EVENTS: AppEvent[] = [
  {
    id: 'EVT-SG-001',
    name: 'Marina Bay Sands Product Launch',
    date: '2026-07-15',
    from: '08:00',
    to: '21:00',
    location: 'Marina Bay Sands Expo & Convention Centre',
    status: 'Filling',
    staffRoles: [
      { id: 101, role: 'Brand Ambassador',          responsibilities: 'Product demos, guest engagement and brand storytelling', count: 18, rate: 25, hours: 13 },
      { id: 102, role: 'Registration & Guest Svcs', responsibilities: 'Guest check-in, badge printing, queue management',       count: 8,  rate: 20, hours: 13 },
      { id: 103, role: 'Event Coordinator',          responsibilities: 'Floor operations, vendor liaison, escalation handling',  count: 5,  rate: 40, hours: 13 },
      { id: 104, role: 'Logistics Runner',           responsibilities: 'Materials movement, replenishment, backstage support',  count: 10, rate: 18, hours: 13 },
      { id: 105, role: 'Security Liaison',           responsibilities: 'Access control, crowd flow management',                 count: 5,  rate: 22, hours: 13 },
    ],
    filled: 26,
    total: 46,
    createdAt: Date.now() - 86400000 * 8,
    assignments: {
      '101': [p('sp-1'), p('sp-6'), p('sp-7'), p('sp-10'), p('sp-12'), p('sp-14'), p('sp-17'), p('sp-19'), p('sp-21'), p('sp-23')],
      '102': [p('sp-3'), p('sp-8'), p('sp-15'), p('sp-16'), p('sp-20'), p('sp-22')],
      '103': [p('sp-2'), p('sp-4'), p('sp-5')],
      '104': [p('sp-9'), p('sp-11'), p('sp-13'), p('sp-18'), p('sp-24')],
      '105': [],
    },
    notes: 'Client contact: Mr. Tan Wei Ming (+65 9111 2222). Dress code: all-black smart casual. VIP holding area on Level 4. Load-in from 06:00.',
    vendorServices: [
      { id: 1001, service: 'AV & Sound',  description: 'Full PA system, LED walls and professional lighting rig',  budget: 8000, count: 1 },
      { id: 1002, service: 'Catering',    description: 'Cocktail reception and finger food for 300 guests',         budget: 5000, count: 1 },
      { id: 1003, service: 'Photography', description: 'Full-day event photography and post-production',            budget: 2500, count: 1 },
    ],
    vendorAssignments: {
      '1001': [v('vp-1', 7500)],
      '1002': [v('vp-2', 4800)],
      '1003': [],
    },
  },
  {
    id: 'EVT-SG-002',
    name: 'Sentosa F&B Festival 2026',
    date: '2026-07-20',
    from: '12:00',
    to: '22:00',
    location: 'Palawan Beach, Sentosa Island',
    status: 'Critical',
    staffRoles: [
      { id: 201, role: 'Hospitality & F&B Staff', responsibilities: 'Food & beverage service across all vendor booths',     count: 28, rate: 18, hours: 10 },
      { id: 202, role: 'Booth Promoter',           responsibilities: 'Drive foot traffic, engage passers-by, distribute flyers', count: 18, rate: 16, hours: 10 },
      { id: 203, role: 'Security Personnel',        responsibilities: 'Entrance control, crowd safety, lost & found',        count: 10, rate: 22, hours: 10 },
      { id: 204, role: 'Event Coordinator',         responsibilities: 'Vendor relations, stage management, MC liaison',      count: 5,  rate: 40, hours: 10 },
      { id: 205, role: 'Cleanup & Grounds Crew',   responsibilities: 'Waste management, site cleanliness between sessions', count: 6,  rate: 15, hours: 10 },
    ],
    filled: 8,
    total: 67,
    createdAt: Date.now() - 86400000 * 4,
    assignments: {
      '201': [p('sp-6'), p('sp-17'), p('sp-19'), p('sp-23')],
      '202': [p('sp-16'), p('sp-22')],
      '203': [p('sp-20'), p('sp-24')],
      '204': [],
      '205': [],
    },
    notes: 'Outdoor event — tropical heat expected. All staff to bring personal water bottles. Rain contingency: booths move under Palawan Pitstop shelters. Client: Sentosa Development Corporation.',
    vendorServices: [
      { id: 2001, service: 'Entertainment',    description: 'Live band performances and DJ closing set',                             budget: 3500, count: 1  },
      { id: 2002, service: 'Logistics',        description: 'Equipment transport, booth setup and teardown',                         budget: 2000, count: 1  },
      { id: 2003, service: 'Security',         description: 'Crowd control, perimeter security and first aid support',               budget: 4000, count: 1  },
      { id: 2004, service: 'F&B Vendor Booths', description: 'Restaurant & food brand pop-up stalls along Palawan Beach',           budget: 1500, count: 15, type: 'participant' as const },
    ],
    vendorAssignments: {
      '2001': [v('vp-7', 3200)],
      '2002': [],
      '2003': [v('vp-3', 3800)],
      '2004': [
        { id: 'cv-s2-1', company: 'Bite Me SG',          contact: 'Alex Foo',          phone: '8123 4567', service: 'F&B Stall', tier: 'Standard' as const, quote: 1500 },
        { id: 'cv-s2-2', company: 'The Ramen Bar',        contact: 'Yuki Tan',          phone: '8234 5678', service: 'F&B Stall', tier: 'Premium'  as const, quote: 1500 },
        { id: 'cv-s2-3', company: 'Grillhouse Bros.',     contact: 'James Teo',         phone: '8345 6789', service: 'F&B Stall', tier: 'Standard' as const, quote: 1500 },
        { id: 'cv-s2-4', company: 'Bubble Tea Express',   contact: 'Mei Lin',           phone: '8456 7890', service: 'F&B Stall', tier: 'Budget'   as const, quote: 1500 },
        { id: 'cv-s2-5', company: "Mama's Kitchen",       contact: 'Rose Lim',          phone: '8567 8901', service: 'F&B Stall', tier: 'Budget'   as const, quote: 1500 },
      ],
    },
  },
  {
    id: 'EVT-SG-003',
    name: 'Singapore Tech Summit 2026',
    date: '2026-08-05',
    from: '08:00',
    to: '18:30',
    location: 'Suntec Singapore Convention & Exhibition Centre, Hall 403',
    status: 'On Track',
    staffRoles: [
      { id: 301, role: 'Welcome Host & Registration', responsibilities: 'Greeting delegates, badge scanning, directing to halls',       count: 12, rate: 22, hours: 10.5 },
      { id: 302, role: 'AV Technician',               responsibilities: 'Audio-visual setup, live feed monitoring, mic handovers',     count: 6,  rate: 45, hours: 10.5 },
      { id: 303, role: 'Booth Assistant',              responsibilities: 'Assist exhibitors, demo support, visitor guidance',           count: 16, rate: 18, hours: 10.5 },
      { id: 304, role: 'Session Facilitator',          responsibilities: 'Introduce speakers, manage Q&A, timekeeping',                count: 8,  rate: 30, hours: 10.5 },
      { id: 305, role: 'VIP & Speaker Concierge',      responsibilities: 'Escort VIPs, manage green room, speaker briefings',         count: 4,  rate: 42, hours: 10.5 },
    ],
    filled: 46,
    total: 46,
    createdAt: Date.now() - 86400000 * 14,
    assignments: {
      '301': [p('sp-1'), p('sp-3'), p('sp-6'), p('sp-7'), p('sp-10'), p('sp-12'), p('sp-14'), p('sp-17'), p('sp-19'), p('sp-21'), p('sp-23'), p('sp-16')],
      '302': [p('sp-2'), p('sp-4'), p('sp-9'), p('sp-11'), p('sp-13'), p('sp-18')],
      '303': [p('sp-15'), p('sp-20'), p('sp-22'), p('sp-24'), p('sp-8'), p('sp-16'), p('sp-17'), p('sp-19'), p('sp-21'), p('sp-23'), p('sp-6'), p('sp-7'), p('sp-10'), p('sp-12'), p('sp-14'), p('sp-16')],
      '304': [p('sp-1'), p('sp-3'), p('sp-5'), p('sp-4'), p('sp-2'), p('sp-9'), p('sp-11'), p('sp-13')],
      '305': [p('sp-5'), p('sp-4'), p('sp-2'), p('sp-3')],
    },
    notes: 'Keynote: Dr. Lim Boon Keng at 09:00. Media accreditation required for press area. All staff must wear lanyards at all times. No photography of slides without organiser approval. Client: SGTech.',
    vendorServices: [
      { id: 3001, service: 'AV & Sound',  description: 'Hybrid streaming setup, 4K projection and LED stage panels',              budget: 15000, count: 1 },
      { id: 3002, service: 'Catering',    description: 'Buffet lunch and 2 coffee breaks for 400 delegates',                      budget: 8000,  count: 1 },
      { id: 3003, service: 'Photography', description: 'Full-day coverage, speaker portraits and highlight reel edit',             budget: 4000,  count: 1 },
      { id: 3004, service: 'Decoration',  description: 'Stage backdrop, networking lounge décor and floral arrangements',          budget: 3500,  count: 1 },
    ],
    vendorAssignments: {
      '3001': [v('vp-1', 14000)],
      '3002': [v('vp-2', 7800)],
      '3003': [v('vp-5', 3800)],
      '3004': [v('vp-4', 3200)],
    },
  },
  {
    id: 'EVT-SG-004',
    name: 'Clarke Quay Night Bazaar',
    date: '2026-08-16',
    from: '17:00',
    to: '23:30',
    location: 'Clarke Quay Central, River Valley Rd',
    status: 'Planning',
    staffRoles: [
      { id: 401, role: 'Booth & Market Promoter', responsibilities: 'Drive shopper engagement, product sampling and demonstrations', count: 12, rate: 16, hours: 6.5 },
      { id: 402, role: 'Crowd & Traffic Controller', responsibilities: 'Pedestrian flow management, queue management at entry points', count: 6, rate: 18, hours: 6.5 },
      { id: 403, role: 'Emcee / Stage Host',       responsibilities: 'Stage hosting, crowd warm-up, lucky draw MC duties',          count: 2,  rate: 85, hours: 6.5 },
      { id: 404, role: 'Event Runner',              responsibilities: 'Errands, stage setup, props management, runner duties',       count: 4,  rate: 15, hours: 6.5 },
    ],
    filled: 0,
    total: 24,
    createdAt: Date.now() - 86400000 * 2,
    assignments: {},
    notes: 'Night market festive theme. Smart casual attire allowed for promoters. Emcee must be bilingual (English + Mandarin). Client: Clarke Quay Merchants Association.',
    vendorServices: [
      { id: 4001, service: 'Street Food Stalls',        description: 'Local hawker favourites and street food vendors',              budget: 600,  count: 20, type: 'participant' as const },
      { id: 4002, service: 'Retail & Artisan Booths',   description: 'Fashion, arts & crafts, lifestyle and collectible sellers',    budget: 450,  count: 15, type: 'participant' as const },
      { id: 4003, service: 'AV & Stage',                description: 'PA system, stage lighting and LED backdrop for live acts',     budget: 4000, count: 1  },
    ],
    vendorAssignments: {
      '4001': [
        { id: 'cv-cq-1', company: 'Old School Hawker',    contact: 'Uncle Tan',        phone: '9111 2345', service: 'Street Food',   tier: 'Budget'   as const, quote: 600 },
        { id: 'cv-cq-2', company: 'Fusion Street Co.',    contact: 'Ben Lee',           phone: '9222 3456', service: 'Street Food',   tier: 'Standard' as const, quote: 600 },
        { id: 'cv-cq-3', company: 'Satay & Co.',          contact: 'Ahmad Zainal',      phone: '9333 4567', service: 'Street Food',   tier: 'Budget'   as const, quote: 600 },
      ],
      '4002': [
        { id: 'cv-cq-4', company: 'Artisan Collective SG', contact: 'Claire Ng',       phone: '9444 5678', service: 'Retail Booth',  tier: 'Standard' as const, quote: 450 },
        { id: 'cv-cq-5', company: 'The Vintage Trunk',    contact: 'Sam Goh',           phone: '9555 6789', service: 'Retail Booth',  tier: 'Standard' as const, quote: 450 },
      ],
      '4003': [],
    },
  },
  {
    id: 'EVT-SG-005',
    name: 'Gardens by the Bay Corporate Gala',
    date: '2026-09-06',
    from: '18:30',
    to: '23:30',
    location: 'Flower Dome, Gardens by the Bay',
    status: 'Planning',
    staffRoles: [
      { id: 501, role: 'Banquet Waiter',         responsibilities: '3-course plated dinner service, wine and beverage top-ups', count: 20, rate: 20, hours: 5 },
      { id: 502, role: 'Drinks Butler',          responsibilities: 'Welcome drinks on arrival, cocktail hour service',          count: 6,  rate: 20, hours: 5 },
      { id: 503, role: 'Event Manager On-Site',  responsibilities: 'Full floor oversight, client liaison, timeline management', count: 3,  rate: 55, hours: 5 },
      { id: 504, role: 'Concierge & Usher',      responsibilities: 'Guest arrival, seating guidance, cloakroom management',    count: 4,  rate: 22, hours: 5 },
      { id: 505, role: "Photographer's Assistant", responsibilities: 'Equipment handling, backdrop management, guest direction', count: 2,  rate: 30, hours: 5 },
    ],
    filled: 0,
    total: 35,
    createdAt: Date.now() - 86400000 * 1,
    assignments: {},
    notes: 'Black-tie event. Zero phone policy during dinner service — strict enforcement. 280 guests expected. Client: Singapore Business Federation. Floristry theme: tropical orchids.',
    vendorServices: [
      { id: 5001, service: 'Catering',    description: '3-course plated dinner with wine pairing for 280 guests',      budget: 18000, count: 1 },
      { id: 5002, service: 'Decoration',  description: 'Tropical orchid floral centrepieces and stage arrangements',   budget: 6000,  count: 1 },
      { id: 5003, service: 'Photography', description: 'Gala evening photography and same-day highlight video edit',   budget: 5000,  count: 1 },
    ],
    vendorAssignments: {},
  },
]

type EventPatch = Partial<Pick<AppEvent, 'name' | 'date' | 'from' | 'to' | 'location' | 'status' | 'notes'>>

type Ctx = {
  events: AppEvent[]
  staffPool: AssignedPerson[]
  vendorPool: AssignedVendor[]
  addEvent: (e: AppEvent) => void
  updateEvent: (eventId: string, patch: EventPatch) => void
  updateEventRoles: (eventId: string, roles: StaffRole[]) => void
  assignToRole: (eventId: string, roleId: number, person: AssignedPerson) => void
  removeFromRole: (eventId: string, roleId: number, personId: string) => void
  cloneEvent: (eventId: string) => void
  addStaffMember: (person: AssignedPerson) => void
  editStaffMember: (person: AssignedPerson) => void
  removeStaffMember: (personId: string) => void
  addVendorToPool: (vendor: AssignedVendor) => void
  updateEventVendorServices: (eventId: string, services: VendorService[]) => void
  assignVendor: (eventId: string, serviceId: number, vendor: AssignedVendor) => void
  removeVendor: (eventId: string, serviceId: number, vendorId: string) => void
  checkIn: (eventId: string, personId: string) => void
  checkOut: (eventId: string, personId: string) => void
}

const EventsContext = createContext<Ctx>({
  events: [],
  staffPool: [],
  vendorPool: [],
  addEvent: () => {},
  updateEvent: () => {},
  updateEventRoles: () => {},
  assignToRole: () => {},
  removeFromRole: () => {},
  cloneEvent: () => {},
  addStaffMember: () => {},
  editStaffMember: () => {},
  removeStaffMember: () => {},
  addVendorToPool: () => {},
  updateEventVendorServices: () => {},
  assignVendor: () => {},
  removeVendor: () => {},
  checkIn: () => {},
  checkOut: () => {},
})

const LS_KEY         = 'eventos_events'
const LS_STAFF       = 'eventos_staff_pool'
const LS_VENDOR_EXTRA = 'eventos_vendor_pool_extra'
const LS_VERSION     = 'eventos_version'
const DATA_VER       = '6'

function resetStorage() {
  localStorage.setItem(LS_VERSION, DATA_VER)
  localStorage.removeItem(LS_KEY)
  localStorage.removeItem(LS_STAFF)
}

function load(): AppEvent[] {
  try {
    if (localStorage.getItem(LS_VERSION) !== DATA_VER) resetStorage()
    const raw = localStorage.getItem(LS_KEY)
    if (raw) return JSON.parse(raw)
    localStorage.setItem(LS_KEY, JSON.stringify(SAMPLE_EVENTS))
    return SAMPLE_EVENTS
  } catch { return SAMPLE_EVENTS }
}

function save(evts: AppEvent[]) {
  localStorage.setItem(LS_KEY, JSON.stringify(evts))
}

function loadStaff(): AssignedPerson[] {
  try {
    const raw = localStorage.getItem(LS_STAFF)
    return raw ? JSON.parse(raw) : DEFAULT_STAFF_POOL
  } catch { return DEFAULT_STAFF_POOL }
}

function saveStaff(pool: AssignedPerson[]) {
  localStorage.setItem(LS_STAFF, JSON.stringify(pool))
}

function loadVendorExtra(): AssignedVendor[] {
  try { const r = localStorage.getItem(LS_VENDOR_EXTRA); return r ? JSON.parse(r) : [] }
  catch { return [] }
}

function saveVendorExtra(pool: AssignedVendor[]) {
  localStorage.setItem(LS_VENDOR_EXTRA, JSON.stringify(pool))
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
  const [events, setEvents]           = useState<AppEvent[]>(load)
  const [staffPool, setStaffPool]     = useState<AssignedPerson[]>(loadStaff)
  const [vendorExtra, setVendorExtra] = useState<AssignedVendor[]>(loadVendorExtra)

  const vendorPool: AssignedVendor[] = [...VENDOR_POOL, ...vendorExtra]

  const addVendorToPool = (vendor: AssignedVendor) => {
    setVendorExtra(prev => {
      if (prev.some(v => v.id === vendor.id)) return prev
      const next = [...prev, vendor]
      saveVendorExtra(next)
      return next
    })
  }

  const addEvent = (e: AppEvent) => {
    setEvents(prev => { const next = [...prev, e]; save(next); return next })
  }

  const updateEvent = (eventId: string, patch: EventPatch) => {
    setEvents(prev => { const next = prev.map(e => e.id === eventId ? { ...e, ...patch } : e); save(next); return next })
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

  const cloneEvent = (eventId: string) => {
    setEvents(prev => {
      const src = prev.find(e => e.id === eventId)
      if (!src) return prev
      const clone: AppEvent = {
        ...src,
        id: `EVT-${Date.now()}`,
        name: `${src.name} (Copy)`,
        createdAt: Date.now(),
        filled: 0,
        status: 'Planning',
        assignments: {},
      }
      const next = [...prev, clone]
      save(next)
      return next
    })
  }

  const addStaffMember = (person: AssignedPerson) => {
    setStaffPool(prev => { const next = [...prev, person]; saveStaff(next); return next })
  }

  const editStaffMember = (person: AssignedPerson) => {
    setStaffPool(prev => { const next = prev.map(p => p.id === person.id ? person : p); saveStaff(next); return next })
  }

  const removeStaffMember = (personId: string) => {
    setStaffPool(prev => { const next = prev.filter(p => p.id !== personId); saveStaff(next); return next })
  }

  const updateEventVendorServices = (eventId: string, services: VendorService[]) => {
    setEvents(prev => {
      const next = prev.map(e => e.id !== eventId ? e : { ...e, vendorServices: services })
      save(next)
      return next
    })
  }

  const assignVendor = (eventId: string, serviceId: number, vendor: AssignedVendor) => {
    setEvents(prev => {
      const next = prev.map(e => {
        if (e.id !== eventId) return e
        const key = serviceId.toString()
        const existing = e.vendorAssignments?.[key] || []
        if (existing.find(vn => vn.id === vendor.id)) return e
        return { ...e, vendorAssignments: { ...(e.vendorAssignments || {}), [key]: [...existing, vendor] } }
      })
      save(next)
      return next
    })
  }

  const removeVendor = (eventId: string, serviceId: number, vendorId: string) => {
    setEvents(prev => {
      const next = prev.map(e => {
        if (e.id !== eventId) return e
        const key = serviceId.toString()
        return {
          ...e,
          vendorAssignments: {
            ...(e.vendorAssignments || {}),
            [key]: (e.vendorAssignments?.[key] || []).filter(vn => vn.id !== vendorId),
          },
        }
      })
      save(next)
      return next
    })
  }

  const checkIn = (eventId: string, personId: string) => {
    setEvents(prev => {
      const next = prev.map(e => {
        if (e.id !== eventId) return e
        return { ...e, attendance: { ...(e.attendance || {}), [personId]: new Date().toISOString() } }
      })
      save(next)
      return next
    })
  }

  const checkOut = (eventId: string, personId: string) => {
    setEvents(prev => {
      const next = prev.map(e => {
        if (e.id !== eventId) return e
        const attendance = { ...(e.attendance || {}) }
        delete attendance[personId]
        return { ...e, attendance }
      })
      save(next)
      return next
    })
  }

  return (
    <EventsContext.Provider value={{
      events, staffPool, vendorPool,
      addEvent, updateEvent, updateEventRoles,
      assignToRole, removeFromRole, cloneEvent,
      addStaffMember, editStaffMember, removeStaffMember,
      addVendorToPool,
      updateEventVendorServices, assignVendor, removeVendor,
      checkIn, checkOut,
    }}>
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
