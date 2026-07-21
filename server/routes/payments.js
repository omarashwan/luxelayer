import express from 'express';
import { createCheckoutOrder, createSupabaseClient, getCheckoutOrder, getCouponByCode, getProductById, logPaymentEvent, updateCheckoutPayment } from '../services/supabaseService.js';
import { authenticatePaymob, buildPaymentUrl, createPaymobIntention, getPaymobTransaction, verifyWebhookSignature } from '../services/paymobService.js';
import { convertAmount, normalizeCurrency } from '../services/currency.js';

const router = express.Router();

const checkoutSessionTokens = new Map();

const PAYMENT_METHODS = {
  card: 'Credit / Debit Card',
  cash_on_delivery: 'Cash on Delivery',
};

function getFrontendBaseUrl() {
  return process.env.APP_BASE_URL?.trim() || 'http://localhost:5173';
}

function getServerBaseUrl() {
  return process.env.PAYMENTS_SERVER_BASE_URL?.trim() || 'http://localhost:4000';
}

function getRequestAccessToken(req) {
  const headerToken = String(req.get('authorization') || '').replace(/^Bearer\s+/i, '').trim();
  const bodyToken = String(req.body?.accessToken || '').trim();
  return headerToken || bodyToken;
}

async function getAuthenticatedUser(client) {
  const { data, error } = await client.auth.getUser();
  if (error) throw error;
  if (!data?.user?.id) {
    throw new Error('Authenticated user not found. Please sign in again.');
  }
  return data.user;
}

function generateOrderNumber() {
  const now = new Date();
  const stamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
  const suffix = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `LUXE-${stamp}-${suffix}`;
}

function calculateShipping(subtotal, method) {
  if (method === 'express') return 18.95;
  if (method === 'overnight') return 34.95;
  return subtotal >= 75 ? 0 : 7.95;
}

function calculateTax(subtotal) {
  return Number((subtotal * 0.08).toFixed(2));
}

function sanitizeShippingData(body) {
  return {
    firstName: String(body?.shipping?.firstName || body?.ship?.firstName || '').trim(),
    lastName: String(body?.shipping?.lastName || body?.ship?.lastName || '').trim(),
    email: String(body?.shipping?.email || body?.ship?.email || '').trim(),
    address1: String(body?.shipping?.address1 || body?.ship?.address1 || '').trim(),
    address2: String(body?.shipping?.address2 || body?.ship?.address2 || '').trim(),
    city: String(body?.shipping?.city || body?.ship?.city || '').trim(),
    state: String(body?.shipping?.state || body?.ship?.state || '').trim(),
    postalCode: String(body?.shipping?.postalCode || body?.ship?.postalCode || '').trim(),
    country: String(body?.shipping?.country || body?.ship?.country || 'United States').trim(),
    phone: String(body?.shipping?.phone || body?.ship?.phone || '').trim(),
    method: String(body?.shipping?.method || body?.ship?.method || 'standard').trim(),
  };
}

function normalizePaymentMethod(value) {
  return value === 'cash_on_delivery' ? 'cash_on_delivery' : 'card';
}

function getPaymentLabel(paymentMethod) {
  return PAYMENT_METHODS[paymentMethod] || PAYMENT_METHODS.card;
}

function calculatePaymentAmount(total, paymentMethod) {
  return paymentMethod === 'cash_on_delivery' ? Number((total * 0.2).toFixed(2)) : Number(total.toFixed(2));
}

function getPaymentStatus(paymentMethod) {
  return paymentMethod === 'cash_on_delivery' ? 'deposit_paid' : 'paid';
}

function getOrderStatus(paymentMethod) {
  return paymentMethod === 'cash_on_delivery' ? 'awaiting_cod' : 'paid';
}

function isCashOnDeliveryOrder(order) {
  return String(order?.payment_method || '').toLowerCase().includes('cash');
}

