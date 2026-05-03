-- ============================================================
-- Recriar — Initial schema
-- Multi-tenant SaaS for party item rental
-- ============================================================

-- ── Extensions ───────────────────────────────────────────────
create extension if not exists "pgcrypto";

-- ── Tenants ──────────────────────────────────────────────────
create table public.tenants (
  id               uuid primary key default gen_random_uuid(),
  name             text not null,
  slug             text not null unique,
  logo_url         text,
  phone            text,
  email            text,
  instagram_url    text,
  facebook_url     text,
  whatsapp_number  text,
  description      text,
  primary_color    text,
  secondary_color  text,
  accent_color     text,
  background_color text,
  text_color       text,
  is_active        boolean not null default true,
  created_at       timestamptz not null default now()
);

-- ── Profiles ─────────────────────────────────────────────────
create table public.profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  tenant_id  uuid references public.tenants(id) on delete set null,
  full_name  text,
  role       text not null default 'gestor',
  created_at timestamptz not null default now(),
  constraint profiles_role_check check (role in ('admin', 'gestor', 'cliente'))
);

-- ── Categories ───────────────────────────────────────────────
create table public.categories (
  id         uuid primary key default gen_random_uuid(),
  tenant_id  uuid not null references public.tenants(id) on delete cascade,
  name       text not null,
  sort_order integer not null default 0,
  is_active  boolean not null default true,
  created_at timestamptz not null default now()
);

-- ── Items ────────────────────────────────────────────────────
create table public.items (
  id               uuid primary key default gen_random_uuid(),
  tenant_id        uuid not null references public.tenants(id) on delete cascade,
  category_id      uuid references public.categories(id) on delete set null,
  name             text not null,
  slug             text not null,
  description      text,
  total_quantity   integer not null default 1,
  rental_price     numeric(10,2),
  replacement_cost numeric(10,2),
  condition        text not null default 'good',
  is_active        boolean not null default true,
  is_public        boolean not null default true,
  internal_notes   text,
  created_at       timestamptz not null default now(),

  constraint items_quantity_check check (total_quantity >= 0),
  constraint items_price_check check (rental_price is null or rental_price >= 0),
  constraint items_condition_check check (
    condition in ('new', 'good', 'worn', 'maintenance', 'unavailable')
  ),
  constraint items_unique_slug_per_tenant unique (tenant_id, slug)
);

-- ── Item images ──────────────────────────────────────────────
create table public.item_images (
  id         uuid primary key default gen_random_uuid(),
  tenant_id  uuid not null references public.tenants(id) on delete cascade,
  item_id    uuid not null references public.items(id) on delete cascade,
  image_url  text not null,
  alt_text   text,
  sort_order integer not null default 0,
  is_primary boolean not null default false,
  created_at timestamptz not null default now()
);

-- ── Compositions ─────────────────────────────────────────────
create table public.compositions (
  id              uuid primary key default gen_random_uuid(),
  tenant_id       uuid not null references public.tenants(id) on delete cascade,
  name            text not null,
  slug            text not null,
  description     text,
  theme           text,
  suggested_price numeric(10,2),
  is_active       boolean not null default true,
  is_public       boolean not null default true,
  created_at      timestamptz not null default now(),

  constraint compositions_price_check check (
    suggested_price is null or suggested_price >= 0
  ),
  constraint compositions_unique_slug_per_tenant unique (tenant_id, slug)
);

-- ── Composition items ────────────────────────────────────────
create table public.composition_items (
  id             uuid primary key default gen_random_uuid(),
  tenant_id      uuid not null references public.tenants(id) on delete cascade,
  composition_id uuid not null references public.compositions(id) on delete cascade,
  item_id        uuid not null references public.items(id) on delete restrict,
  quantity       integer not null default 1,
  sort_order     integer not null default 0,

  constraint composition_items_quantity_check check (quantity > 0),
  constraint composition_items_unique unique (composition_id, item_id)
);

