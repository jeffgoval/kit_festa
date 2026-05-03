import { createBrowserRouter, Navigate } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import { PageSpinner } from '@/ui/page-spinner'
import { RequireAuth } from '@/core/components/require-auth'
import { RequireRole } from '@/core/components/require-role'

// — Public store —
const StoreRoot = lazy(() =>
  import('@/features/storefront/pages/StoreRoot').then((m) => ({ default: m.StoreRoot })),
)
const StoreLandingPage = lazy(() =>
  import('@/features/storefront/pages/StoreLandingPage').then((m) => ({ default: m.StoreLandingPage })),
)
const CatalogPage = lazy(() =>
  import('@/features/catalog/pages/CatalogPage').then((m) => ({ default: m.CatalogPage })),
)
const ItemDetailPage = lazy(() =>
  import('@/features/catalog/pages/ItemDetailPage').then((m) => ({ default: m.ItemDetailPage })),
)
const CompositionsPage = lazy(() =>
  import('@/features/compositions/pages/CompositionsPage').then((m) => ({ default: m.CompositionsPage })),
)
const CompositionDetailPage = lazy(() =>
  import('@/features/compositions/pages/CompositionDetailPage').then((m) => ({ default: m.CompositionDetailPage })),
)
const MyPartyPage = lazy(() =>
  import('@/features/cart/pages/MyPartyPage').then((m) => ({ default: m.MyPartyPage })),
)
const CheckoutPage = lazy(() =>
  import('@/features/checkout/pages/CheckoutPage').then((m) => ({ default: m.CheckoutPage })),
)
const SuccessPage = lazy(() =>
  import('@/features/checkout/pages/SuccessPage').then((m) => ({ default: m.SuccessPage })),
)

// — Manager panel —
const ManagerRoot = lazy(() =>
  import('@/features/manager/layout/ManagerRoot').then((m) => ({ default: m.ManagerRoot })),
)
const LoginPage = lazy(() =>
  import('@/features/auth/pages/LoginPage').then((m) => ({ default: m.LoginPage })),
)
const DashboardPage = lazy(() =>
  import('@/features/manager/dashboard/pages/DashboardPage').then((m) => ({ default: m.DashboardPage })),
)
const RentalsPage = lazy(() =>
  import('@/features/manager/rentals/pages/RentalsPage').then((m) => ({ default: m.RentalsPage })),
)
const RentalDetailPage = lazy(() =>
  import('@/features/manager/rentals/pages/RentalDetailPage').then((m) => ({ default: m.RentalDetailPage })),
)
const CustomersPage = lazy(() =>
  import('@/features/manager/customers/pages/CustomersPage').then((m) => ({ default: m.CustomersPage })),
)
const ItemsPage = lazy(() =>
  import('@/features/manager/items/pages/ItemsPage').then((m) => ({ default: m.ItemsPage })),
)
const ItemFormPage = lazy(() =>
  import('@/features/manager/items/pages/ItemFormPage').then((m) => ({ default: m.ItemFormPage })),
)
const CategoriesPage = lazy(() =>
  import('@/features/manager/categories/pages/CategoriesPage').then((m) => ({ default: m.CategoriesPage })),
)
const ManagerCompositionsPage = lazy(() =>
  import('@/features/manager/compositions/pages/CompositionsPage').then((m) => ({ default: m.CompositionsPage })),
)
const CompositionFormPage = lazy(() =>
  import('@/features/manager/compositions/pages/CompositionFormPage').then((m) => ({ default: m.CompositionFormPage })),
)
const StoreSettingsPage = lazy(() =>
  import('@/features/manager/settings/pages/StoreSettingsPage').then((m) => ({ default: m.StoreSettingsPage })),
)
const ProfilePage = lazy(() => import('@/features/manager/profile/pages/ProfilePage'))

// — Admin panel —
const AdminRoot = lazy(() =>
  import('@/features/admin/layout/AdminRoot').then((m) => ({ default: m.AdminRoot })),
)
const TenantsPage = lazy(() =>
  import('@/features/admin/tenants/pages/TenantsPage').then((m) => ({ default: m.TenantsPage })),
)
const TenantFormPage = lazy(() =>
  import('@/features/admin/tenants/pages/TenantFormPage').then((m) => ({ default: m.TenantFormPage })),
)
const AdminManagersPage = lazy(() =>
  import('@/features/admin/managers/pages/ManagersPage').then((m) => ({ default: m.ManagersPage })),
)

const s = (component: React.ReactNode) => (
  <Suspense fallback={<PageSpinner />}>{component}</Suspense>
)

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/demo" replace />,
  },

  // ────────────────────────────────────────
  // Public store  /:tenantSlug/*
  // ────────────────────────────────────────
  {
    path: ':tenantSlug',
    element: s(<StoreRoot />),
    children: [
      { index: true, element: s(<StoreLandingPage />) },
      { path: 'itens', element: s(<CatalogPage />) },
      { path: 'itens/:itemSlug', element: s(<ItemDetailPage />) },
      { path: 'composicoes', element: s(<CompositionsPage />) },
      { path: 'composicoes/:compositionSlug', element: s(<CompositionDetailPage />) },
      { path: 'minha-festa/checkout', element: s(<CheckoutPage />) },
      { path: 'minha-festa', element: s(<MyPartyPage />) },
      { path: 'solicitacao-enviada', element: s(<SuccessPage />) },
    ],
  },

  // ────────────────────────────────────────
  // Auth
  // ────────────────────────────────────────
  { path: 'app/login', element: s(<LoginPage />) },

  // ────────────────────────────────────────
  // Manager panel  /app/*
  // ────────────────────────────────────────
  {
    path: 'app',
    element: (
      <RequireAuth redirectTo="/app/login">
        <RequireRole allow={['gestor', 'admin']}>
          {s(<ManagerRoot />)}
        </RequireRole>
      </RequireAuth>
    ),
    children: [
      { index: true, element: <Navigate to="dashboard" replace /> },
      { path: 'dashboard', element: s(<DashboardPage />) },
      { path: 'reservas', element: s(<RentalsPage />) },
      { path: 'reservas/:id', element: s(<RentalDetailPage />) },
      { path: 'clientes', element: s(<CustomersPage />) },
      { path: 'itens', element: s(<ItemsPage />) },
      { path: 'itens/novo', element: s(<ItemFormPage />) },
      { path: 'itens/:id', element: s(<ItemFormPage />) },
      { path: 'categorias', element: s(<CategoriesPage />) },
      { path: 'composicoes', element: s(<ManagerCompositionsPage />) },
      { path: 'composicoes/nova', element: s(<CompositionFormPage />) },
      { path: 'composicoes/:id', element: s(<CompositionFormPage />) },
      { path: 'minha-loja', element: s(<StoreSettingsPage />) },
      { path: 'perfil', element: s(<ProfilePage />) },
    ],
  },

  // ────────────────────────────────────────
  // Admin SaaS  /admin/*
  // ────────────────────────────────────────
  {
    path: 'admin',
    element: (
      <RequireAuth redirectTo="/app/login">
        <RequireRole allow={['admin']}>
          {s(<AdminRoot />)}
        </RequireRole>
      </RequireAuth>
    ),
    children: [
      { index: true, element: <Navigate to="tenants" replace /> },
      { path: 'tenants', element: s(<TenantsPage />) },
      { path: 'tenants/novo', element: s(<TenantFormPage />) },
      { path: 'tenants/:id', element: s(<TenantFormPage />) },
      { path: 'gestores', element: s(<AdminManagersPage />) },
    ],
  },

  { path: '*', element: <Navigate to="/" replace /> },
])