function extractCardBrand(transaction) {
  const brand = String(transaction?.source_data?.sub_type || transaction?.obj?.source_data?.sub_type || '').trim();
  if (!brand) return 'Credit / Debit Card';
  const lower = brand.toLowerCase();
  if (lower.includes('visa')) return 'Visa';
  if (lower.includes('master')) return 'Mastercard';
  return brand;
}

function extractTransactionId(payload) {
  return String(payload?.obj?.id || payload?.transaction?.id || payload?.id || '').trim();
}

function extractMerchantOrderId(payload) {
  return String(payload?.obj?.merchant_order_id || payload?.merchant_order_id || payload?.order?.merchant_order_id || '').trim();
}

function extractCallbackSuccess(payload) {
  const successFlag = payload?.obj?.success ?? payload?.success;
  const pendingFlag = payload?.obj?.pending ?? payload?.pending;
  const errorFlag = payload?.obj?.error_occured ?? payload?.error_occured;

  if (successFlag === true || successFlag === 'true') return true;
  if (pendingFlag === false && !errorFlag) return true;
  return false;
}

async function verifyTransactionWithPaymob(order, transactionId, expectedAmountCents) {
  const authToken = await authenticatePaymob();
  const transaction = await getPaymobTransaction(authToken, transactionId);
  if (!transaction) {
    return { verified: false, transaction: null };
  }

  const transactionObject = transaction.obj || transaction;
  const receivedAmountCents = Number(transactionObject.amount_cents ?? transaction.amount_cents ?? 0);
  const merchantOrderId = String(transactionObject.merchant_order_id || transaction.merchant_order_id || transactionObject.order?.merchant_order_id || '').trim();
  const success = transactionObject.success === true || transaction.success === true || transactionObject.pending === false && !transactionObject.error_occured;

  if (merchantOrderId && merchantOrderId !== order.order_number) {
    return { verified: false, transaction: transactionObject };
  }

  if (expectedAmountCents && receivedAmountCents && receivedAmountCents !== expectedAmountCents) {
    return { verified: false, transaction: transactionObject };
  }

  if (!success) {
    return { verified: false, transaction: transactionObject };
  }

  return { verified: true, transaction: transactionObject };
}