-- ── Customers ────────────────────────────────────────────────
create table public.customers (
  id         uuid primary key default gen_random_uuid(),
  tenant_id  uuid not null references public.tenants(id) on delete cascade,
  name       text not null,
  email      text,
  phone      text not null,
  document   text,
  address    text,
  notes      text,
  created_at timestamptz not null default now(),

  constraint customers_unique_phone_per_tenant unique (tenant_id, phone)
);

-- ── Rentals ──────────────────────────────────────────────────
create table public.rentals (
  id             uuid primary key default gen_random_uuid(),
  tenant_id      uuid not null references public.tenants(id) on delete cascade,
  customer_id    uuid not null references public.customers(id) on delete restrict,
  event_date     date not null,
  return_date    date,
  status         text not null default 'pending',
  source         text not null default 'web',
  subtotal       numeric(10,2) not null default 0,
  discount       numeric(10,2) not null default 0,
  total_price    numeric(10,2) not null default 0,
  address        text,
  public_notes   text,
  internal_notes text,
  created_at     timestamptz not null default now(),

  constraint rentals_status_check check (
    status in ('pending', 'confirmed', 'cancelled', 'completed')
  ),
  constraint rentals_source_check check (
    source in ('web', 'admin', 'instagram', 'whatsapp', 'manual')
  ),
  constraint rentals_discount_check check (discount >= 0),
  constraint rentals_total_check check (total_price >= 0)
);

-- ── Rental items ─────────────────────────────────────────────
create table public.rental_items (
  id                  uuid primary key default gen_random_uuid(),
  tenant_id           uuid not null references public.tenants(id) on delete cascade,
  rental_id           uuid not null references public.rentals(id) on delete cascade,
  item_id             uuid not null references public.items(id) on delete restrict,
  composition_id      uuid references public.compositions(id) on delete set null,
  quantity            integer not null default 1,
  unit_price          numeric(10,2),
  item_name_snapshot  text not null,
  created_at          timestamptz not null default now(),

  constraint rental_items_quantity_check check (quantity > 0),
  constraint rental_items_unit_price_check check (
    unit_price is null or unit_price >= 0
  )
);

-- ── Rental compositions (origin log) ─────────────────────────
create table public.rental_compositions (
  id                       uuid primary key default gen_random_uuid(),
  tenant_id                uuid not null references public.tenants(id) on delete cascade,
  rental_id                uuid not null references public.rentals(id) on delete cascade,
  composition_id           uuid references public.compositions(id) on delete set null,
  composition_name_snapshot text not null,
  suggested_price_snapshot  numeric(10,2),
  created_at               timestamptz not null default now()
);

-- ── Indexes ──────────────────────────────────────────────────
create index idx_items_tenant_id           on public.items (tenant_id);
create index idx_items_category_id         on public.items (category_id);
create index idx_item_images_item_id       on public.item_images (item_id);
create index idx_compositions_tenant_id    on public.compositions (tenant_id);
create index idx_composition_items_comp_id on public.composition_items (composition_id);
create index idx_rentals_tenant_id         on public.rentals (tenant_id);
create index idx_rentals_customer_id       on public.rentals (customer_id);
create index idx_rentals_event_date        on public.rentals (event_date);
create index idx_rentals_status            on public.rentals (status);
create index idx_rental_items_rental_id    on public.rental_items (rental_id);
create index idx_rental_items_item_id      on public.rental_items (item_id);
create index idx_customers_tenant_id       on public.customers (tenant_id);
create index idx_profiles_tenant_id        on public.profiles (tenant_id);

-- ============================================================
-- Helper functions
-- ============================================================

-- Returns the tenant_id for the current authenticated user
create or replace function public.current_tenant_id()
returns uuid
language sql stable security definer
set search_path = public
as $$
  select tenant_id from public.profiles where id = auth.uid()
$$;

-- Returns the role for the current authenticated user
create or replace function public.current_user_role()
returns text
language sql stable security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid()
$$;

