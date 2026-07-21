import crypto from 'node:crypto';

const DEFAULT_BASE_URL = 'https://accept.paymob.com';
const DEFAULT_PAYMENT_URL_BASE = 'https://accept.paymob.com/unifiedcheckout';

function getPaymobConfig() {
  return {
    apiBaseUrl: process.env.PAYMOB_API_BASE_URL?.trim() || DEFAULT_BASE_URL,
    apiKey: process.env.PAYMOB_API_KEY?.trim(),
    secretKey: process.env.PAYMOB_SECRET_KEY?.trim() || process.env.PAYMOB_API_SECRET_KEY?.trim(),
    publicKey: process.env.PAYMOB_PUBLIC_KEY?.trim() || process.env.VITE_PAYMOB_PUBLIC_KEY?.trim(),
    integrationId: process.env.PAYMOB_INTEGRATION_ID?.trim(),
    paymentUrlBase: process.env.PAYMOB_PAYMENT_URL_BASE?.trim() || DEFAULT_PAYMENT_URL_BASE,
    webhookSecret: process.env.PAYMOB_HMAC_SECRET?.trim() || process.env.PAYMOB_WEBHOOK_SECRET?.trim() || process.env.PAYMOB_API_KEY?.trim(),
  };
}

async function requestJson(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });

  const raw = await response.text();
  let payload = null;
  if (raw) {
    try {
      payload = JSON.parse(raw);
    } catch {
      payload = raw;
    }
  }

  if (!response.ok) {
    if (response.status >= 400 && response.status < 500) {
      console.error('Paymob 4xx response', {
        url,
        status: response.status,
        headers: Object.fromEntries(response.headers.entries()),
        body: payload,
      });
    }

    const message = typeof payload === 'string'
      ? payload
      : payload?.message || payload?.error || payload?.detail || `Paymob request failed with ${response.status}`;
    const error = new Error(message);
    error.status = response.status;
    error.headers = Object.fromEntries(response.headers.entries());
    error.responseBody = payload;
    error.responseStatus = response.status;
    error.url = url;
    throw error;
  }

  return payload;
}

function stringifyValue(value) {
  if (value === null || value === undefined) return '';
  return typeof value === 'string' ? value : String(value);
}

function buildWebhookSignatureSource(payload) {
  const obj = payload?.obj || payload || {};
  const order = obj.order || payload?.order || {};
  const sourceData = obj.source_data || payload?.source_data || {};

  return [
    stringifyValue(obj.amount_cents ?? payload?.amount_cents),
    stringifyValue(obj.created_at ?? payload?.created_at),
    stringifyValue(obj.currency ?? payload?.currency),
    stringifyValue(obj.error_occured ?? payload?.error_occured),
    stringifyValue(obj.has_parent_transaction ?? payload?.has_parent_transaction),
    stringifyValue(obj.id ?? payload?.id),
    stringifyValue(obj.integration_id ?? payload?.integration_id),
    stringifyValue(obj.is_3d_secure ?? payload?.is_3d_secure),
    stringifyValue(obj.is_auth ?? payload?.is_auth),
    stringifyValue(obj.is_capture ?? payload?.is_capture),
    stringifyValue(obj.is_refunded ?? payload?.is_refunded),
    stringifyValue(obj.is_standalone_payment ?? payload?.is_standalone_payment),
    stringifyValue(obj.is_voided ?? payload?.is_voided),
    stringifyValue(order.id ?? payload?.order?.id ?? payload?.order_id),
    stringifyValue(obj.owner ?? payload?.owner),
    stringifyValue(obj.pending ?? payload?.pending),
    stringifyValue(sourceData.pan ?? payload?.source_data?.pan),
    stringifyValue(sourceData.sub_type ?? payload?.source_data?.sub_type),
    stringifyValue(sourceData.type ?? payload?.source_data?.type),
    stringifyValue(obj.success ?? payload?.success),
  ].join('');
}