router.post('/create-order', async (req, res) => {
  try {
    const { items = [], shipping = {}, couponCode = '', giftWrap = false, giftNote = '', paymentMethod = 'card' } = req.body || {};
    const currency = normalizeCurrency(req.body?.currency || process.env.PAYMOB_CURRENCY || 'EGP');
    const accessToken = getRequestAccessToken(req);
    if (!accessToken) {
      return res.status(401).json({ success: false, message: 'Authentication is required to create an order.' });
    }

    const client = createSupabaseClient(accessToken);
    const user = await getAuthenticatedUser(client);
    const selectedPaymentMethod = normalizePaymentMethod(paymentMethod);

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Cart is empty.' });
    }

    const shippingData = sanitizeShippingData({ shipping, ship: shipping });
    if (!shippingData.firstName || !shippingData.lastName || !shippingData.email || !shippingData.address1 || !shippingData.city || !shippingData.postalCode) {
      return res.status(400).json({ success: false, message: 'Please complete your shipping details.' });
    }
    if (!shippingData.phone) {
      return res.status(400).json({ success: false, message: 'Please provide a phone number for Paymob checkout.' });
    }

    const normalizedItems = [];
    let subtotal = 0;

    for (const item of items) {
      const productId = item.productId || item.product_id;
      if (!productId) {
        return res.status(400).json({ success: false, message: 'Each cart item must include a product id.' });
      }

      const product = await getProductById(productId, client);
      if (!product) {
        return res.status(404).json({ success: false, message: `Product ${productId} was not found.` });
      }
      if (!product.is_published) {
        return res.status(409).json({ success: false, message: `Product ${product.name} is currently unavailable.` });
      }

      const quantity = Number(item.quantity || 1);
      if (product.stock < quantity) {
        return res.status(409).json({ success: false, message: `Insufficient stock for ${product.name}.` });
      }

      const unitPrice = Number(product.sale_price ?? product.price ?? 0);
      const lineTotal = unitPrice * quantity;
      subtotal += lineTotal;
      normalizedItems.push({
        productId,
        name: product.name,
        quantity,
        unitPrice,
        lineTotal,
      });
    }

    const shippingAmount = calculateShipping(subtotal, shippingData.method);
    const taxAmount = calculateTax(subtotal);

    let discountAmount = 0;
    const normalizedCouponCode = String(couponCode || '').trim().toUpperCase();
    if (normalizedCouponCode) {
      const coupon = await getCouponByCode(normalizedCouponCode, client);
      if (coupon) {
        if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
          return res.status(409).json({ success: false, message: 'This coupon has expired.' });
        }
        if (coupon.max_uses && coupon.used_count >= coupon.max_uses) {
          return res.status(409).json({ success: false, message: 'This coupon has reached its usage limit.' });
        }
        if (subtotal < Number(coupon.min_purchase || 0)) {
          return res.status(409).json({ success: false, message: 'Cart subtotal does not meet the coupon minimum.' });
        }

        if (coupon.discount_type === 'percentage') {
          discountAmount = Number(((subtotal * Number(coupon.discount_value)) / 100).toFixed(2));
        } else if (coupon.discount_type === 'fixed') {
          discountAmount = Number(Math.min(Number(coupon.discount_value), subtotal).toFixed(2));
        }
      }
    }

    const totalAmount = Number((subtotal + shippingAmount + taxAmount - discountAmount).toFixed(2));
    const paymentAmount = calculatePaymentAmount(totalAmount, selectedPaymentMethod);
    const paymobAmount = convertAmount(paymentAmount, currency);
    const paymentAmountCents = Math.round(paymobAmount * 100);
    const orderNumber = generateOrderNumber();
    const paymentLabel = getPaymentLabel(selectedPaymentMethod);

    const orderPayload = {
      order_number: orderNumber,
      user_id: user.id,
      email: shippingData.email,
      status: 'pending',
      subtotal: Number(subtotal.toFixed(2)),
      discount: Number(discountAmount.toFixed(2)),
      shipping: Number(shippingAmount.toFixed(2)),
      tax: Number(taxAmount.toFixed(2)),
      total: Number(totalAmount.toFixed(2)),
      coupon_code: normalizedCouponCode || null,
      shipping_first_name: shippingData.firstName,
      shipping_last_name: shippingData.lastName,
      shipping_address1: shippingData.address1,
      shipping_address2: shippingData.address2,
      shipping_city: shippingData.city,
      shipping_state: shippingData.state,
      shipping_postal_code: shippingData.postalCode,
      shipping_country: shippingData.country,
      shipping_phone: shippingData.phone,
      shipping_method: shippingData.method,
      payment_method: paymentLabel,
      payment_status: 'unpaid',
      gift_wrap: Boolean(giftWrap),
      notes: giftNote || null,
    };

    const orderItems = normalizedItems.map((item) => ({
      product_id: item.productId,
      name: item.name,
      slug: item.name.toLowerCase().replace(/\s+/g, '-'),
      image_url: null,
      shade: null,
      size: null,
      unit_price: item.unitPrice,
      quantity: item.quantity,
      total: item.lineTotal,
    }));

    const order = await createCheckoutOrder(orderPayload, orderItems, client);

    await logPaymentEvent({
      order_id: order.id,
      event_type: 'payment_created',
      provider: 'paymob',
      status: 'pending',
      payload: {
        orderNumber,
        paymentMethod: selectedPaymentMethod,
        paymentLabel,
        paymentAmount,
        paymentAmountCents,
        totalAmount,
      },
    }, client);

    const paymentIntention = await createPaymobIntention({
      amountCents: paymentAmountCents,
      currency,
      merchantOrderId: orderNumber,
      billingData: shippingData,
      redirectionUrl: `${getServerBaseUrl()}/api/payments/return?orderNumber=${encodeURIComponent(orderNumber)}`,
      notificationUrl: `${getServerBaseUrl()}/api/payments/webhook`,
    });

    const paymentUrl = buildPaymentUrl(paymentIntention.client_secret);

    checkoutSessionTokens.set(orderNumber, accessToken);

    return res.status(200).json({
      success: true,
      orderNumber,
      paymentUrl,
      paymentAmount,
      paymentMethod: selectedPaymentMethod,
      paymentLabel,
      paymentMode: selectedPaymentMethod === 'cash_on_delivery' ? 'deposit' : 'full',
      message: 'Payment initialized.',
    });
  } catch (error) {
    console.error(error instanceof Error ? error.stack : error);
    console.error('Paymob URL:', error?.url ?? null);
    console.error('Response status:', error?.responseStatus ?? error?.status ?? null);
    console.error('Response headers:', error?.headers ?? null);
    console.error('Response body:', error?.responseBody ?? error?.details ?? null);
    return res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Payment initialization failed.',
      error: error instanceof Error ? error.message : 'Payment initialization failed.',
      code: error?.code ?? null,
      details: error?.details ?? null,
      hint: error?.hint ?? null,
    });
  }
});

