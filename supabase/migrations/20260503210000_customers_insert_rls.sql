-- Corrige buraco de RLS em customers:
-- A política "Anyone can create customer" com WITH CHECK (true) fazia OR com
-- "Manager can manage own customers" no INSERT — um gestor autenticado podia
-- inserir linhas em tenant_id de OUTRA loja (a política fraca bastava).
--
-- Nova política: loja precisa existir e estar ativa; checkout (anon/authenticated
-- sem intenção de “furar” loja) ou gestor/admin só na própria tenant_id.

drop policy if exists "Anyone can create customer" on public.customers;

create policy "Customers insert storefront or own tenant"
  on public.customers
  for insert
  with check (
    exists (
      select 1
      from public.tenants t
      where t.id = tenant_id
        and t.is_active = true
    )
    and (
      (
        (select auth.role()) in ('anon', 'authenticated')
        and not (
          coalesce(public.current_user_role(), '') in ('gestor', 'admin')
          and public.current_tenant_id() is not null
          and tenant_id is distinct from public.current_tenant_id()
        )
      )
      or (
        tenant_id = public.current_tenant_id()
        and public.current_user_role() in ('gestor', 'admin')
      )
    )
  );
