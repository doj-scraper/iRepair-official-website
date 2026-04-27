begin;

insert into public.brands (name)
values
  ('Apple'),
  ('Samsung')
on conflict (name) do nothing;

insert into public.models (brand_id, marketing_name, generation, release_year)
select b.id, 'iPhone', '15 Pro', 2023
from public.brands b
where b.name = 'Apple'
  and not exists (
    select 1
    from public.models m
    where m.brand_id = b.id
      and m.marketing_name = 'iPhone'
      and m.generation = '15 Pro'
  );

insert into public.models (brand_id, marketing_name, generation, release_year)
select b.id, 'iPhone', '15 Pro Max', 2023
from public.brands b
where b.name = 'Apple'
  and not exists (
    select 1
    from public.models m
    where m.brand_id = b.id
      and m.marketing_name = 'iPhone'
      and m.generation = '15 Pro Max'
  );

insert into public.models (brand_id, marketing_name, generation, release_year)
select b.id, 'iPhone', '14', 2022
from public.brands b
where b.name = 'Apple'
  and not exists (
    select 1
    from public.models m
    where m.brand_id = b.id
      and m.marketing_name = 'iPhone'
      and m.generation = '14'
  );

insert into public.models (brand_id, marketing_name, generation, release_year)
select b.id, 'iPhone', '16', 2024
from public.brands b
where b.name = 'Apple'
  and not exists (
    select 1
    from public.models m
    where m.brand_id = b.id
      and m.marketing_name = 'iPhone'
      and m.generation = '16'
  );

insert into public.models (brand_id, marketing_name, generation, release_year)
select b.id, 'Galaxy S', '24 Ultra', 2024
from public.brands b
where b.name = 'Samsung'
  and not exists (
    select 1
    from public.models m
    where m.brand_id = b.id
      and m.marketing_name = 'Galaxy S'
      and m.generation = '24 Ultra'
  );

insert into public.models (brand_id, marketing_name, generation, release_year)
select b.id, 'Galaxy S', '23', 2023
from public.brands b
where b.name = 'Samsung'
  and not exists (
    select 1
    from public.models m
    where m.brand_id = b.id
      and m.marketing_name = 'Galaxy S'
      and m.generation = '23'
  );

insert into public.models (brand_id, marketing_name, generation, release_year)
select b.id, 'Galaxy A', '55', 2024
from public.brands b
where b.name = 'Samsung'
  and not exists (
    select 1
    from public.models m
    where m.brand_id = b.id
      and m.marketing_name = 'Galaxy A'
      and m.generation = '55'
  );

insert into public.models (brand_id, marketing_name, generation, release_year)
select b.id, 'Galaxy A', '54', 2023
from public.brands b
where b.name = 'Samsung'
  and not exists (
    select 1
    from public.models m
    where m.brand_id = b.id
      and m.marketing_name = 'Galaxy A'
      and m.generation = '54'
  );

insert into public.categories (name)
values
  ('Screen'),
  ('Battery'),
  ('Back Glass'),
  ('Charge Port'),
  ('Camera'),
  ('Housing'),
  ('Flex Cable')
on conflict (name) do nothing;

