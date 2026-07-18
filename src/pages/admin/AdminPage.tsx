import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AdminShell } from './AdminShell';
import { AdminDashboard } from './AdminDashboard';
import { AdminProducts } from './AdminProducts';
import { AdminOrders } from './AdminOrders';
import { AdminBrands } from './AdminBrands';
import { AdminCategories } from './AdminCategories';
import { AdminCoupons } from './AdminCoupons';
import { AdminCustomers } from './AdminCustomers';
import { AdminContent } from './AdminContent';

export function AdminPage() {
  const [params, setParams] = useSearchParams();
  const active = params.get('tab') ?? 'dashboard';

  const setActive = (id: string) => setParams({ tab: id });

  return (
    <AdminShell active={active} onNavigate={setActive}>
      {active === 'dashboard' && <AdminDashboard />}
      {active === 'products' && <AdminProducts />}
      {active === 'orders' && <AdminOrders />}
      {active === 'brands' && <AdminBrands />}
      {active === 'categories' && <AdminCategories />}
      {active === 'coupons' && <AdminCoupons />}
      {active === 'customers' && <AdminCustomers />}
      {active === 'content' && <AdminContent />}
    </AdminShell>
  );
}
