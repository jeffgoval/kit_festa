import { Outlet, useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import { TenantProvider, useTenant } from '@/core/contexts/tenant.context'
import { useCartStore } from '@/core/stores/cart.store'
import { PageSpinner } from '@/ui/page-spinner'
import { StoreLayout } from '../components/StoreLayout'

function StoreInner() {
  const { tenant, loading, notFound } = useTenant()
  const initCart = useCartStore((s) => s.initCart)
  const navigate = useNavigate()

  useEffect(() => {
    if (tenant) initCart(tenant.slug)
  }, [tenant, initCart])

  if (loading) return <PageSpinner />
  if (notFound) {
    navigate('/', { replace: true })
    return null
  }

  return (
    <StoreLayout>
      <Outlet />
    </StoreLayout>
  )
}

export function StoreRoot() {
  return (
    <TenantProvider>
      <StoreInner />
    </TenantProvider>
  )
}
