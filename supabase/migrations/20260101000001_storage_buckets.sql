-- Buckets + storage.objects policies (aligned with app paths: {tenantId}/...)
insert into storage.buckets (id, name, public)
values ('item-images', 'item-images', true),
       ('tenant-assets', 'tenant-assets', true)
on conflict (id) do update set public = excluded.public;

create policy "item_images_select_public"
  on storage.objects for select
  using (bucket_id = 'item-images');

create policy "item_images_insert_managers"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'item-images'
    and public.current_user_role() in ('admin', 'gestor')
    and split_part(name, '/', 1) = public.current_tenant_id()::text
  );

create policy "item_images_update_managers"
  on storage.objects for update to authenticated
  using (
    bucket_id = 'item-images'
    and public.current_user_role() in ('admin', 'gestor')
    and split_part(name, '/', 1) = public.current_tenant_id()::text
  )
  with check (
    bucket_id = 'item-images'
    and public.current_user_role() in ('admin', 'gestor')
    and split_part(name, '/', 1) = public.current_tenant_id()::text
  );

create policy "item_images_delete_managers"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'item-images'
    and public.current_user_role() in ('admin', 'gestor')
    and split_part(name, '/', 1) = public.current_tenant_id()::text
  );

create policy "tenant_assets_select_public"
  on storage.objects for select
  using (bucket_id = 'tenant-assets');

create policy "tenant_assets_insert_managers"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'tenant-assets'
    and public.current_user_role() in ('admin', 'gestor')
    and split_part(name, '/', 1) = public.current_tenant_id()::text
  );

create policy "tenant_assets_update_managers"
  on storage.objects for update to authenticated
  using (
    bucket_id = 'tenant-assets'
    and public.current_user_role() in ('admin', 'gestor')
    and split_part(name, '/', 1) = public.current_tenant_id()::text
  )
  with check (
    bucket_id = 'tenant-assets'
    and public.current_user_role() in ('admin', 'gestor')
    and split_part(name, '/', 1) = public.current_tenant_id()::text
  );

create policy "tenant_assets_delete_managers"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'tenant-assets'
    and public.current_user_role() in ('admin', 'gestor')
    and split_part(name, '/', 1) = public.current_tenant_id()::text
  );
