-- Dev seed (runs on `supabase db reset` when Docker is available).
-- Remote: tenant `demo` was created via MCP; re-run insert if needed.

insert into public.tenants (name, slug, is_active, primary_color, secondary_color)
values ('Loja Demo', 'demo', true, '#8B5CF6', '#F9A8D4')
on conflict (slug) do update set name = excluded.name, is_active = excluded.is_active;

-- After creating the gestor user in Auth (Dashboard), set tenant + role:
-- update public.profiles
-- set tenant_id = (select id from public.tenants where slug = 'demo' limit 1)
-- where id = '<USER_UUID_FROM_AUTH_USERS>';
