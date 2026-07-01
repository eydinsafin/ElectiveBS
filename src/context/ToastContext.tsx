import { createContext, useCallback, useContext, useState, ReactNode } from 'react'
import { CheckCircle2, XCircle, Info, X } from 'lucide-react'

type ToastType = 'success' | 'error' | 'info'

type ToastItem = {
  id: number
  message: string
  type: ToastType
}

type Ctx = {
  show: (message: string, type?: ToastType) => void
}

const ToastContext = createContext<Ctx>({ show: () => {} })

const ICONS: Record<ToastType, typeof CheckCircle2> = {
  success: CheckCircle2,
  error: XCircle,
  info: Info,
}

const ICON_CLS: Record<ToastType, string> = {
  success: 'text-emerald-500',
  error: 'text-red-500',
  info: 'text-amber-500',
}

let counter = 0

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const dismiss = useCallback((id: number) => {
    setToasts(t => t.filter(x => x.id !== id))
  }, [])

  const show = useCallback((message: string, type: ToastType = 'success') => {
    const id = ++counter
    setToasts(t => [...t, { id, message, type }])
    setTimeout(() => dismiss(id), 3000)
  }, [dismiss])

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      <div className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2 w-[calc(100%-2.5rem)] max-w-sm pointer-events-none">
        {toasts.map(t => {
          const Icon = ICONS[t.type]
          return (
            <div
              key={t.id}
              className="pointer-events-auto flex items-start gap-2.5 bg-white border border-slate-200 rounded-xl shadow-lg shadow-slate-900/10 px-4 py-3 animate-toast-in"
            >
              <Icon size={18} className={`shrink-0 mt-0.5 ${ICON_CLS[t.type]}`} />
              <p className="text-sm text-slate-700 flex-1 leading-snug">{t.message}</p>
              <button
                onClick={() => dismiss(t.id)}
                className="shrink-0 text-slate-300 hover:text-slate-500 transition-colors"
              >
                <X size={15} />
              </button>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}

export const useToast = () => useContext(ToastContext)
