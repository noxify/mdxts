'use client'
import { usePathname } from 'next/navigation'
import Link from 'next/link'

export function SidebarLink({
  pathname,
  name,
  hasData,
  style,
}: {
  pathname: string
  name: string
  hasData?: boolean
  style?: React.CSSProperties
}) {
  const currentPathname = usePathname()
  const isCurrent = hasData ? pathname === currentPathname : false

  return (
    <Link
      href={pathname}
      style={{
        display: 'block',
        padding: '0.25rem 0',
        color: isCurrent
          ? 'var(--color-foreground)'
          : 'var(--color-foreground-interactive)',
        ...style,
      }}
    >
      {name}
    </Link>
  )
}
