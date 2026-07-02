import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import {
  ArrowRight, CalendarDays, Users, DollarSign, Building2,
  Check, Eye, EyeOff, ChevronLeft, Lock, LayoutDashboard, Package,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import logo from '../assets/logo.png'

type Screen = 'roles' | 'director' | 'done'
type Tab    = 'signin' | 'create'

const input = (err?: string) =>
  `w-full border ${err ? 'border-red-400 ring-2 ring-red-50' : 'border-slate-200'} rounded-xl px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-50 transition-colors bg-white`

export default function LoginOnboarding() {
  const navigate = useNavigate()
  const { user, signIn, createAccount } = useAuth()

  const [screen, setScreen] = useState<Screen>('roles')
  const [tab, setTab]       = useState<Tab>('signin')

  // Sign-in fields
  const [siAgency, setSiAgency]   = useState('')
  const [siPw, setSiPw]           = useState('')
  const [siShowPw, setSiShowPw]   = useState(false)
  const [siError, setSiError]     = useState('')

  // Create account fields
  const [caAgency, setCaAgency]   = useState('')
  const [caName, setCaName]       = useState('')
  const [caEmail, setCaEmail]     = useState('')
  const [caPw, setCaPw]           = useState('')
  const [caConfirm, setCaConfirm] = useState('')
  const [caShowPw, setCaShowPw]   = useState(false)
  const [caErrors, setCaErrors]   = useState<Record<string, string>>({})

  // Created-account info for welcome screen
  const [createdAgency, setCreatedAgency] = useState('')
  const [createdName, setCreatedName]     = useState('')

  if (user) return <Navigate to="/director" replace />

  // ── Sign In ──────────────────────────────────────────────────────────────
  const handleSignIn = () => {
    setSiError('')
    if (!siAgency.trim()) { setSiError('Agency name is required'); return }
    if (!siPw)            { setSiError('Password is required'); return }
    const result = signIn(siAgency, siPw)
    if (result.ok) {
      navigate('/director')
    } else {
      setSiError(result.error ?? 'Invalid credentials')
    }
  }

  // ── Create Account ───────────────────────────────────────────────────────
  const handleCreate = () => {
    const e: Record<string, string> = {}
    if (!caAgency.trim())       e.agency   = 'Agency name is required'
    if (!caName.trim())         e.name     = 'Your name is required'
    if (!caEmail.trim())        e.email    = 'Email is required'
    if (!caPw)                  e.pw       = 'Password is required'
    else if (caPw.length < 6)   e.pw       = 'Minimum 6 characters'
    if (caPw !== caConfirm)     e.confirm  = 'Passwords do not match'
    setCaErrors(e)
    if (Object.keys(e).length > 0) return

    const result = createAccount({
      agency:   caAgency,
      name:     caName,
      email:    caEmail,
      password: caPw,
      role:     'Director',
    })
    if (result.ok) {
      setCreatedAgency(caAgency.trim())
      setCreatedName(caName.trim())
      setScreen('done')
    } else {
      setCaErrors({ agency: result.error ?? 'Could not create account' })
    }
  }

  return (
    <div className="min-h-screen flex">

      {/* ── Left branding panel ─────────────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-[52%] bg-gradient-to-br from-[#0d1117] via-slate-900 to-[#111827] p-10 xl:p-14 flex-col justify-between">
        <div className="flex items-center gap-3">
          <img src={logo} alt="EventOS" className="w-9 h-9 object-contain" />
          <span className="text-white text-xl font-bold tracking-tight">EventOS</span>
        </div>

        <div>
          <h1 className="text-4xl xl:text-5xl font-bold text-white leading-[1.15] mb-5">
            The agency-grade<br />
            <span className="text-amber-400">event operations</span><br />
            platform.
          </h1>
          <p className="text-slate-400 text-lg mb-10 leading-relaxed">
            Manage events, staff, vendors and payroll — all from one Director View.
          </p>

          <div className="space-y-5">
            {[
              { icon: CalendarDays, title: 'Live Event Monitoring',  desc: 'Real-time staffing status across all events' },
              { icon: Users,        title: 'Staff Management',        desc: 'Assign roles, track headcount and availability' },
              { icon: DollarSign,   title: 'Payroll Processing',      desc: 'Approve invoices and process payments instantly' },
              { icon: Building2,    title: 'Vendor Management',       desc: 'Book service providers and booth exhibitors' },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0 mt-0.5">
                  <Icon size={18} className="text-amber-400" />
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">{title}</p>
                  <p className="text-slate-500 text-sm mt-0.5">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-white/8 pt-6">
          <p className="text-slate-400 text-sm italic leading-relaxed">
            "EventOS cut our event setup time in half. Our team now manages 10 events simultaneously with full visibility."
          </p>
          <p className="text-slate-600 text-xs mt-2">— Agency Director, Singapore</p>
        </div>
      </div>

      {/* ── Right form panel ────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-10 bg-white">
        <div className="w-full max-w-[440px]">

          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <img src={logo} alt="EventOS" className="w-8 h-8 object-contain" />
            <span className="text-slate-900 text-xl font-bold">EventOS</span>
          </div>

          {/* ── Screen: Role selection ──────────────────────────────────── */}
          {screen === 'roles' && (
            <>
              <h2 className="text-2xl font-bold text-slate-900 mb-1">Welcome to EventOS</h2>
              <p className="text-slate-500 text-sm mb-8">Select your role to continue</p>

              <div className="space-y-3">
                {/* Director — active */}
                <button
                  onClick={() => setScreen('director')}
                  className="w-full flex items-center gap-4 p-4 border-2 border-amber-400 rounded-2xl hover:bg-amber-50 transition-all group text-left"
                >
                  <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0">
                    <LayoutDashboard size={22} className="text-amber-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-slate-900 text-sm">Director</p>
                    <p className="text-slate-500 text-xs mt-0.5">Full platform access for agency directors</p>
                  </div>
                  <ArrowRight size={16} className="text-amber-500 group-hover:translate-x-0.5 transition-transform" />
                </button>

                {/* Staff — coming soon */}
                <div className="w-full flex items-center gap-4 p-4 border-2 border-slate-100 rounded-2xl opacity-50 cursor-not-allowed">
                  <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                    <Users size={22} className="text-slate-400" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-slate-700 text-sm">Staff</p>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-slate-200 text-slate-500 uppercase tracking-wider">Coming Soon</span>
                    </div>
                    <p className="text-slate-400 text-xs mt-0.5">Manage your schedule and event bookings</p>
                  </div>
                  <Lock size={15} className="text-slate-300" />
                </div>

                {/* Vendor — coming soon */}
                <div className="w-full flex items-center gap-4 p-4 border-2 border-slate-100 rounded-2xl opacity-50 cursor-not-allowed">
                  <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                    <Package size={22} className="text-slate-400" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-slate-700 text-sm">Vendor</p>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-slate-200 text-slate-500 uppercase tracking-wider">Coming Soon</span>
                    </div>
                    <p className="text-slate-400 text-xs mt-0.5">Join events as a vendor or booth exhibitor</p>
                  </div>
                  <Lock size={15} className="text-slate-300" />
                </div>
              </div>
            </>
          )}

          {/* ── Screen: Director access ─────────────────────────────────── */}
          {screen === 'director' && (
            <>
              {/* Back */}
              <button
                onClick={() => { setScreen('roles'); setSiError(''); setCaErrors({}) }}
                className="flex items-center gap-1.5 text-slate-500 hover:text-slate-800 text-sm font-medium mb-7 transition-colors"
              >
                <ChevronLeft size={16} /> Back
              </button>

              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0">
                  <LayoutDashboard size={18} className="text-amber-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900 leading-tight">Director Access</h2>
                  <p className="text-slate-500 text-xs">Sign in or create a new agency account</p>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex border border-slate-200 rounded-xl p-1 mb-6 bg-slate-50">
                {(['signin', 'create'] as Tab[]).map(t => (
                  <button
                    key={t}
                    onClick={() => { setTab(t); setSiError(''); setCaErrors({}) }}
                    className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
                      tab === t
                        ? 'bg-white text-slate-900 shadow-sm'
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    {t === 'signin' ? 'Sign In' : 'Create Account'}
                  </button>
                ))}
              </div>

              {/* Sign In form */}
              {tab === 'signin' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                      Agency Name
                    </label>
                    <input
                      type="text"
                      value={siAgency}
                      onChange={e => { setSiAgency(e.target.value); setSiError('') }}
                      placeholder="e.g. OpsRoster"
                      className={input(siError ? 'err' : undefined)}
                      onKeyDown={e => e.key === 'Enter' && handleSignIn()}
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        type={siShowPw ? 'text' : 'password'}
                        value={siPw}
                        onChange={e => { setSiPw(e.target.value); setSiError('') }}
                        placeholder="Your password"
                        className={`${input(siError ? 'err' : undefined)} pr-11`}
                        onKeyDown={e => e.key === 'Enter' && handleSignIn()}
                      />
                      <button
                        type="button"
                        onClick={() => setSiShowPw(v => !v)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                      >
                        {siShowPw ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  {siError && (
                    <div className="flex items-center gap-2 px-3 py-2.5 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
                      <span className="w-4 h-4 rounded-full bg-red-500 text-white flex items-center justify-center text-[10px] font-bold shrink-0">!</span>
                      {siError}
                    </div>
                  )}

                  <button
                    onClick={handleSignIn}
                    className="w-full flex items-center justify-center gap-2 py-3 bg-amber-600 text-white rounded-xl text-sm font-bold hover:bg-amber-700 active:scale-[0.98] transition-all shadow-md shadow-amber-600/25 mt-2"
                  >
                    Sign In <ArrowRight size={15} />
                  </button>

                  <p className="text-center text-[11px] text-slate-400 pt-1">
                    Demo credentials: <span className="font-semibold text-slate-600">OpsRoster</span> / <span className="font-semibold text-slate-600">Safin001</span>
                  </p>
                </div>
              )}

              {/* Create Account form */}
              {tab === 'create' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Agency Name</label>
                    <input
                      type="text"
                      value={caAgency}
                      onChange={e => { setCaAgency(e.target.value); setCaErrors({}) }}
                      placeholder="e.g. Pinnacle Events"
                      className={input(caErrors.agency)}
                    />
                    {caErrors.agency && <p className="text-xs text-red-500 mt-1.5">{caErrors.agency}</p>}
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Your Full Name</label>
                    <input
                      type="text"
                      value={caName}
                      onChange={e => { setCaName(e.target.value); setCaErrors({}) }}
                      placeholder="e.g. Jamie Tan"
                      className={input(caErrors.name)}
                    />
                    {caErrors.name && <p className="text-xs text-red-500 mt-1.5">{caErrors.name}</p>}
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Email Address</label>
                    <input
                      type="email"
                      value={caEmail}
                      onChange={e => { setCaEmail(e.target.value); setCaErrors({}) }}
                      placeholder="you@agency.com"
                      className={input(caErrors.email)}
                    />
                    {caErrors.email && <p className="text-xs text-red-500 mt-1.5">{caErrors.email}</p>}
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Password</label>
                    <div className="relative">
                      <input
                        type={caShowPw ? 'text' : 'password'}
                        value={caPw}
                        onChange={e => { setCaPw(e.target.value); setCaErrors({}) }}
                        placeholder="Min. 6 characters"
                        className={`${input(caErrors.pw)} pr-11`}
                      />
                      <button
                        type="button"
                        onClick={() => setCaShowPw(v => !v)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                      >
                        {caShowPw ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    {caErrors.pw && <p className="text-xs text-red-500 mt-1.5">{caErrors.pw}</p>}
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Confirm Password</label>
                    <input
                      type={caShowPw ? 'text' : 'password'}
                      value={caConfirm}
                      onChange={e => { setCaConfirm(e.target.value); setCaErrors({}) }}
                      placeholder="Re-enter password"
                      className={input(caErrors.confirm)}
                    />
                    {caErrors.confirm && <p className="text-xs text-red-500 mt-1.5">{caErrors.confirm}</p>}
                  </div>

                  <button
                    onClick={handleCreate}
                    className="w-full flex items-center justify-center gap-2 py-3 bg-amber-600 text-white rounded-xl text-sm font-bold hover:bg-amber-700 active:scale-[0.98] transition-all shadow-md shadow-amber-600/25 mt-2"
                  >
                    Create Account <ArrowRight size={15} />
                  </button>
                </div>
              )}
            </>
          )}

          {/* ── Screen: Done / Welcome ──────────────────────────────────── */}
          {screen === 'done' && (
            <>
              <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center mb-6">
                <Check size={28} className="text-emerald-600" strokeWidth={2.5} />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-1">You're all set!</h2>
              <p className="text-slate-500 text-sm mb-7">Your EventOS director account has been created</p>

              <div className="bg-slate-50 rounded-2xl p-5 space-y-3.5 mb-7">
                {[
                  { label: 'Agency',   value: createdAgency },
                  { label: 'Director', value: createdName },
                ].map(({ label, value }) => (
                  <div key={label} className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">{label}</span>
                    <span className="text-sm font-semibold text-slate-900">{value}</span>
                  </div>
                ))}
                <div className="flex items-center justify-between pt-1 border-t border-slate-200">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Access Level</span>
                  <span className="text-sm font-bold text-amber-700 flex items-center gap-1">
                    <Lock size={11} /> Director · Full Access
                  </span>
                </div>
              </div>

              <button
                onClick={() => navigate('/director')}
                className="w-full flex items-center justify-center gap-2 py-3 bg-amber-600 text-white rounded-xl text-sm font-bold hover:bg-amber-700 active:scale-[0.98] transition-all shadow-md shadow-amber-600/25"
              >
                Enter Director View <ArrowRight size={15} />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
