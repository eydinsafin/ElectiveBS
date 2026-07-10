import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import {
  ArrowRight, CalendarDays, Users, DollarSign, Building2,
  Check, Eye, EyeOff, ChevronLeft, Lock, LayoutDashboard, Package, Loader2,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import type { StaffSignUpData, VendorSignUpData, StoredAccount } from '../context/AuthContext'
import logo from '../assets/logo.png'

type Screen = 'roles' | 'director' | 'staff' | 'vendor' | 'done'
type Tab    = 'signin' | 'create'
type Tier   = 'Junior' | 'Senior' | 'Expert'

const inp = (err?: string) =>
  `w-full border ${err ? 'border-red-400 ring-2 ring-red-50' : 'border-slate-200'} rounded-xl px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-50 transition-colors bg-white`

const SERVICES = ['AV & Sound','Catering','Photography','Security','Decoration','Entertainment','Logistics','F&B Stall','Retail Booth','Cleaning','Other']

const TIER_DESC: Record<Tier, string> = {
  Junior: 'New to events',
  Senior: '2+ yrs experience',
  Expert: '5+ yrs experience',
}

function ErrorBox({ msg }: { msg: string }) {
  return (
    <div className="flex items-center gap-2 px-3 py-2.5 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
      <span className="w-4 h-4 rounded-full bg-red-500 text-white flex items-center justify-center text-[10px] font-bold shrink-0">!</span>
      {msg}
    </div>
  )
}

export default function LoginOnboarding() {
  const navigate = useNavigate()
  const { user, signIn, createAccount, signInWithEmail, signUpStaff, signUpVendor } = useAuth()

  const [screen, setScreen] = useState<Screen>('roles')
  const [tab, setTab]       = useState<Tab>('signin')
  const [loading, setLoading] = useState(false)

  // Done screen info
  const [doneRole, setDoneRole]     = useState('')
  const [doneName, setDoneName]     = useState('')
  const [doneCompany, setDoneCompany] = useState('')

  // ── Director fields ──────────────────────────────────────────────────
  const [dirAgency, setDirAgency] = useState('')
  const [dirPw, setDirPw]         = useState('')
  const [dirShowPw, setDirShowPw] = useState(false)
  const [dirSiErr, setDirSiErr]   = useState('')
  // Director create
  const [dCaAgency, setDCaAgency]   = useState('')
  const [dCaName, setDCaName]       = useState('')
  const [dCaEmail, setDCaEmail]     = useState('')
  const [dCaPw, setDCaPw]           = useState('')
  const [dCaConfirm, setDCaConfirm] = useState('')
  const [dCaShowPw, setDCaShowPw]   = useState(false)
  const [dCaErrors, setDCaErrors]   = useState<Record<string, string>>({})

  // ── Staff / Vendor shared sign-in fields ─────────────────────────────
  const [siEmail, setSiEmail]   = useState('')
  const [siPw, setSiPw]         = useState('')
  const [siShowPw, setSiShowPw] = useState(false)
  const [siError, setSiError]   = useState('')

  // ── Staff create fields ──────────────────────────────────────────────
  const [stName, setStName]     = useState('')
  const [stPhone, setStPhone]   = useState('')
  const [stEmail, setStEmail]   = useState('')
  const [stTier, setStTier]     = useState<Tier>('Junior')
  const [stPw, setStPw]         = useState('')
  const [stConfirm, setStConfirm] = useState('')
  const [stShowPw, setStShowPw] = useState(false)
  const [stErrors, setStErrors] = useState<Record<string, string>>({})

  // ── Vendor create fields ─────────────────────────────────────────────
  const [vnCompany, setVnCompany]   = useState('')
  const [vnName, setVnName]         = useState('')
  const [vnEmail, setVnEmail]       = useState('')
  const [vnPhone, setVnPhone]       = useState('')
  const [vnService, setVnService]   = useState('')
  const [vnPw, setVnPw]             = useState('')
  const [vnConfirm, setVnConfirm]   = useState('')
  const [vnShowPw, setVnShowPw]     = useState(false)
  const [vnErrors, setVnErrors]     = useState<Record<string, string>>({})

  if (user) return <Navigate to={user.role === 'Director' ? '/director' : user.role === 'Staff' ? '/portal/staff' : '/portal/vendor'} replace />

  const goTo = (s: Screen) => {
    setScreen(s)
    setTab('signin')
    setSiError('')
    setStErrors({})
    setVnErrors({})
  }

  // ── Director sign in ─────────────────────────────────────────────────
  const handleDirSignIn = () => {
    setDirSiErr('')
    if (!dirAgency.trim()) { setDirSiErr('Agency name is required'); return }
    if (!dirPw)            { setDirSiErr('Password is required'); return }
    const res = signIn(dirAgency, dirPw)
    if (res.ok) navigate('/director')
    else setDirSiErr(res.error ?? 'Invalid credentials')
  }

  // ── Director create account ──────────────────────────────────────────
  const handleDirCreate = () => {
    const e: Record<string, string> = {}
    if (!dCaAgency.trim()) e.agency  = 'Agency name is required'
    if (!dCaName.trim())   e.name    = 'Your name is required'
    if (!dCaEmail.trim())  e.email   = 'Email is required'
    if (!dCaPw)            e.pw      = 'Password is required'
    else if (dCaPw.length < 6) e.pw  = 'Minimum 6 characters'
    if (dCaPw !== dCaConfirm)  e.confirm = 'Passwords do not match'
    setDCaErrors(e)
    if (Object.keys(e).length) return
    const res = createAccount({ agency: dCaAgency, name: dCaName, email: dCaEmail, password: dCaPw, role: 'Director' } as StoredAccount)
    if (res.ok) { setDoneRole('Director'); setDoneName(dCaName); setDoneCompany(dCaAgency); setScreen('done') }
    else setDCaErrors({ agency: res.error ?? 'Could not create account' })
  }

  // ── Staff / Vendor sign in (Supabase) ────────────────────────────────
  const handleEmailSignIn = async () => {
    setSiError('')
    if (!siEmail.trim()) { setSiError('Email is required'); return }
    if (!siPw)           { setSiError('Password is required'); return }
    setLoading(true)
    const res = await signInWithEmail(siEmail, siPw)
    setLoading(false)
    if (res.ok) navigate(res.role === 'Staff' ? '/portal/staff' : '/portal/vendor')
    else setSiError(res.error ?? 'Sign in failed')
  }

  // ── Staff create ─────────────────────────────────────────────────────
  const handleStaffCreate = async () => {
    const e: Record<string, string> = {}
    if (!stName.trim())   e.name    = 'Full name is required'
    if (!stEmail.trim())  e.email   = 'Email is required'
    if (!stPw)            e.pw      = 'Password is required'
    else if (stPw.length < 6) e.pw  = 'Minimum 6 characters'
    if (stPw !== stConfirm)   e.confirm = 'Passwords do not match'
    setStErrors(e)
    if (Object.keys(e).length) return
    setLoading(true)
    const res = await signUpStaff({ name: stName, email: stEmail, phone: stPhone, password: stPw, tier: stTier } as StaffSignUpData)
    setLoading(false)
    if (res.ok) { setDoneRole('Staff'); setDoneName(stName); setScreen('done') }
    else setStErrors({ email: res.error ?? 'Sign up failed' })
  }

  // ── Vendor create ────────────────────────────────────────────────────
  const handleVendorCreate = async () => {
    const e: Record<string, string> = {}
    if (!vnCompany.trim()) e.company = 'Company name is required'
    if (!vnName.trim())    e.name    = 'Contact name is required'
    if (!vnEmail.trim())   e.email   = 'Email is required'
    if (!vnService)        e.service = 'Select a service type'
    if (!vnPw)             e.pw      = 'Password is required'
    else if (vnPw.length < 6) e.pw   = 'Minimum 6 characters'
    if (vnPw !== vnConfirm)   e.confirm = 'Passwords do not match'
    setVnErrors(e)
    if (Object.keys(e).length) return
    setLoading(true)
    const res = await signUpVendor({ name: vnName, company: vnCompany, email: vnEmail, phone: vnPhone, password: vnPw, service: vnService } as VendorSignUpData)
    setLoading(false)
    if (res.ok) { setDoneRole('Vendor'); setDoneName(vnName); setDoneCompany(vnCompany); setScreen('done') }
    else setVnErrors({ email: res.error ?? 'Sign up failed' })
  }

  // ── Shared sign-in form (Staff + Vendor) ─────────────────────────────
  const renderEmailSignIn = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Email Address</label>
        <input type="email" value={siEmail} onChange={e => { setSiEmail(e.target.value); setSiError('') }}
          placeholder="you@example.com" className={inp(siError ? 'e' : undefined)}
          onKeyDown={e => e.key === 'Enter' && handleEmailSignIn()} />
      </div>
      <div>
        <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Password</label>
        <div className="relative">
          <input type={siShowPw ? 'text' : 'password'} value={siPw} onChange={e => { setSiPw(e.target.value); setSiError('') }}
            placeholder="Your password" className={`${inp(siError ? 'e' : undefined)} pr-11`}
            onKeyDown={e => e.key === 'Enter' && handleEmailSignIn()} />
          <button type="button" onClick={() => setSiShowPw(v => !v)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
            {siShowPw ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      </div>
      {siError && <ErrorBox msg={siError} />}
      <button onClick={handleEmailSignIn} disabled={loading}
        className="w-full flex items-center justify-center gap-2 py-3 bg-amber-600 text-white rounded-xl text-sm font-bold hover:bg-amber-700 disabled:opacity-60 transition-all shadow-md shadow-amber-600/25 mt-2">
        {loading ? <Loader2 size={15} className="animate-spin" /> : <><span>Sign In</span><ArrowRight size={15} /></>}
      </button>
    </div>
  )

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
      <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-10 bg-white overflow-y-auto">
        <div className="w-full max-w-[440px]">

          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <img src={logo} alt="EventOS" className="w-8 h-8 object-contain" />
            <span className="text-slate-900 text-xl font-bold">EventOS</span>
          </div>

          {/* ── Role selection ──────────────────────────────────────────── */}
          {screen === 'roles' && (
            <>
              <h2 className="text-2xl font-bold text-slate-900 mb-1">Welcome to EventOS</h2>
              <p className="text-slate-500 text-sm mb-8">Select your role to continue</p>
              <div className="space-y-3">
                {[
                  { key: 'director' as Screen, icon: LayoutDashboard, label: 'Director', desc: 'Full platform access for agency directors', color: 'border-amber-400 hover:bg-amber-50', iconColor: 'text-amber-600', bgColor: 'bg-amber-500/10', arrow: 'text-amber-500' },
                  { key: 'staff'    as Screen, icon: Users,           label: 'Staff',    desc: 'Register or sign in as an event staff member',  color: 'border-blue-300 hover:bg-blue-50',  iconColor: 'text-blue-600',  bgColor: 'bg-blue-500/10',  arrow: 'text-blue-400' },
                  { key: 'vendor'   as Screen, icon: Package,         label: 'Vendor',   desc: 'Register or sign in as a vendor or exhibitor',   color: 'border-emerald-300 hover:bg-emerald-50', iconColor: 'text-emerald-600', bgColor: 'bg-emerald-500/10', arrow: 'text-emerald-500' },
                ].map(({ key, icon: Icon, label, desc, color, iconColor, bgColor, arrow }) => (
                  <button key={key} onClick={() => goTo(key)}
                    className={`w-full flex items-center gap-4 p-4 border-2 ${color} rounded-2xl transition-all group text-left`}>
                    <div className={`w-12 h-12 rounded-xl ${bgColor} flex items-center justify-center shrink-0`}>
                      <Icon size={22} className={iconColor} />
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-slate-900 text-sm">{label}</p>
                      <p className="text-slate-500 text-xs mt-0.5">{desc}</p>
                    </div>
                    <ArrowRight size={16} className={`${arrow} group-hover:translate-x-0.5 transition-transform`} />
                  </button>
                ))}
              </div>
            </>
          )}

          {/* ── Director portal ─────────────────────────────────────────── */}
          {screen === 'director' && (
            <>
              <button onClick={() => goTo('roles')} className="flex items-center gap-1.5 text-slate-500 hover:text-slate-800 text-sm font-medium mb-7 transition-colors">
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
              <div className="flex border border-slate-200 rounded-xl p-1 mb-6 bg-slate-50">
                {(['signin', 'create'] as Tab[]).map(t => (
                  <button key={t} onClick={() => { setTab(t); setDirSiErr(''); setDCaErrors({}) }}
                    className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${tab === t ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                    {t === 'signin' ? 'Sign In' : 'Create Account'}
                  </button>
                ))}
              </div>

              {tab === 'signin' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Agency Name</label>
                    <input type="text" value={dirAgency} onChange={e => { setDirAgency(e.target.value); setDirSiErr('') }}
                      placeholder="e.g. OpsRoster" className={inp(dirSiErr ? 'e' : undefined)}
                      onKeyDown={e => e.key === 'Enter' && handleDirSignIn()} />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Password</label>
                    <div className="relative">
                      <input type={dirShowPw ? 'text' : 'password'} value={dirPw} onChange={e => { setDirPw(e.target.value); setDirSiErr('') }}
                        placeholder="Your password" className={`${inp(dirSiErr ? 'e' : undefined)} pr-11`}
                        onKeyDown={e => e.key === 'Enter' && handleDirSignIn()} />
                      <button type="button" onClick={() => setDirShowPw(v => !v)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                        {dirShowPw ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                  {dirSiErr && <ErrorBox msg={dirSiErr} />}
                  <button onClick={handleDirSignIn}
                    className="w-full flex items-center justify-center gap-2 py-3 bg-amber-600 text-white rounded-xl text-sm font-bold hover:bg-amber-700 active:scale-[0.98] transition-all shadow-md shadow-amber-600/25 mt-2">
                    Sign In <ArrowRight size={15} />
                  </button>
                  <p className="text-center text-[11px] text-slate-400 pt-1">
                    Demo: <span className="font-semibold text-slate-600">OpsRoster</span> / <span className="font-semibold text-slate-600">Safin001</span>
                  </p>
                </div>
              )}

              {tab === 'create' && (
                <div className="space-y-4">
                  {[
                    { label: 'Agency Name', value: dCaAgency, set: setDCaAgency, key: 'agency', ph: 'e.g. Pinnacle Events' },
                    { label: 'Your Full Name', value: dCaName, set: setDCaName, key: 'name', ph: 'e.g. Jamie Tan' },
                    { label: 'Email Address', value: dCaEmail, set: setDCaEmail, key: 'email', ph: 'you@agency.com', type: 'email' },
                  ].map(({ label, value, set, key, ph, type }) => (
                    <div key={key}>
                      <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">{label}</label>
                      <input type={type ?? 'text'} value={value} onChange={e => { set(e.target.value); setDCaErrors({}) }}
                        placeholder={ph} className={inp(dCaErrors[key])} />
                      {dCaErrors[key] && <p className="text-xs text-red-500 mt-1.5">{dCaErrors[key]}</p>}
                    </div>
                  ))}
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Password</label>
                    <div className="relative">
                      <input type={dCaShowPw ? 'text' : 'password'} value={dCaPw} onChange={e => { setDCaPw(e.target.value); setDCaErrors({}) }}
                        placeholder="Min. 6 characters" className={`${inp(dCaErrors.pw)} pr-11`} />
                      <button type="button" onClick={() => setDCaShowPw(v => !v)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                        {dCaShowPw ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    {dCaErrors.pw && <p className="text-xs text-red-500 mt-1.5">{dCaErrors.pw}</p>}
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Confirm Password</label>
                    <input type={dCaShowPw ? 'text' : 'password'} value={dCaConfirm} onChange={e => { setDCaConfirm(e.target.value); setDCaErrors({}) }}
                      placeholder="Re-enter password" className={inp(dCaErrors.confirm)} />
                    {dCaErrors.confirm && <p className="text-xs text-red-500 mt-1.5">{dCaErrors.confirm}</p>}
                  </div>
                  <button onClick={handleDirCreate}
                    className="w-full flex items-center justify-center gap-2 py-3 bg-amber-600 text-white rounded-xl text-sm font-bold hover:bg-amber-700 active:scale-[0.98] transition-all shadow-md shadow-amber-600/25">
                    Create Account <ArrowRight size={15} />
                  </button>
                </div>
              )}
            </>
          )}

          {/* ── Staff portal ────────────────────────────────────────────── */}
          {screen === 'staff' && (
            <>
              <button onClick={() => goTo('roles')} className="flex items-center gap-1.5 text-slate-500 hover:text-slate-800 text-sm font-medium mb-7 transition-colors">
                <ChevronLeft size={16} /> Back
              </button>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0">
                  <Users size={18} className="text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900 leading-tight">Staff Portal</h2>
                  <p className="text-slate-500 text-xs">Create your staff profile or sign in</p>
                </div>
              </div>
              <div className="flex border border-slate-200 rounded-xl p-1 mb-6 bg-slate-50">
                {(['signin', 'create'] as Tab[]).map(t => (
                  <button key={t} onClick={() => { setTab(t); setSiError(''); setStErrors({}) }}
                    className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${tab === t ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                    {t === 'signin' ? 'Sign In' : 'Create Account'}
                  </button>
                ))}
              </div>

              {tab === 'signin' && renderEmailSignIn()}

              {tab === 'create' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Full Name</label>
                      <input type="text" value={stName} onChange={e => { setStName(e.target.value); setStErrors({}) }}
                        placeholder="Your name" className={inp(stErrors.name)} />
                      {stErrors.name && <p className="text-xs text-red-500 mt-1">{stErrors.name}</p>}
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Phone</label>
                      <input type="tel" value={stPhone} onChange={e => setStPhone(e.target.value)}
                        placeholder="e.g. 9123 4567" className={inp()} />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Email Address</label>
                    <input type="email" value={stEmail} onChange={e => { setStEmail(e.target.value); setStErrors({}) }}
                      placeholder="you@example.com" className={inp(stErrors.email)} />
                    {stErrors.email && <p className="text-xs text-red-500 mt-1">{stErrors.email}</p>}
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Experience Level</label>
                    <div className="grid grid-cols-3 gap-2">
                      {(['Junior', 'Senior', 'Expert'] as Tier[]).map(t => (
                        <button key={t} type="button" onClick={() => setStTier(t)}
                          className={`p-3 rounded-xl border-2 text-center transition-all ${stTier === t ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:border-slate-300'}`}>
                          <p className={`text-sm font-bold ${stTier === t ? 'text-blue-700' : 'text-slate-700'}`}>{t}</p>
                          <p className={`text-[10px] mt-0.5 ${stTier === t ? 'text-blue-500' : 'text-slate-400'}`}>{TIER_DESC[t]}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Password</label>
                    <div className="relative">
                      <input type={stShowPw ? 'text' : 'password'} value={stPw} onChange={e => { setStPw(e.target.value); setStErrors({}) }}
                        placeholder="Min. 6 characters" className={`${inp(stErrors.pw)} pr-11`} />
                      <button type="button" onClick={() => setStShowPw(v => !v)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                        {stShowPw ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    {stErrors.pw && <p className="text-xs text-red-500 mt-1">{stErrors.pw}</p>}
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Confirm Password</label>
                    <input type={stShowPw ? 'text' : 'password'} value={stConfirm} onChange={e => { setStConfirm(e.target.value); setStErrors({}) }}
                      placeholder="Re-enter password" className={inp(stErrors.confirm)} />
                    {stErrors.confirm && <p className="text-xs text-red-500 mt-1">{stErrors.confirm}</p>}
                  </div>
                  <button onClick={handleStaffCreate} disabled={loading}
                    className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 disabled:opacity-60 transition-all shadow-md shadow-blue-600/25">
                    {loading ? <Loader2 size={15} className="animate-spin" /> : <><span>Create Staff Account</span><ArrowRight size={15} /></>}
                  </button>
                </div>
              )}
            </>
          )}

          {/* ── Vendor portal ───────────────────────────────────────────── */}
          {screen === 'vendor' && (
            <>
              <button onClick={() => goTo('roles')} className="flex items-center gap-1.5 text-slate-500 hover:text-slate-800 text-sm font-medium mb-7 transition-colors">
                <ChevronLeft size={16} /> Back
              </button>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0">
                  <Package size={18} className="text-emerald-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900 leading-tight">Vendor Portal</h2>
                  <p className="text-slate-500 text-xs">Register your business or sign in</p>
                </div>
              </div>
              <div className="flex border border-slate-200 rounded-xl p-1 mb-6 bg-slate-50">
                {(['signin', 'create'] as Tab[]).map(t => (
                  <button key={t} onClick={() => { setTab(t); setSiError(''); setVnErrors({}) }}
                    className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${tab === t ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                    {t === 'signin' ? 'Sign In' : 'Register Business'}
                  </button>
                ))}
              </div>

              {tab === 'signin' && renderEmailSignIn()}

              {tab === 'create' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Company Name</label>
                      <input type="text" value={vnCompany} onChange={e => { setVnCompany(e.target.value); setVnErrors({}) }}
                        placeholder="e.g. Pro AV Solutions" className={inp(vnErrors.company)} />
                      {vnErrors.company && <p className="text-xs text-red-500 mt-1">{vnErrors.company}</p>}
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Contact Person</label>
                      <input type="text" value={vnName} onChange={e => { setVnName(e.target.value); setVnErrors({}) }}
                        placeholder="Your name" className={inp(vnErrors.name)} />
                      {vnErrors.name && <p className="text-xs text-red-500 mt-1">{vnErrors.name}</p>}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Email</label>
                      <input type="email" value={vnEmail} onChange={e => { setVnEmail(e.target.value); setVnErrors({}) }}
                        placeholder="you@company.com" className={inp(vnErrors.email)} />
                      {vnErrors.email && <p className="text-xs text-red-500 mt-1">{vnErrors.email}</p>}
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Phone</label>
                      <input type="tel" value={vnPhone} onChange={e => setVnPhone(e.target.value)}
                        placeholder="e.g. 8111 2233" className={inp()} />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Primary Service</label>
                    <select value={vnService} onChange={e => { setVnService(e.target.value); setVnErrors({}) }}
                      className={`${inp(vnErrors.service)} appearance-none`}>
                      <option value="">Select service type...</option>
                      {SERVICES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    {vnErrors.service && <p className="text-xs text-red-500 mt-1">{vnErrors.service}</p>}
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Password</label>
                    <div className="relative">
                      <input type={vnShowPw ? 'text' : 'password'} value={vnPw} onChange={e => { setVnPw(e.target.value); setVnErrors({}) }}
                        placeholder="Min. 6 characters" className={`${inp(vnErrors.pw)} pr-11`} />
                      <button type="button" onClick={() => setVnShowPw(v => !v)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                        {vnShowPw ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    {vnErrors.pw && <p className="text-xs text-red-500 mt-1">{vnErrors.pw}</p>}
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Confirm Password</label>
                    <input type={vnShowPw ? 'text' : 'password'} value={vnConfirm} onChange={e => { setVnConfirm(e.target.value); setVnErrors({}) }}
                      placeholder="Re-enter password" className={inp(vnErrors.confirm)} />
                    {vnErrors.confirm && <p className="text-xs text-red-500 mt-1">{vnErrors.confirm}</p>}
                  </div>
                  <button onClick={handleVendorCreate} disabled={loading}
                    className="w-full flex items-center justify-center gap-2 py-3 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-700 disabled:opacity-60 transition-all shadow-md shadow-emerald-600/25">
                    {loading ? <Loader2 size={15} className="animate-spin" /> : <><span>Register Business</span><ArrowRight size={15} /></>}
                  </button>
                </div>
              )}
            </>
          )}

          {/* ── Done / Welcome ──────────────────────────────────────────── */}
          {screen === 'done' && (
            <>
              <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center mb-6">
                <Check size={28} className="text-emerald-600" strokeWidth={2.5} />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-1">
                {doneRole === 'Director' ? 'You\'re all set!' : 'Account created!'}
              </h2>
              <p className="text-slate-500 text-sm mb-7">
                {doneRole === 'Director'
                  ? 'Your EventOS director account has been created'
                  : doneRole === 'Staff'
                  ? 'Your staff profile is now visible to event directors'
                  : 'Your vendor profile is now discoverable by directors'}
              </p>
              <div className="bg-slate-50 rounded-2xl p-5 space-y-3.5 mb-7">
                {doneName && (
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">{doneRole === 'Vendor' ? 'Contact' : 'Name'}</span>
                    <span className="text-sm font-semibold text-slate-900">{doneName}</span>
                  </div>
                )}
                {doneCompany && (
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">{doneRole === 'Director' ? 'Agency' : 'Company'}</span>
                    <span className="text-sm font-semibold text-slate-900">{doneCompany}</span>
                  </div>
                )}
                <div className="flex items-center justify-between pt-1 border-t border-slate-200">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Role</span>
                  <span className={`text-sm font-bold flex items-center gap-1 ${doneRole === 'Director' ? 'text-amber-700' : doneRole === 'Staff' ? 'text-blue-700' : 'text-emerald-700'}`}>
                    {doneRole === 'Director' ? <><Lock size={11} /> Director</> : doneRole}
                  </span>
                </div>
              </div>
              <button
                onClick={() => navigate(doneRole === 'Director' ? '/director' : doneRole === 'Staff' ? '/portal/staff' : '/portal/vendor')}
                className={`w-full flex items-center justify-center gap-2 py-3 text-white rounded-xl text-sm font-bold active:scale-[0.98] transition-all shadow-md ${
                  doneRole === 'Director' ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-600/25' :
                  doneRole === 'Staff'    ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/25' :
                                           'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/25'
                }`}
              >
                {doneRole === 'Director' ? 'Enter Director View' : 'Go to Dashboard'} <ArrowRight size={15} />
              </button>
            </>
          )}

        </div>
      </div>
    </div>
  )
}