-- RB-001/RB-005: availability = total - sum of confirmed rental quantities for the date
create or replace function public.get_item_availability(
  p_item_id   uuid,
  p_event_date date
)
returns integer
language sql stable security definer
set search_path = public
as $$
  select
    coalesce(i.total_quantity, 0)
    - coalesce((
        select sum(ri.quantity)
        from public.rental_items ri
        join public.rentals r on r.id = ri.rental_id
        where ri.item_id = p_item_id
          and r.event_date = p_event_date
          and r.status = 'confirmed'   -- RB-005: only confirmed blocks stock
      ), 0)
  from public.items i
  where i.id = p_item_id
$$;

-- RB-007: validate all items in a rental before confirming
create or replace function public.validate_rental_availability(
  p_rental_id uuid
)
returns boolean
language plpgsql stable security definer
set search_path = public
as $$
declare
  v_event_date date;
  v_available  integer;
  ri           record;
begin
  select event_date into v_event_date
  from public.rentals
  where id = p_rental_id;

  for ri in
    select item_id, quantity
    from public.rental_items
    where rental_id = p_rental_id
  loop
    -- Available for this item excluding the current rental's own items
    select
      i.total_quantity
      - coalesce((
          select sum(ri2.quantity)
          from public.rental_items ri2
          join public.rentals r2 on r2.id = ri2.rental_id
          where ri2.item_id = ri.item_id
            and r2.event_date = v_event_date
            and r2.status = 'confirmed'
            and r2.id != p_rental_id
        ), 0)
    into v_available
    from public.items i
    where i.id = ri.item_id;

    if coalesce(v_available, 0) < ri.quantity then
      return false;
    end if;
  end loop;

  return true;
end;
$$;

-- ============================================================
-- Row Level Security
-- ============================================================

alter table public.tenants            enable row level security;
alter table public.profiles           enable row level security;
alter table public.categories         enable row level security;
alter table public.items              enable row level security;
alter table public.item_images        enable row level security;
alter table public.compositions       enable row level security;
alter table public.composition_items  enable row level security;
alter table public.customers          enable row level security;
alter table public.rentals            enable row level security;
alter table public.rental_items       enable row level security;
alter table public.rental_compositions enable row level security;

-- ── tenants ──────────────────────────────────────────────────
-- Public can read active tenants (needed to load store by slug)
create policy "Public can view active tenants"
  on public.tenants for select
  using (is_active = true);

-- Admin can manage all tenants
create policy "Admin can manage tenants"
  on public.tenants for all
  using (public.current_user_role() = 'admin')
  with check (public.current_user_role() = 'admin');

-- Gestor can view own tenant
create policy "Gestor can view own tenant"
  on public.tenants for select
  using (id = public.current_tenant_id());

-- Gestor can update own tenant
create policy "Gestor can update own tenant"
  on public.tenants for update
  using (
    id = public.current_tenant_id()
    and public.current_user_role() in ('gestor', 'admin')
  )
  with check (
    id = public.current_tenant_id()
    and public.current_user_role() in ('gestor', 'admin')
  );

-- ── profiles ─────────────────────────────────────────────────
create policy "User can read own profile"
  on public.profiles for select
  using (id = auth.uid());

create policy "Admin can manage all profiles"
  on public.profiles for all
  using (public.current_user_role() = 'admin')
  with check (public.current_user_role() = 'admin');

-- ── categories ───────────────────────────────────────────────
create policy "Public can view active categories"
  on public.categories for select
  using (is_active = true);

create policy "Manager can manage own categories"
  on public.categories for all
  using (
    tenant_id = public.current_tenant_id()
    and public.current_user_role() in ('admin', 'gestor')
  )
  with check (
    tenant_id = public.current_tenant_id()
    and public.current_user_role() in ('admin', 'gestor')
  );

-- ── items ────────────────────────────────────────────────────
create policy "Public can view active public items"
  on public.items for select
  using (is_active = true and is_public = true);

