import { type ReactNode } from 'react'
import { StoreHeader } from './StoreHeader'
import { StoreFooter } from './StoreFooter'
import { FloatingWhatsApp } from './FloatingWhatsApp'

export function StoreLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <StoreHeader />
      <main className="flex-1">{children}</main>
      <StoreFooter />
      <FloatingWhatsApp />
    </div>
  )
}
