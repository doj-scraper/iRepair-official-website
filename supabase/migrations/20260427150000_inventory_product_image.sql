update public.inventory
set image_url = '/product.png'
where image_url is null or image_url <> '/product.png';
