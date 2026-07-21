ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS payment_status text DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS payment_method text,
ADD COLUMN IF NOT EXISTS payment_provider text,
ADD COLUMN IF NOT EXISTS transaction_id text,
ADD COLUMN IF NOT EXISTS payment_reference text,
ADD COLUMN IF NOT EXISTS paid_at timestamptz,
ADD COLUMN IF NOT EXISTS payment_response jsonb;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'orders' AND policyname = 'checkout_insert_orders') THEN
    CREATE POLICY "checkout_insert_orders" ON public.orders
    FOR INSERT TO anon, authenticated
    WITH CHECK (true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'orders' AND policyname = 'checkout_update_orders') THEN
    CREATE POLICY "checkout_update_orders" ON public.orders
    FOR UPDATE TO anon, authenticated
    USING (true)
    WITH CHECK (true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'order_items' AND policyname = 'checkout_insert_order_items') THEN
    CREATE POLICY "checkout_insert_order_items" ON public.order_items
    FOR INSERT TO anon, authenticated
    WITH CHECK (true);
  END IF;
END
$$;

CREATE TABLE IF NOT EXISTS public.payment_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES public.orders(id) ON DELETE CASCADE,
  event_type text NOT NULL,
  provider text NOT NULL,
  status text NOT NULL,
  payload jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
