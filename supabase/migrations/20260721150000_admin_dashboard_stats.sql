CREATE OR REPLACE FUNCTION public.get_admin_dashboard_stats()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result jsonb;
BEGIN
  WITH orders_cte AS (
    SELECT
      COALESCE(COUNT(*), 0) AS order_count,
      COALESCE(SUM(CASE WHEN payment_status IN ('paid', 'deposit_paid') OR status = 'delivered' THEN total ELSE 0 END), 0) AS revenue
    FROM public.orders
  ),
  products_cte AS (
    SELECT COALESCE(COUNT(*), 0) AS product_count
    FROM public.products
    WHERE is_published = true
  ),
  customers_cte AS (
    SELECT COALESCE(COUNT(*), 0) AS customer_count
    FROM public.profiles
    WHERE COALESCE(is_admin, false) = false
  ),
  low_stock_cte AS (
    SELECT COALESCE(
      jsonb_agg(
        jsonb_build_object(
          'id', id,
          'name', name,
          'stock', stock,
          'featured_image_url', featured_image_url
        )
        ORDER BY stock ASC
      ),
      '[]'::jsonb
    ) AS low_stock
    FROM (
      SELECT id, name, stock, featured_image_url
      FROM public.products
      WHERE is_published = true AND stock < 10
      ORDER BY stock ASC
      LIMIT 5
    ) AS low_stock_rows
  ),
  top_products_cte AS (
    SELECT COALESCE(
      jsonb_agg(
        jsonb_build_object(
          'name', name,
          'total', total,
          'qty', qty,
          'image', image
        )
        ORDER BY qty DESC
      ),
      '[]'::jsonb
    ) AS top_products
    FROM (
      SELECT
        name,
        SUM(quantity)::int AS qty,
        SUM(total)::numeric AS total,
        MAX(image_url) AS image
      FROM public.order_items
      GROUP BY name
      ORDER BY SUM(quantity) DESC
      LIMIT 5
    ) AS top_product_rows
  ),
  recent_orders_cte AS (
    SELECT COALESCE(
      jsonb_agg(
        jsonb_build_object(
          'order_number', order_number,
          'email', email,
          'total', total,
          'status', status,
          'created_at', created_at
        )
        ORDER BY created_at DESC
      ),
      '[]'::jsonb
    ) AS recent_orders
    FROM (
      SELECT order_number, email, total, status, created_at
      FROM public.orders
      ORDER BY created_at DESC
      LIMIT 6
    ) AS recent_order_rows
  )
  SELECT jsonb_build_object(
    'revenue', (SELECT revenue FROM orders_cte),
    'orders', (SELECT order_count FROM orders_cte),
    'products', (SELECT product_count FROM products_cte),
    'customers', (SELECT customer_count FROM customers_cte),
    'lowStock', (SELECT low_stock FROM low_stock_cte),
    'topProducts', (SELECT top_products FROM top_products_cte),
    'recentOrders', (SELECT recent_orders FROM recent_orders_cte)
  )
  INTO result;

  RETURN result;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_admin_dashboard_stats() TO anon, authenticated;