insert into public.inventory (
  sku_id,
  model_id,
  category_id,
  part_name,
  specifications,
  quality_grade,
  wholesale_price,
  moq,
  stock_level,
  image_url
)
values
  (
    'AP-IP15PR-SCR-OEM',
    (select id from public.models where brand_id = (select id from public.brands where name = 'Apple') and marketing_name = 'iPhone' and generation = '15 Pro' limit 1),
    (select id from public.categories where name = 'Screen' limit 1),
    'iPhone 15 Pro Screen Assembly',
    '6.1-inch OLED replacement screen with pre-installed sensors.',
    'OEM',
    14999,
    1,
    24,
    '/product.png'
  ),
  (
    'AP-IP15PR-BAT-PREM',
    (select id from public.models where brand_id = (select id from public.brands where name = 'Apple') and marketing_name = 'iPhone' and generation = '15 Pro' limit 1),
    (select id from public.categories where name = 'Battery' limit 1),
    'iPhone 15 Pro Battery',
    'High-capacity battery pack with factory-grade protection circuit.',
    'Premium',
    8999,
    1,
    38,
    '/product.png'
  ),
  (
    'AP-IP14-BGLASS-OEM',
    (select id from public.models where brand_id = (select id from public.brands where name = 'Apple') and marketing_name = 'iPhone' and generation = '14' limit 1),
    (select id from public.categories where name = 'Back Glass' limit 1),
    'iPhone 14 Back Glass',
    'Laser-cut back glass with MagSafe ring and adhesive kit.',
    'OEM',
    6499,
    1,
    52,
    '/product.png'
  ),
  (
    'AP-IP16-PORT-PREM',
    (select id from public.models where brand_id = (select id from public.brands where name = 'Apple') and marketing_name = 'iPhone' and generation = '16' limit 1),
    (select id from public.categories where name = 'Charge Port' limit 1),
    'iPhone 16 Charge Port Flex',
    'USB-C charge port assembly with microphone and antenna flex.',
    'Premium',
    7999,
    1,
    31,
    '/product.png'
  ),
  (
    'SA-GS24U-SCR-OEM',
    (select id from public.models where brand_id = (select id from public.brands where name = 'Samsung') and marketing_name = 'Galaxy S' and generation = '24 Ultra' limit 1),
    (select id from public.categories where name = 'Screen' limit 1),
    'Galaxy S24 Ultra Screen Assembly',
    '6.8-inch AMOLED assembly with frame and fingerprint support.',
    'OEM',
    18999,
    1,
    16,
    '/product.png'
  ),
  (
    'SA-GS23-HOUS-PREM',
    (select id from public.models where brand_id = (select id from public.brands where name = 'Samsung') and marketing_name = 'Galaxy S' and generation = '23' limit 1),
    (select id from public.categories where name = 'Housing' limit 1),
    'Galaxy S23 Housing',
    'Midframe housing with button assembly and gasket set.',
    'Premium',
    10999,
    1,
    27,
    '/product.png'
  ),
  (
    'SA-GA55-BAT-OEM',
    (select id from public.models where brand_id = (select id from public.brands where name = 'Samsung') and marketing_name = 'Galaxy A' and generation = '55' limit 1),
    (select id from public.categories where name = 'Battery' limit 1),
    'Galaxy A55 Battery',
    'OEM battery pack with calibrated controller board.',
    'OEM',
    5299,
    1,
    44,
    '/product.png'
  ),
  (
    'SA-GA54-FLEX-AFT',
    (select id from public.models where brand_id = (select id from public.brands where name = 'Samsung') and marketing_name = 'Galaxy A' and generation = '54' limit 1),
    (select id from public.categories where name = 'Flex Cable' limit 1),
    'Galaxy A54 Flex Cable',
    'Aftermarket flex cable for charge and data connection.',
    'Aftermarket',
    3499,
    1,
    61,
    '/product.png'
  )
on conflict (sku_id) do update
set
  model_id = excluded.model_id,
  category_id = excluded.category_id,
  part_name = excluded.part_name,
  specifications = excluded.specifications,
  quality_grade = excluded.quality_grade,
  wholesale_price = excluded.wholesale_price,
  moq = excluded.moq,
  stock_level = excluded.stock_level,
  image_url = excluded.image_url,
  updated_at = now();

insert into public.compatibility_map (sku_id, compatible_model_id)
values
  (
    'AP-IP15PR-SCR-OEM',
    (select id from public.models where brand_id = (select id from public.brands where name = 'Apple') and marketing_name = 'iPhone' and generation = '15 Pro' limit 1)
  ),
  (
    'AP-IP15PR-SCR-OEM',
    (select id from public.models where brand_id = (select id from public.brands where name = 'Apple') and marketing_name = 'iPhone' and generation = '15 Pro Max' limit 1)
  ),
  (
    'AP-IP15PR-BAT-PREM',
    (select id from public.models where brand_id = (select id from public.brands where name = 'Apple') and marketing_name = 'iPhone' and generation = '15 Pro' limit 1)
  ),
  (
    'AP-IP14-BGLASS-OEM',
    (select id from public.models where brand_id = (select id from public.brands where name = 'Apple') and marketing_name = 'iPhone' and generation = '14' limit 1)
  ),
  (
    'AP-IP16-PORT-PREM',
    (select id from public.models where brand_id = (select id from public.brands where name = 'Apple') and marketing_name = 'iPhone' and generation = '16' limit 1)
  ),
  (
    'SA-GS24U-SCR-OEM',
    (select id from public.models where brand_id = (select id from public.brands where name = 'Samsung') and marketing_name = 'Galaxy S' and generation = '24 Ultra' limit 1)
  ),
  (
    'SA-GS23-HOUS-PREM',
    (select id from public.models where brand_id = (select id from public.brands where name = 'Samsung') and marketing_name = 'Galaxy S' and generation = '23' limit 1)
  ),
  (
    'SA-GA55-BAT-OEM',
    (select id from public.models where brand_id = (select id from public.brands where name = 'Samsung') and marketing_name = 'Galaxy A' and generation = '55' limit 1)
  ),
  (
    'SA-GA54-FLEX-AFT',
    (select id from public.models where brand_id = (select id from public.brands where name = 'Samsung') and marketing_name = 'Galaxy A' and generation = '54' limit 1)
  )
on conflict (sku_id, compatible_model_id) do nothing;

commit;
