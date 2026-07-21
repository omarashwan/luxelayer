CREATE TABLE IF NOT EXISTS public.payment_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES public.orders(id) ON DELETE CASCADE,
  event_type text NOT NULL,
  provider text NOT NULL,
  status text NOT NULL,
  payload jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE OR REPLACE FUNCTION public.create_checkout_order(order_data jsonb, items_data jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_order public.orders%ROWTYPE;
  item jsonb;
BEGIN
  INSERT INTO public.orders (
    order_number,
    user_id,
    email,
    status,
    subtotal,
    discount,
    shipping,
    tax,
    total,
    coupon_code,
    shipping_first_name,
    shipping_last_name,
    shipping_address1,
    shipping_address2,
    shipping_city,
    shipping_state,
    shipping_postal_code,
    shipping_country,
    shipping_phone,
    shipping_method,
    payment_method,
    payment_status,
    gift_wrap,
    notes
  )
  VALUES (
    order_data->>'order_number',
    NULLIF(order_data->>'user_id', '')::uuid,
    order_data->>'email',
    COALESCE(order_data->>'status', 'pending'),
    COALESCE((order_data->>'subtotal')::numeric, 0),
    COALESCE((order_data->>'discount')::numeric, 0),
    COALESCE((order_data->>'shipping')::numeric, 0),
    COALESCE((order_data->>'tax')::numeric, 0),
    COALESCE((order_data->>'total')::numeric, 0),
    NULLIF(order_data->>'coupon_code', ''),
    NULLIF(order_data->>'shipping_first_name', ''),
    NULLIF(order_data->>'shipping_last_name', ''),
    NULLIF(order_data->>'shipping_address1', ''),
    NULLIF(order_data->>'shipping_address2', ''),
    NULLIF(order_data->>'shipping_city', ''),
    NULLIF(order_data->>'shipping_state', ''),
    NULLIF(order_data->>'shipping_postal_code', ''),
    NULLIF(order_data->>'shipping_country', ''),
    NULLIF(order_data->>'shipping_phone', ''),
    NULLIF(order_data->>'shipping_method', ''),
    NULLIF(order_data->>'payment_method', ''),
    COALESCE(NULLIF(order_data->>'payment_status', ''), 'unpaid'),
    COALESCE((order_data->>'gift_wrap')::boolean, false),
    NULLIF(order_data->>'notes', '')
  )
  RETURNING * INTO new_order;

  FOR item IN SELECT * FROM jsonb_array_elements(COALESCE(items_data, '[]'::jsonb))
  LOOP
    INSERT INTO public.order_items (
      order_id,
      product_id,
      name,
      slug,
      image_url,
      shade,
      size,
      unit_price,
      quantity,
      total
    )
    VALUES (
      new_order.id,
      NULLIF(item->>'product_id', '')::uuid,
      item->>'name',
      NULLIF(item->>'slug', ''),
      NULLIF(item->>'image_url', ''),
      NULLIF(item->>'shade', ''),
      NULLIF(item->>'size', ''),
      COALESCE((item->>'unit_price')::numeric, 0),
      COALESCE((item->>'quantity')::int, 1),
      COALESCE((item->>'total')::numeric, 0)
    );
  END LOOP;

  RETURN to_jsonb(new_order);
END;
$$;

CREATE OR REPLACE FUNCTION public.update_checkout_payment(
  p_order_number text,
  p_status text,
  p_payment_method text,
  p_payment_status text,
  p_notes text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.orders
  SET
    status = COALESCE(NULLIF(p_status, ''), status),
    payment_method = COALESCE(NULLIF(p_payment_method, ''), payment_method),
    payment_status = COALESCE(NULLIF(p_payment_status, ''), payment_status),
    notes = COALESCE(NULLIF(p_notes, ''), notes),
    updated_at = now()
  WHERE order_number = p_order_number;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_checkout_order(p_order_number text)
RETURNS jsonb
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT to_jsonb(o)
  FROM public.orders o
  WHERE o.order_number = p_order_number;
$$;

CREATE OR REPLACE FUNCTION public.log_payment_event(
  p_order_id uuid,
  p_event_type text,
  p_provider text,
  p_status text,
  p_payload jsonb DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.payment_events (order_id, event_type, provider, status, payload)
  VALUES (p_order_id, p_event_type, p_provider, p_status, p_payload);
END;
$$;

GRANT EXECUTE ON FUNCTION public.create_checkout_order(jsonb, jsonb) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.update_checkout_payment(text, text, text, text, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_checkout_order(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.log_payment_event(uuid, text, text, text, jsonb) TO anon, authenticated;