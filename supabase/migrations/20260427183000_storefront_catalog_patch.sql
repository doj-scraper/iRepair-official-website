-- Patch an existing Supabase database that already has auth/profile/order tables.
-- This adds the missing storefront catalog schema, RLS, functions, and triggers.

create extension if not exists "pgcrypto";

do $$
begin
  create type public.quality_grade as enum ('OEM', 'Premium', 'Aftermarket');
exception
  when duplicate_object then null;
end $$;

create or replace function public.update_updated_at_column()
returns trigger
language plpgsql
set search_path = public
as $function$
begin
  new.updated_at = now();
  return new;
end;
$function$;

create or replace function public.has_role(_user_id uuid, _role text)
returns boolean
language sql
stable
security definer
set search_path = public
as $function$
  select exists (
    select 1
    from public.user_roles
    where user_id = _user_id
      and role::text = _role
  );
$function$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $function$
begin
  insert into public.profiles (id, email, name, shop_name)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data ->> 'name',
    new.raw_user_meta_data ->> 'shop_name'
  );

  if new.email = 'croda3005@gmail.com' then
    insert into public.user_roles (user_id, role) values (new.id, 'admin');
  else
    insert into public.user_roles (user_id, role) values (new.id, 'retail');
  end if;

  return new;
end;
$function$;

alter table public.profiles
  alter column updated_at set default now();

update public.profiles
set updated_at = now()
where updated_at is null;

alter table public.profiles enable row level security;
drop policy if exists "Users view own profile" on public.profiles;
drop policy if exists "Users update own profile" on public.profiles;
drop policy if exists "Users insert own profile" on public.profiles;
drop policy if exists "Admins view all profiles" on public.profiles;
create policy "Users view own profile" on public.profiles
  for select to authenticated
  using (auth.uid() = id);
create policy "Users update own profile" on public.profiles
  for update to authenticated
  using (auth.uid() = id);
create policy "Users insert own profile" on public.profiles
  for insert to authenticated
  with check (auth.uid() = id);
create policy "Admins view all profiles" on public.profiles
  for select to authenticated
  using (public.has_role(auth.uid(), 'admin'));

drop trigger if exists update_profiles_updated_at on public.profiles;
create trigger update_profiles_updated_at
before update on public.profiles
for each row execute function public.update_updated_at_column();

alter table public.user_roles enable row level security;
drop policy if exists "Users view own roles" on public.user_roles;
drop policy if exists "Admins manage roles" on public.user_roles;
create policy "Users view own roles" on public.user_roles
  for select to authenticated
  using (auth.uid() = user_id);
create policy "Admins manage roles" on public.user_roles
  for all to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

alter table public.orders
  alter column updated_at set default now();

update public.orders
set updated_at = now()
where updated_at is null;

alter table public.orders enable row level security;
drop policy if exists "Users view own orders" on public.orders;
drop policy if exists "Users create own orders" on public.orders;
drop policy if exists "Admins update orders" on public.orders;
create policy "Users view own orders" on public.orders
  for select to authenticated
  using (auth.uid() = user_id or public.has_role(auth.uid(), 'admin'));
create policy "Users create own orders" on public.orders
  for insert to authenticated
  with check (auth.uid() = user_id);
create policy "Admins update orders" on public.orders
  for update to authenticated
  using (public.has_role(auth.uid(), 'admin'));

drop trigger if exists update_orders_updated_at on public.orders;
create trigger update_orders_updated_at
before update on public.orders
for each row execute function public.update_updated_at_column();

alter table public.order_items enable row level security;
drop policy if exists "Users view own order items" on public.order_items;
drop policy if exists "Users insert own order items" on public.order_items;
create policy "Users view own order items" on public.order_items
  for select to authenticated
  using (
    exists (
      select 1
      from public.orders o
      where o.id = order_id
        and (o.user_id = auth.uid() or public.has_role(auth.uid(), 'admin'))
    )
  );
create policy "Users insert own order items" on public.order_items
  for insert to authenticated
  with check (
    exists (
      select 1
      from public.orders o
      where o.id = order_id
        and o.user_id = auth.uid()
    )
  );

create table if not exists public.brands (
  id serial primary key,
  name text not null unique,
  created_at timestamptz not null default now()
);
create table if not exists public.models (
  id serial primary key,
  brand_id integer not null references public.brands(id) on delete cascade,
  marketing_name text,
  generation text,
  release_year integer,
  created_at timestamptz not null default now()
);
create index if not exists idx_models_brand on public.models(brand_id);

create table if not exists public.categories (
  id serial primary key,
  name text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists public.inventory (
  sku_id text primary key,
  model_id integer references public.models(id) on delete set null,
  category_id integer not null references public.categories(id),
  part_name text,
  specifications text,
  quality_grade public.quality_grade,
  wholesale_price integer,
  moq integer not null default 1,
  stock_level integer not null default 0,
  image_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_inventory_model on public.inventory(model_id);
create index if not exists idx_inventory_category on public.inventory(category_id);
drop trigger if exists update_inventory_updated_at on public.inventory;
create trigger update_inventory_updated_at
before update on public.inventory
for each row execute function public.update_updated_at_column();

create table if not exists public.compatibility_map (
  id serial primary key,
  sku_id text not null references public.inventory(sku_id) on delete cascade,
  compatible_model_id integer not null references public.models(id) on delete cascade,
  unique (sku_id, compatible_model_id)
);
create index if not exists idx_compat_sku on public.compatibility_map(sku_id);
create index if not exists idx_compat_model on public.compatibility_map(compatible_model_id);

alter table public.brands enable row level security;
alter table public.models enable row level security;
alter table public.categories enable row level security;
alter table public.inventory enable row level security;
alter table public.compatibility_map enable row level security;

drop policy if exists "Public read brands" on public.brands;
drop policy if exists "Admins manage brands" on public.brands;
create policy "Public read brands" on public.brands
  for select using (true);
create policy "Admins manage brands" on public.brands
  for all to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

drop policy if exists "Public read models" on public.models;
drop policy if exists "Admins manage models" on public.models;
create policy "Public read models" on public.models
  for select using (true);
create policy "Admins manage models" on public.models
  for all to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

drop policy if exists "Public read categories" on public.categories;
drop policy if exists "Admins manage categories" on public.categories;
create policy "Public read categories" on public.categories
  for select using (true);
create policy "Admins manage categories" on public.categories
  for all to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

drop policy if exists "Public read inventory" on public.inventory;
drop policy if exists "Admins manage inventory" on public.inventory;
create policy "Public read inventory" on public.inventory
  for select using (true);
create policy "Admins manage inventory" on public.inventory
  for all to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

drop policy if exists "Public read compat" on public.compatibility_map;
drop policy if exists "Admins manage compat" on public.compatibility_map;
create policy "Public read compat" on public.compatibility_map
  for select using (true);
create policy "Admins manage compat" on public.compatibility_map
  for all to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

grant select on public.brands, public.models, public.categories, public.inventory, public.compatibility_map
  to anon, authenticated;

grant all privileges on public.brands, public.models, public.categories, public.inventory, public.compatibility_map,
  public.profiles, public.user_roles, public.orders, public.order_items
  to authenticated;

grant usage, select on all sequences in schema public to authenticated;
