import type { Tables } from '@/lib/supabase/database.types'

// ── Row types from DB ─────────────────────────────────────────────────────────
export type Tenant = Tables<'tenants'>
export type Profile = Tables<'profiles'>
export type Category = Tables<'categories'>
export type Item = Tables<'items'>
export type ItemImage = Tables<'item_images'>
export type Composition = Tables<'compositions'>
export type CompositionItem = Tables<'composition_items'>
export type Customer = Tables<'customers'>
export type Rental = Tables<'rentals'>
export type RentalItem = Tables<'rental_items'>
export type RentalComposition = Tables<'rental_compositions'>

// ── Joined / enriched types ───────────────────────────────────────────────────
export interface ItemWithImages extends Item {
  item_images: ItemImage[]
  categories: Pick<Category, 'id' | 'name'> | null
}

export interface CompositionWithItems extends Composition {
  composition_items: (CompositionItem & { items: ItemWithImages })[]
}

export interface RentalWithDetails extends Rental {
  customers: Customer
  rental_items: (RentalItem & { items: Pick<Item, 'id' | 'name' | 'slug'> })[]
}

// ── Cart (client-side only, not persisted to DB until checkout) ───────────────
export interface CartEntry {
  itemId: string
  name: string
  slug: string
  imageUrl: string | null
  unitPrice: number | null
  quantity: number
  totalAvailable: number
  compositionId?: string   // set when item came from a composition
}

export interface CartState {
  tenantSlug: string | null
  entries: CartEntry[]
  eventDate: string | null
  originCompositionIds: string[]  // which compositions were used as base
}

// ── Role helpers ──────────────────────────────────────────────────────────────
export type UserRole = Profile['role']

export function isManager(role: UserRole | null | undefined): boolean {
  return role === 'gestor' || role === 'admin'
}

export function isAdmin(role: UserRole | null | undefined): boolean {
  return role === 'admin'
}

// ── Status maps for display ───────────────────────────────────────────────────
export const RENTAL_STATUS_LABEL: Record<Rental['status'], string> = {
  pending: 'Pendente',
  confirmed: 'Confirmada',
  cancelled: 'Cancelada',
  completed: 'Concluída',
}

export const ITEM_CONDITION_LABEL: Record<Item['condition'], string> = {
  new: 'Novo',
  good: 'Bom estado',
  worn: 'Desgastado',
  maintenance: 'Em manutenção',
  unavailable: 'Indisponível',
}
