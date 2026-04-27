-- Update handle_new_user to grant admin role to hardcoded admin email
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (id, email, name, shop_name)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data ->> 'name',
    NEW.raw_user_meta_data ->> 'shop_name'
  );

  IF NEW.email = 'croda3005@gmail.com' THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin');
  ELSE
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'retail');
  END IF;

  RETURN NEW;
END;
$function$;

-- If the admin user already exists, promote them now
DO $$
DECLARE
  admin_uid uuid;
BEGIN
  SELECT id INTO admin_uid FROM auth.users WHERE email = 'croda3005@gmail.com' LIMIT 1;
  IF admin_uid IS NOT NULL THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (admin_uid, 'admin')
    ON CONFLICT DO NOTHING;
  END IF;
END $$;

-- Ensure stripe_session is unique so we can look up orders by it
CREATE UNIQUE INDEX IF NOT EXISTS orders_stripe_session_unique
  ON public.orders (stripe_session)
  WHERE stripe_session IS NOT NULL;