export async function authenticatePaymob() {
  const { apiBaseUrl, apiKey } = getPaymobConfig();
  if (!apiKey) {
    throw new Error('PAYMOB_API_KEY is not configured.');
  }

  const payload = await requestJson(`${apiBaseUrl}/api/auth/tokens`, {
    method: 'POST',
    body: JSON.stringify({ api_key: apiKey }),
  });

  if (!payload?.token) {
    throw new Error('Paymob authentication response did not contain a token.');
  }

  return payload.token;
}

export async function createPaymobIntention({ amountCents, currency, merchantOrderId, billingData, items = [], paymentMethodIds = [], redirectionUrl, notificationUrl }) {
  const { apiBaseUrl, secretKey, integrationId } = getPaymobConfig();
  const authSecret = secretKey;
  if (!authSecret) {
    throw new Error('PAYMOB_SECRET_KEY is not configured.');
  }

  const paymentMethods = paymentMethodIds.length > 0 ? paymentMethodIds : (integrationId ? [Number(integrationId)] : []);

  const payload = await requestJson(`${apiBaseUrl}/v1/intention/`, {
    method: 'POST',
    headers: {
      Authorization: `Token ${authSecret}`,
    },
    body: JSON.stringify({
      amount: amountCents,
      currency,
      payment_methods: paymentMethods,
      items,
      billing_data: {
        apartment: billingData?.address2 || '',
        email: billingData?.email,
        floor: '',
        first_name: billingData?.firstName,
        street: billingData?.address1,
        building: '',
        phone_number: billingData?.phone,
        postal_code: billingData?.postalCode,
        city: billingData?.city,
        state: billingData?.state,
        country: billingData?.country,
        last_name: billingData?.lastName,
      },
      special_reference: merchantOrderId,
      redirection_url: redirectionUrl,
      notification_url: notificationUrl,
    }),
  });

  if (!payload?.client_secret) {
    throw new Error('Paymob intention response did not include a client_secret.');
  }

  return payload;
}

export async function getPaymobTransaction(authToken, transactionId) {
  if (!transactionId) {
    return null;
  }

  const { apiBaseUrl } = getPaymobConfig();
  const transactionPath = `/acceptance/transactions/${encodeURIComponent(transactionId)}`;
  try {
    return await requestJson(`${apiBaseUrl}${transactionPath}`, {
      method: 'GET',
      headers: {
        Authorization: `Token ${authToken}`,
      },
    });
  } catch (error) {
    if (error?.responseStatus === 404) {
      try {
        return await requestJson(`${apiBaseUrl}/api${transactionPath}`, {
          method: 'GET',
          headers: {
            Authorization: `Token ${authToken}`,
          },
        });
      } catch (retryError) {
        console.error('Failed to fetch Paymob transaction details', retryError);
        return null;
      }
    }
    console.error('Failed to fetch Paymob transaction details', error);
    return null;
  }
}

export function buildPaymentUrl(token) {
  const { paymentUrlBase } = getPaymobConfig();
  if (!token) {
    throw new Error('Payment token is missing.');
  }
  const { publicKey } = getPaymobConfig();
  if (!publicKey) {
    throw new Error('PAYMOB_PUBLIC_KEY is not configured.');
  }
  return `${paymentUrlBase}/?publicKey=${encodeURIComponent(publicKey)}&clientSecret=${encodeURIComponent(token)}`;
}

export function verifyWebhookSignature(payload, signature, rawBody = '') {
  const { webhookSecret } = getPaymobConfig();
  if (!webhookSecret) {
    throw new Error('PAYMOB_HMAC_SECRET, PAYMOB_WEBHOOK_SECRET, or PAYMOB_API_KEY must be configured for webhook verification.');
  }

  const signatures = [signature, signature?.trim(), signature?.replace(/^sha256=/i, '')].filter(Boolean);
  if (signatures.length === 0) {
    return false;
  }

  const canonicalSource = buildWebhookSignatureSource(payload);
  const canonicalDigest = crypto.createHmac('sha256', webhookSecret).update(canonicalSource).digest('hex');
  const rawDigest = rawBody ? crypto.createHmac('sha256', webhookSecret).update(rawBody).digest('hex') : null;

  return signatures.some((candidate) => candidate === canonicalDigest || candidate === `sha256=${canonicalDigest}` || (rawDigest ? candidate === rawDigest || candidate === `sha256=${rawDigest}` : false));
}
