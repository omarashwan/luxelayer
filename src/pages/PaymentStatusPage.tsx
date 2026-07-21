import { useEffect, useMemo } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle2, XCircle, Home, Package } from 'lucide-react';

export function PaymentStatusPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const isSuccess = location.pathname === '/payment-success';

  const query = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const orderNumber = query.get('orderNumber') || 'your order';

  useEffect(() => {
    if (!location.pathname.startsWith('/payment-')) {
      navigate('/');
    }
  }, [location.pathname, navigate]);

  return (
    <div className="flex min-h-[70vh] items-center justify-center bg-ivory px-4 py-10">
      <div className="w-full max-w-xl rounded-3xl border border-ink-100 bg-warmwhite p-8 text-center shadow-luxe-sm">
        {isSuccess ? (
          <CheckCircle2 className="mx-auto h-14 w-14 text-emerald-600" />
        ) : (
          <XCircle className="mx-auto h-14 w-14 text-red-600" />
        )}
        <h1 className="mt-6 font-display text-3xl text-ink-900">
          {isSuccess ? 'Payment successful' : 'Payment could not be completed'}
        </h1>
        <p className="mt-3 text-sm text-ink-600">
          {isSuccess
            ? `Your order ${orderNumber} has been received and is now being processed.`
            : `We could not complete the payment for ${orderNumber}. You can try again from your order summary.`}
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link to="/account?tab=orders" className="btn-primary flex items-center gap-2">
            <Package className="h-4 w-4" /> View orders
          </Link>
          <Link to="/" className="btn-ghost flex items-center gap-2">
            <Home className="h-4 w-4" /> Continue shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
