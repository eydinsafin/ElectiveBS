import { createContext, useContext, useState, ReactNode } from 'react'
import { supabase } from '../lib/supabase'

export type AuthUser = {
  id?: string           // Supabase UUID (Staff / Vendor only)
  name: string
  email: string
  role: 'Director' | 'Staff' | 'Vendor'
  // Director
  agency?: string
  // Staff
  tier?: 'Expert' | 'Senior' | 'Junior'
  phone?: string
  // Vendor
  company?: string
  service?: string
}

// Director-only local account record
export type StoredAccount = {
  agency: string
  name: string
  email: string
  password: string
  role: 'Director'
}

export type StaffSignUpData = {
  name: string
  email: string
  phone: string
  password: string
  tier: 'Expert' | 'Senior' | 'Junior'
}

export type VendorSignUpData = {
  name: string
  company: string
  email: string
  phone: string
  password: string
  service: string
}

const DEFAULT_ACCOUNTS: StoredAccount[] = [
  {
    agency:   'OpsRoster',
    name:     'Darren Ong Wei Kiat',
    email:    'darren@opsroster.sg',
    password: 'Safin001',
    role:     'Director',
  },
]

type AuthCtx = {
  user: AuthUser | null
  logout: () => Promise<void>
  // Director (local)
  signIn: (agency: string, password: string) => { ok: boolean; error?: string }
  createAccount: (account: StoredAccount) => { ok: boolean; error?: string }
  // Staff / Vendor (Supabase)
  signInWithEmail: (email: string, password: string) => Promise<{ ok: boolean; error?: string; role?: 'Staff' | 'Vendor' }>
  signUpStaff: (data: StaffSignUpData) => Promise<{ ok: boolean; error?: string }>
  signUpVendor: (data: VendorSignUpData) => Promise<{ ok: boolean; error?: string }>
}

const AuthContext = createContext<AuthCtx>({
  user: null,
  logout: async () => {},
  signIn: () => ({ ok: false }),
  createAccount: () => ({ ok: false }),
  signInWithEmail: async () => ({ ok: false }),
  signUpStaff:    async () => ({ ok: false }),
  signUpVendor:   async () => ({ ok: false }),
})

const LS_USER     = 'eventos_auth_user'
const LS_ACCOUNTS = 'eventos_accounts'

function loadAccounts(): StoredAccount[] {
  try {
    const raw = localStorage.getItem(LS_ACCOUNTS)
    return raw ? JSON.parse(raw) : []
  } catch { return [] }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser]         = useState<AuthUser | null>(() => {
    try { const r = localStorage.getItem(LS_USER); return r ? JSON.parse(r) : null }
    catch { return null }
  })
  const [accounts, setAccounts] = useState<StoredAccount[]>(loadAccounts)

  const persist = (u: AuthUser) => {
    localStorage.setItem(LS_USER, JSON.stringify(u))
    setUser(u)
  }

  const logout = async () => {
    if (user?.role !== 'Director') await supabase.auth.signOut()
    localStorage.removeItem(LS_USER)
    setUser(null)
  }

  // ── Director local auth ────────────────────────────────────────────────
  const signIn = (agency: string, password: string) => {
    const all   = [...DEFAULT_ACCOUNTS, ...accounts]
    const match = all.find(
      a => a.agency.toLowerCase() === agency.trim().toLowerCase() && a.password === password
    )
    if (!match) return { ok: false, error: 'Invalid agency name or password' }
    persist({ name: match.name, agency: match.agency, email: match.email, role: 'Director' })
    return { ok: true }
  }

  const createAccount = (account: StoredAccount) => {
    const all = [...DEFAULT_ACCOUNTS, ...accounts]
    if (all.find(a => a.agency.toLowerCase() === account.agency.trim().toLowerCase())) {
      return { ok: false, error: 'An account for this agency already exists' }
    }
    const next = [...accounts, { ...account, agency: account.agency.trim() }]
    localStorage.setItem(LS_ACCOUNTS, JSON.stringify(next))
    setAccounts(next)
    persist({ name: account.name, agency: account.agency.trim(), email: account.email, role: 'Director' })
    return { ok: true }
  }

  // ── Staff / Vendor Supabase auth ────────────────────────────────────────
  const signInWithEmail = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) return { ok: false, error: error.message }

    const { data: profile, error: pErr } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single()
    if (pErr || !profile) return { ok: false, error: 'Profile not found — please create an account first.' }

    persist({
      id:      profile.id,
      name:    profile.name,
      email:   profile.email,
      role:    profile.role,
      tier:    profile.tier    ?? undefined,
      phone:   profile.phone   ?? undefined,
      company: profile.company ?? undefined,
      service: profile.service ?? undefined,
    })
    return { ok: true, role: profile.role as 'Staff' | 'Vendor' }
  }

  const signUpStaff = async (data: StaffSignUpData) => {
    const { data: authData, error } = await supabase.auth.signUp({
      email:    data.email,
      password: data.password,
    })
    if (error) return { ok: false, error: error.message }
    if (!authData.user) return { ok: false, error: 'Sign up failed — please try again.' }

    const { error: pErr } = await supabase.from('profiles').insert({
      id:    authData.user.id,
      name:  data.name.trim(),
      email: data.email.trim(),
      phone: data.phone.trim(),
      role:  'Staff',
      tier:  data.tier,
    })
    if (pErr) return { ok: false, error: pErr.message }

    persist({ id: authData.user.id, name: data.name.trim(), email: data.email.trim(), role: 'Staff', tier: data.tier, phone: data.phone.trim() })
    return { ok: true }
  }

  const signUpVendor = async (data: VendorSignUpData) => {
    const { data: authData, error } = await supabase.auth.signUp({
      email:    data.email,
      password: data.password,
    })
    if (error) return { ok: false, error: error.message }
    if (!authData.user) return { ok: false, error: 'Sign up failed — please try again.' }

    const { error: pErr } = await supabase.from('profiles').insert({
      id:      authData.user.id,
      name:    data.name.trim(),
      email:   data.email.trim(),
      phone:   data.phone.trim(),
      role:    'Vendor',
      company: data.company.trim(),
      service: data.service.trim(),
    })
    if (pErr) return { ok: false, error: pErr.message }

    persist({ id: authData.user.id, name: data.name.trim(), email: data.email.trim(), role: 'Vendor', company: data.company.trim(), service: data.service.trim(), phone: data.phone.trim() })
    return { ok: true }
  }

  return (
    <AuthContext.Provider value={{
      user, logout, signIn, createAccount,
      signInWithEmail, signUpStaff, signUpVendor,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
