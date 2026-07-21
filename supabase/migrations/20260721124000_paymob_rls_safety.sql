DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'orders' AND policyname = 'checkout_select_own_orders'
  ) THEN
    CREATE POLICY "checkout_select_own_orders" ON public.orders
    FOR SELECT TO authenticated
    USING (auth.uid() = user_id OR public.is_admin());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'orders' AND policyname = 'checkout_insert_own_orders'
  ) THEN
    CREATE POLICY "checkout_insert_own_orders" ON public.orders
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'orders' AND policyname = 'checkout_update_own_orders'
  ) THEN
    CREATE POLICY "checkout_update_own_orders" ON public.orders
    FOR UPDATE TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'order_items' AND policyname = 'checkout_select_own_order_items'
  ) THEN
    CREATE POLICY "checkout_select_own_order_items" ON public.order_items
    FOR SELECT TO authenticated
    USING (EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id AND (o.user_id = auth.uid() OR public.is_admin())));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'order_items' AND policyname = 'checkout_insert_own_order_items'
  ) THEN
    CREATE POLICY "checkout_insert_own_order_items" ON public.order_items
    FOR INSERT TO authenticated
    WITH CHECK (EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id AND o.user_id = auth.uid()));
  END IF;
END
$$;
