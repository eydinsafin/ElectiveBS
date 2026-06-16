import { useState } from 'react'
import { ReactNode } from 'react'
import { Menu } from 'lucide-react'
import Sidebar from './Sidebar'
import Avatar from './Avatar'

export default function Layout({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <Sidebar open={open} onClose={() => setOpen(false)} />

      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        {/* Mobile top bar */}
        <header className="lg:hidden h-14 shrink-0 flex items-center justify-between px-4 bg-white border-b border-slate-200">
          <button
            onClick={() => setOpen(true)}
            className="p-2 -ml-1 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <Menu size={20} className="text-slate-600" />
          </button>
          <span className="font-bold text-slate-900 text-[17px] tracking-tight">EventOS</span>
          <Avatar name="Jonathan Wick" size="sm" />
        </header>

        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
