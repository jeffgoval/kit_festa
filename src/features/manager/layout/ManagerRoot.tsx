import { useEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { Sidebar } from './Sidebar'
import { ManagerHeader } from './ManagerHeader'

export function ManagerRoot() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    setMobileNavOpen(false)
  }, [location.pathname])

  useEffect(() => {
    if (!mobileNavOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [mobileNavOpen])

  return (
    <div className="flex h-[100dvh] min-h-0 w-full max-w-[100vw] overflow-hidden bg-muted/20">
      <button
        type="button"
        aria-label="Fechar menu"
        className={cn(
          'fixed inset-0 z-40 bg-foreground/35 backdrop-blur-[2px] transition-opacity md:hidden',
          mobileNavOpen ? 'opacity-100' : 'pointer-events-none opacity-0',
        )}
        onClick={() => setMobileNavOpen(false)}
      />
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-[min(17.5rem,90vw)] flex-col border-r border-border bg-background shadow-lg transition-transform duration-200 ease-out md:relative md:z-0 md:max-w-none md:w-56 md:translate-x-0 md:shadow-none',
          mobileNavOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
        )}
      >
        <Sidebar onCloseMobileNav={() => setMobileNavOpen(false)} />
      </aside>
      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <ManagerHeader onOpenMobileNav={() => setMobileNavOpen(true)} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto overscroll-y-contain p-3 sm:p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
