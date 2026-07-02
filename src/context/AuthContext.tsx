import { createContext, useContext, useState, ReactNode } from 'react'

export type AuthUser = {
  name: string
  agency: string
  email: string
  role: 'Director'
}

export type StoredAccount = AuthUser & { password: string }

// Pre-seeded director — always available, not stored in localStorage
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
  logout: () => void
  signIn: (agency: string, password: string) => { ok: boolean; error?: string }
  createAccount: (account: StoredAccount) => { ok: boolean; error?: string }
}

const AuthContext = createContext<AuthCtx>({
  user: null,
  logout: () => {},
  signIn: () => ({ ok: false }),
  createAccount: () => ({ ok: false }),
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
  const [user, setUser]       = useState<AuthUser | null>(() => {
    try { const r = localStorage.getItem(LS_USER); return r ? JSON.parse(r) : null }
    catch { return null }
  })
  const [accounts, setAccounts] = useState<StoredAccount[]>(loadAccounts)

  const persist = (u: AuthUser) => {
    localStorage.setItem(LS_USER, JSON.stringify(u))
    setUser(u)
  }

  const logout = () => {
    localStorage.removeItem(LS_USER)
    setUser(null)
  }

  const signIn = (agency: string, password: string) => {
    const all   = [...DEFAULT_ACCOUNTS, ...accounts]
    const match = all.find(
      a => a.agency.toLowerCase() === agency.trim().toLowerCase() && a.password === password
    )
    if (!match) return { ok: false, error: 'Invalid agency name or password' }
    persist({ name: match.name, agency: match.agency, email: match.email, role: match.role })
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
    persist({ name: account.name, agency: account.agency.trim(), email: account.email, role: account.role })
    return { ok: true }
  }

  return (
    <AuthContext.Provider value={{ user, logout, signIn, createAccount }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
