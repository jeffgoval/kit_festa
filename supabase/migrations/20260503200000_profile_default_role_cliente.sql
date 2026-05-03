-- Cadastro público: perfil nasce como cliente. Admin/convite define gestor/admin via raw_app_meta_data->>'role'.

alter table public.profiles alter column role set default 'cliente';

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    coalesce(new.raw_app_meta_data->>'role', 'cliente')
  );
  return new;
end;
$$;
