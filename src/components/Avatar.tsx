const PALETTE = [
  'bg-blue-500',
  'bg-violet-500',
  'bg-emerald-500',
  'bg-amber-500',
  'bg-rose-500',
  'bg-cyan-500',
  'bg-fuchsia-500',
  'bg-orange-500',
]

interface AvatarProps {
  name: string
  size?: 'sm' | 'md' | 'lg'
}

export default function Avatar({ name, size = 'md' }: AvatarProps) {
  const initials = name
    .split(' ')
    .map(n => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  const idx = [...name].reduce((acc, c) => acc + c.charCodeAt(0), 0) % PALETTE.length

  const sizeClass = { sm: 'w-8 h-8 text-xs', md: 'w-10 h-10 text-sm', lg: 'w-12 h-12 text-base' }[size]

  return (
    <div className={`${sizeClass} ${PALETTE[idx]} rounded-full flex items-center justify-center text-white font-semibold shrink-0`}>
      {initials}
    </div>
  )
}
