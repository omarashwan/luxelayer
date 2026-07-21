import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL?.trim();
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY?.trim();

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY must be configured for the server.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

export function createSupabaseClient(accessToken) {
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    global: accessToken
      ? {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      : undefined,
  });
}

export async function createOrderRecord(orderPayload, client = supabase) {
  const { data, error } = await client.from('orders').insert(orderPayload).select().single();
  if (error) throw error;
  return data;
}

export async function createOrderItems(items, client = supabase) {
  const { error } = await client.from('order_items').insert(items);
  if (error) throw error;
}

export async function getProductById(productId, client = supabase) {
  const { data, error } = await client.from('products').select('id, name, stock, price, sale_price, is_published').eq('id', productId).maybeSingle();
  if (error) throw error;
  return data;
}

export async function updateOrder(id, updates, client = supabase) {
  const { data, error } = await client.from('orders').update(updates).eq('id', id).select().single();
  if (error) throw error;
  return data;
}

export async function getOrderByNumber(orderNumber, client = supabase) {
  const { data, error } = await client.from('orders').select('*').eq('order_number', orderNumber).maybeSingle();
  if (error) throw error;
  return data;
}

export async function getCouponByCode(code, client = supabase) {
  const { data, error } = await client
    .from('coupons')
    .select('*')
    .eq('code', code)
    .eq('is_active', true)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function logPaymentEvent(event, client = supabase) {
  const { error } = await client.from('payment_events').insert({
    order_id: event.order_id,
    event_type: event.event_type,
    provider: event.provider,
    status: event.status,
    payload: event.payload ?? null,
  });
  if (error) console.error('Failed to log payment event', error);
}

export async function createCheckoutOrder(orderData, itemsData, client = supabase) {
  const { data, error } = await client.from('orders').insert(orderData).select().single();
  if (error) throw error;

  if (Array.isArray(itemsData) && itemsData.length > 0) {
    const { error: itemsError } = await client.from('order_items').insert(itemsData.map((item) => ({
      ...item,
      order_id: data.id,
    })));
    if (itemsError) throw itemsError;
  }

  const { data: orderWithItems, error: fetchError } = await client
    .from('orders')
    .select('*, order_items(*)')
    .eq('id', data.id)
    .single();
  if (fetchError) throw fetchError;
  return orderWithItems;
}

export async function updateCheckoutPayment(
  orderNumber,
  status,
  paymentMethod,
  paymentStatus,
  notes = null,
  transactionId = null,
  paymentReference = null,
  paidAt = null,
  paymentResponse = null,
  client = supabase,
) {
  const updates = {
    status,
    payment_method: paymentMethod,
    payment_status: paymentStatus,
    notes,
    transaction_id: transactionId,
    payment_reference: paymentReference,
    paid_at: paidAt,
    payment_response: paymentResponse,
  };

  // Some deployments may lag behind the latest migration set.
  // If a new optional column is missing, retry without that column instead of failing checkout.
  const safeUpdates = { ...updates };
  for (let attempt = 0; attempt < 4; attempt += 1) {
    const { error } = await client.from('orders').update(safeUpdates).eq('order_number', orderNumber);
    if (!error) return;

    const missingColumnMatch = String(error.message || '').match(/'([^']+)' column/i);
    const missingColumn = missingColumnMatch?.[1];
    if (error.code === 'PGRST204' && missingColumn && Object.prototype.hasOwnProperty.call(safeUpdates, missingColumn)) {
      delete safeUpdates[missingColumn];
      continue;
    }

    throw error;
  }
}

export async function getCheckoutOrder(orderNumber, client = supabase) {
  const { data, error } = await client
    .from('orders')
    .select('*, order_items(*)')
    .eq('order_number', orderNumber)
    .single();
  if (error) throw error;
  return data;
}