router.get('/return', async (req, res) => {
  try {
    const orderNumber = String(req.query.orderNumber || '').trim();
    const accessToken = String(req.query.auth || '').trim() || checkoutSessionTokens.get(orderNumber) || '';
    if (!orderNumber) {
      return res.redirect(`${getFrontendBaseUrl()}/checkout?payment=failed`);
    }

    if (!accessToken) {
      return res.redirect(`${getFrontendBaseUrl()}/checkout?payment=failed`);
    }

    const client = createSupabaseClient(accessToken);
    const order = await getCheckoutOrder(orderNumber, client);
    if (!order) {
      return res.redirect(`${getFrontendBaseUrl()}/checkout?payment=failed`);
    }

    const callbackSuccess = extractCallbackSuccess(req.query);
    const transactionId = String(req.query.id || req.query.transaction_id || req.query.transactionId || '').trim();
    const expectedPaymentMethod = isCashOnDeliveryOrder(order) ? 'cash_on_delivery' : 'card';
    const expectedAmount = calculatePaymentAmount(Number(order.total || 0), expectedPaymentMethod);
    const expectedCurrency = normalizeCurrency(process.env.PAYMOB_CURRENCY || 'EGP');
    const expectedPaymobAmount = convertAmount(expectedAmount, expectedCurrency);
    const expectedAmountCents = Math.round(expectedPaymobAmount * 100);

    let verification = null;
    if (transactionId) {
      verification = await verifyTransactionWithPaymob(order, transactionId, expectedAmountCents);
    }

    if (!callbackSuccess && !verification?.verified) {
      await updateCheckoutPayment(
        orderNumber,
        'failed',
        order.payment_method || PAYMENT_METHODS.card,
        'failed',
        'Paymob payment was cancelled or failed.',
        transactionId || null,
        'failed_payment',
        new Date().toISOString(),
        { callback: req.query, source: 'redirect', status: 'failed' },
        client,
      );
      await logPaymentEvent({
        order_id: order.id,
        event_type: 'payment_failed',
        provider: 'paymob',
        status: 'failed',
        payload: { callback: req.query, source: 'redirect', status: 'failed' },
      }, client);
      return res.redirect(`${getFrontendBaseUrl()}/checkout?payment=failed`);
    }

    if (!transactionId) {
      await updateCheckoutPayment(
        orderNumber,
        'failed',
        order.payment_method || PAYMENT_METHODS.card,
        'failed',
        'Paymob returned a success flag without a transaction id.',
        null,
        'verification_failed',
        new Date().toISOString(),
        { callback: req.query, source: 'redirect', status: 'missing_transaction_id' },
        client,
      );
      await logPaymentEvent({
        order_id: order.id,
        event_type: 'payment_failed',
        provider: 'paymob',
        status: 'failed',
        payload: { callback: req.query, source: 'redirect', status: 'missing_transaction_id' },
      }, client);
      return res.redirect(`${getFrontendBaseUrl()}/checkout?payment=failed`);
    }

    if ((!verification || !verification.verified) && !callbackSuccess) {
      await updateCheckoutPayment(
        orderNumber,
        'failed',
        order.payment_method || PAYMENT_METHODS.card,
        'failed',
        'Paymob transaction verification failed.',
        transactionId,
        'verification_failed',
        new Date().toISOString(),
        { callback: req.query, transaction: verification.transaction, source: 'redirect' },
        client,
      );
      await logPaymentEvent({
        order_id: order.id,
        event_type: 'payment_failed',
        provider: 'paymob',
        status: 'failed',
        payload: { callback: req.query, transaction: verification.transaction, source: 'redirect' },
      }, client);
      return res.redirect(`${getFrontendBaseUrl()}/checkout?payment=failed`);
    }

    const transaction = verification?.transaction || (transactionId ? { id: transactionId, unverified: true } : null);
    const paymentMethodLabel = expectedPaymentMethod === 'cash_on_delivery' ? PAYMENT_METHODS.cash_on_delivery : extractCardBrand(transaction || req.query);
    const paymentStatus = getPaymentStatus(expectedPaymentMethod);
    const orderStatus = getOrderStatus(expectedPaymentMethod);
    const paymentReference = expectedPaymentMethod === 'cash_on_delivery' ? '20% deposit' : 'full payment';
    const paymentResponse = {
      callback: req.query,
      transaction,
      paymentMethod: expectedPaymentMethod,
      paymentAmount: expectedAmount,
      paymentAmountCents: expectedAmountCents,
    };

    await updateCheckoutPayment(
      orderNumber,
      orderStatus,
      paymentMethodLabel,
      paymentStatus,
      expectedPaymentMethod === 'cash_on_delivery' ? 'Cash on Delivery deposit received.' : 'Card payment received.',
      transactionId || null,
      paymentReference,
      new Date().toISOString(),
      paymentResponse,
      client,
    );

    await logPaymentEvent({
      order_id: order.id,
      event_type: expectedPaymentMethod === 'cash_on_delivery' ? 'deposit_paid' : 'payment_succeeded',
      provider: 'paymob',
      status: 'paid',
      payload: paymentResponse,
    }, client);

    checkoutSessionTokens.delete(orderNumber);

    return res.redirect(`${getFrontendBaseUrl()}/order/${encodeURIComponent(orderNumber)}?payment=success`);
  } catch (error) {
    console.error('Payment return redirect failed', error);
    return res.redirect(`${getFrontendBaseUrl()}/checkout?payment=failed`);
  }
});

