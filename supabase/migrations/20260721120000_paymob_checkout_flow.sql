ALTER TABLE public.orders
DROP CONSTRAINT IF EXISTS orders_status_check;

ALTER TABLE public.orders
ADD CONSTRAINT orders_status_check
CHECK (status IN ('pending','paid','awaiting_cod','processing','shipped','delivered','cancelled','refunded','returned'));

ALTER TABLE public.orders
DROP CONSTRAINT IF EXISTS orders_payment_status_check;

ALTER TABLE public.orders
ADD CONSTRAINT orders_payment_status_check
CHECK (payment_status IN ('unpaid','paid','deposit_paid','refunded','failed'));

CREATE OR REPLACE FUNCTION public.update_checkout_payment(
  p_order_number text,
  p_status text,
  p_payment_method text,
  p_payment_status text,
  p_notes text DEFAULT NULL,
  p_transaction_id text DEFAULT NULL,
  p_payment_reference text DEFAULT NULL,
  p_paid_at timestamptz DEFAULT NULL,
  p_payment_response jsonb DEFAULT NULL
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
    transaction_id = COALESCE(NULLIF(p_transaction_id, ''), transaction_id),
    payment_reference = COALESCE(NULLIF(p_payment_reference, ''), payment_reference),
    paid_at = COALESCE(p_paid_at, paid_at),
    payment_response = COALESCE(p_payment_response, payment_response),
    notes = COALESCE(NULLIF(p_notes, ''), notes),
    updated_at = now()
  WHERE order_number = p_order_number;
END;
$$;

GRANT EXECUTE ON FUNCTION public.update_checkout_payment(text, text, text, text, text, text, text, timestamptz, jsonb) TO anon, authenticated;