create policy "Manager can manage own items"
  on public.items for all
  using (
    tenant_id = public.current_tenant_id()
    and public.current_user_role() in ('admin', 'gestor')
  )
  with check (
    tenant_id = public.current_tenant_id()
    and public.current_user_role() in ('admin', 'gestor')
  );

-- ── item_images ──────────────────────────────────────────────
create policy "Public can view item images"
  on public.item_images for select
  using (true);

create policy "Manager can manage own item images"
  on public.item_images for all
  using (
    tenant_id = public.current_tenant_id()
    and public.current_user_role() in ('admin', 'gestor')
  )
  with check (
    tenant_id = public.current_tenant_id()
    and public.current_user_role() in ('admin', 'gestor')
  );

-- ── compositions ─────────────────────────────────────────────
create policy "Public can view active public compositions"
  on public.compositions for select
  using (is_active = true and is_public = true);

create policy "Manager can manage own compositions"
  on public.compositions for all
  using (
    tenant_id = public.current_tenant_id()
    and public.current_user_role() in ('admin', 'gestor')
  )
  with check (
    tenant_id = public.current_tenant_id()
    and public.current_user_role() in ('admin', 'gestor')
  );

-- ── composition_items ─────────────────────────────────────────
create policy "Public can view composition items"
  on public.composition_items for select
  using (true);

create policy "Manager can manage own composition items"
  on public.composition_items for all
  using (
    tenant_id = public.current_tenant_id()
    and public.current_user_role() in ('admin', 'gestor')
  )
  with check (
    tenant_id = public.current_tenant_id()
    and public.current_user_role() in ('admin', 'gestor')
  );

-- ── customers ────────────────────────────────────────────────
-- Unauthenticated users can INSERT (via checkout flow) but not read
create policy "Anyone can create customer"
  on public.customers for insert
  with check (true);

create policy "Manager can manage own customers"
  on public.customers for all
  using (
    tenant_id = public.current_tenant_id()
    and public.current_user_role() in ('admin', 'gestor')
  )
  with check (
    tenant_id = public.current_tenant_id()
    and public.current_user_role() in ('admin', 'gestor')
  );

-- ── rentals ──────────────────────────────────────────────────
-- Anyone (anon) can INSERT (web checkout — RB-006: pending does not block stock)
create policy "Anyone can create rental"
  on public.rentals for insert
  with check (true);

create policy "Manager can manage own rentals"
  on public.rentals for all
  using (
    tenant_id = public.current_tenant_id()
    and public.current_user_role() in ('admin', 'gestor')
  )
  with check (
    tenant_id = public.current_tenant_id()
    and public.current_user_role() in ('admin', 'gestor')
  );

-- ── rental_items ─────────────────────────────────────────────
create policy "Anyone can create rental items"
  on public.rental_items for insert
  with check (true);

create policy "Manager can manage own rental items"
  on public.rental_items for all
  using (
    tenant_id = public.current_tenant_id()
    and public.current_user_role() in ('admin', 'gestor')
  )
  with check (
    tenant_id = public.current_tenant_id()
    and public.current_user_role() in ('admin', 'gestor')
  );

-- ── rental_compositions ──────────────────────────────────────
create policy "Anyone can create rental compositions"
  on public.rental_compositions for insert
  with check (true);

create policy "Manager can manage own rental compositions"
  on public.rental_compositions for all
  using (
    tenant_id = public.current_tenant_id()
    and public.current_user_role() in ('admin', 'gestor')
  )
  with check (
    tenant_id = public.current_tenant_id()
    and public.current_user_role() in ('admin', 'gestor')
  );

-- ============================================================
-- Storage buckets
-- ============================================================
-- See migration 20260101000001_storage_buckets.sql (buckets + storage.objects policies).

-- ============================================================
-- Trigger: auto-create profile on user signup
-- ============================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    coalesce(new.raw_app_meta_data->>'role', 'gestor')
    -- Note: role assigned from app_metadata (server-controlled), not user_metadata
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
