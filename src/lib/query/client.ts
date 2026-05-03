import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2,       // 2 min — fresh enough for catalog browsing
      gcTime: 1000 * 60 * 10,         // 10 min — keep inactive data in memory
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    },
  },
})

// Centralized query key factory — prevents key typos and enables targeted invalidation
export const queryKeys = {
  tenant: (slug: string) => ['tenant', slug] as const,

  items: {
    all: (tenantId: string) => ['items', tenantId] as const,
    filtered: (tenantId: string, filters: Record<string, unknown>) =>
      ['items', tenantId, filters] as const,
    detail: (tenantId: string, slug: string) => ['items', tenantId, slug] as const,
    availability: (itemId: string, date: string) =>
      ['availability', itemId, date] as const,
  },

  categories: {
    all: (tenantId: string) => ['categories', tenantId] as const,
  },

  compositions: {
    all: (tenantId: string) => ['compositions', tenantId] as const,
    detail: (tenantId: string, slug: string) =>
      ['compositions', tenantId, slug] as const,
  },

  rentals: {
    all: (tenantId: string) => ['rentals', tenantId] as const,
    filtered: (tenantId: string, filters: Record<string, unknown>) =>
      ['rentals', tenantId, filters] as const,
    detail: (tenantId: string, id: string) => ['rentals', tenantId, id] as const,
  },

  customers: {
    all: (tenantId: string) => ['customers', tenantId] as const,
    detail: (tenantId: string, id: string) =>
      ['customers', tenantId, id] as const,
  },

  tenants: {
    all: () => ['tenants'] as const,
    detail: (id: string) => ['tenants', id] as const,
  },
}
