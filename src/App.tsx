import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './controllers/AuthContext';
import { CartProvider } from './controllers/CartContext';
import { ToastProvider } from './controllers/ToastContext';
import { WishlistProvider } from './controllers/WishlistContext';
import { Layout } from './components/layout/Layout';
import { Toaster } from './components/ui/Toaster';
import { HomePage } from './pages/HomePage';
import { ShopPage } from './pages/ShopPage';
import { ProductPage } from './pages/ProductPage';
import { BrandsPage } from './pages/BrandsPage';
import { BrandDetailPage } from './pages/BrandDetailPage';
import { JournalPage } from './pages/JournalPage';
import { FaqPage } from './pages/FaqPage';
import { ContactPage } from './pages/ContactPage';
import { AuthPage } from './pages/AuthPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/ResetPasswordPage';
import { AccountPage } from './pages/AccountPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { OrderConfirmationPage } from './pages/OrderConfirmationPage';
import { AdminPage } from './pages/admin/AdminPage';
import { StaticPage } from './pages/StaticPage';
import type { JSX } from 'react';

function ProtectedRoute({ children }: { children: JSX.Element }) {
  const { session, loading } = useAuth();
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-ivory">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-champagne-300 border-t-champagne-500" />
      </div>
    );
  }
  if (!session) return <Navigate to="/auth?redirect=/account" replace />;
  return children;
}

function AdminRoute({ children }: { children: JSX.Element }) {
  const { session, profile, loading } = useAuth();
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-ink-900">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-champagne-300 border-t-champagne-500" />
      </div>
    );
  }
  if (!session) return <Navigate to="/auth?redirect=/admin" replace />;
  if (!profile?.is_admin) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <CartProvider>
            <WishlistProvider>
              <Routes>
                <Route element={<Layout />}>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/shop" element={<ShopPage />} />
                  <Route path="/product/:slug" element={<ProductPage />} />
                  <Route path="/brands" element={<BrandsPage />} />
                  <Route path="/brands/:slug" element={<BrandDetailPage />} />
                  <Route path="/journal" element={<JournalPage />} />
                  <Route path="/faq" element={<FaqPage />} />
                  <Route path="/contact" element={<ContactPage />} />
                  <Route path="/auth" element={<AuthPage />} />
                  <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                  <Route path="/reset-password" element={<ResetPasswordPage />} />
                  <Route path="/checkout" element={<CheckoutPage />} />
                  <Route path="/order/:orderNumber" element={<OrderConfirmationPage />} />
                  <Route path="/account" element={<ProtectedRoute><AccountPage /></ProtectedRoute>} />
                  <Route path="/shipping" element={<StaticPage slug="shipping" />} />
                  <Route path="/privacy" element={<StaticPage slug="privacy" />} />
                  <Route path="/terms" element={<StaticPage slug="terms" />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Route>
                <Route path="/admin" element={<AdminRoute><AdminPage /></AdminRoute>} />
              </Routes>
              <Toaster />
            </WishlistProvider>
          </CartProvider>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