router.post('/webhook', async (req, res) => {
  try {
    const rawBody = req.rawBody || JSON.stringify(req.body || {});
    const signature = req.get('x-paymob-signature') || req.get('x-paymob-hmac') || req.get('x-hub-signature') || req.body?.signature || req.body?.hmac || req.query?.hmac;
    if (!verifyWebhookSignature(req.body || {}, signature, rawBody)) {
      return res.status(401).json({ success: false, message: 'Webhook signature verification failed.' });
    }

    const payload = req.body || {};
    const orderNumber = extractMerchantOrderId(payload);
    if (!orderNumber) {
      return res.status(400).json({ success: false, message: 'Missing merchant order id in webhook payload.' });
    }

    const client = createSupabaseClient(null);
    const accessToken = checkoutSessionTokens.get(orderNumber);
    const authedClient = accessToken ? createSupabaseClient(accessToken) : client;
    const order = await getCheckoutOrder(orderNumber, authedClient);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found for webhook.' });
    }

    const transactionId = extractTransactionId(payload);
    const callbackSuccess = extractCallbackSuccess(payload);
    const expectedPaymentMethod = isCashOnDeliveryOrder(order) ? 'cash_on_delivery' : 'card';
    const expectedAmount = calculatePaymentAmount(Number(order.total || 0), expectedPaymentMethod);
    const expectedCurrency = normalizeCurrency(process.env.PAYMOB_CURRENCY || 'EGP');
    const expectedPaymobAmount = convertAmount(expectedAmount, expectedCurrency);
    const expectedAmountCents = Math.round(expectedPaymobAmount * 100);

    let transaction = payload?.obj || payload?.transaction || payload;
    if (transactionId) {
      const verification = await verifyTransactionWithPaymob(order, transactionId, expectedAmountCents);
      if (!verification.verified && !callbackSuccess) {
        await updateCheckoutPayment(
          orderNumber,
          'failed',
          order.payment_method || PAYMENT_METHODS.card,
          'failed',
          'Paymob transaction verification failed.',
          transactionId,
          'verification_failed',
          new Date().toISOString(),
          { webhook: payload, transaction: verification.transaction, source: 'webhook' },
          authedClient,
        );
        await logPaymentEvent({
          order_id: order.id,
          event_type: 'payment_failed',
          provider: 'paymob',
          status: 'failed',
          payload: { webhook: payload, transaction: verification.transaction },
        }, authedClient);
        return res.status(200).json({ success: true, message: 'Webhook acknowledged.' });
      }
      transaction = verification.transaction || transaction;
    }

    if (!callbackSuccess) {
      await updateCheckoutPayment(
        orderNumber,
        'failed',
        order.payment_method || PAYMENT_METHODS.card,
        'failed',
        'Paymob payment failed.',
        transactionId || null,
        'failed_payment',
        new Date().toISOString(),
        { webhook: payload, transaction, source: 'webhook', status: 'failed' },
        authedClient,
      );
      await logPaymentEvent({
        order_id: order.id,
        event_type: 'payment_failed',
        provider: 'paymob',
        status: 'failed',
        payload: { webhook: payload, transaction, source: 'webhook' },
      }, authedClient);
      return res.status(200).json({ success: true, message: 'Webhook acknowledged.' });
    }

    const paymentMethodLabel = expectedPaymentMethod === 'cash_on_delivery' ? PAYMENT_METHODS.cash_on_delivery : extractCardBrand(transaction);
    const paymentStatus = getPaymentStatus(expectedPaymentMethod);
    const orderStatus = getOrderStatus(expectedPaymentMethod);
    const paymentReference = expectedPaymentMethod === 'cash_on_delivery' ? '20% deposit' : 'full payment';
    const paymentResponse = {
      webhook: payload,
      transaction,
      paymentMethod: expectedPaymentMethod,
      paymentAmount: expectedAmount,
      paymentAmountCents: expectedAmountCents,
    };

    await updateCheckoutPayment(
      orderNumber,
      orderStatus,
      paymentMethodLabel,
      paymentStatus,
      expectedPaymentMethod === 'cash_on_delivery' ? 'Cash on Delivery deposit received.' : 'Card payment received.',
      transactionId || null,
      paymentReference,
      new Date().toISOString(),
      paymentResponse,
      authedClient,
    );

    await logPaymentEvent({
      order_id: order.id,
      event_type: expectedPaymentMethod === 'cash_on_delivery' ? 'deposit_paid' : 'payment_succeeded',
      provider: 'paymob',
      status: 'paid',
      payload: paymentResponse,
    }, authedClient);

    checkoutSessionTokens.delete(orderNumber);

    return res.status(200).json({ success: true, message: 'Webhook acknowledged.' });
  } catch (error) {
    console.error('Webhook processing failed', error);
    return res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Webhook processing failed.' });
  }
});

router.get('/health', (_req, res) => {
  res.json({ success: true, message: 'Payments service is healthy.' });
});

export default router;
