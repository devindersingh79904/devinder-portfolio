import * as AvatarPrimitive from '@radix-ui/react-avatar'
import { cn } from '@/lib/utils'

interface AvatarProps {
  src?: string
  name?: string
  className?: string
}

function initials(name?: string) {
  if (!name) return '?'
  return name.trim().split(/\s+/).slice(0, 2).map(w => w[0]?.toUpperCase()).join('')
}

export function Avatar({ src, name, className }: AvatarProps) {
  return (
    <AvatarPrimitive.Root
      className={cn(
        'relative flex h-24 w-24 shrink-0 overflow-hidden rounded-full bg-muted',
        className,
      )}
    >
      {src && (
        <AvatarPrimitive.Image src={src} alt={name || 'Profile'} className="h-full w-full object-cover" />
      )}
      <AvatarPrimitive.Fallback className="flex h-full w-full items-center justify-center text-2xl font-semibold text-muted-foreground">
        {initials(name)}
      </AvatarPrimitive.Fallback>
    </AvatarPrimitive.Root>
  )
}
