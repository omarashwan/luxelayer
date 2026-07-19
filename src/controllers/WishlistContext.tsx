import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { supabase } from '../models/supabase';
import { useAuth } from './AuthContext';
import type { Product, UUID, WishlistRow } from '../types';

interface WishlistContextValue {
  productIds: Set<UUID>;
  loading: boolean;
  toggle: (product: Product) => Promise<void>;
  has: (productId: UUID) => boolean;
  count: number;
}

const WishlistContext = createContext<WishlistContextValue | undefined>(undefined);
const LOCAL_KEY = 'luxelayer.wishlist.local.v1';

export function WishlistProvider({ children }: { children: ReactNode }) {
  const { session } = useAuth();
  const [remoteIds, setRemoteIds] = useState<Set<UUID>>(new Set());
  const [localIds, setLocalIds] = useState<Set<UUID>>(new Set());
  const [loading, setLoading] = useState(true);

  // Load local wishlist once
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LOCAL_KEY);
      if (raw) setLocalIds(new Set(JSON.parse(raw) as UUID[]));
    } catch {
      // ignore
    }
  }, []);

  // Load remote wishlist when signed in
  useEffect(() => {
    if (!session?.user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    supabase
      .from('wishlist')
      .select('product_id')
      .eq('user_id', session.user.id)
      .then(({ data }) => {
        setRemoteIds(new Set((data as WishlistRow[] | null)?.map((r) => r.product_id) ?? []));
        setLoading(false);
      });
  }, [session?.user]);

  // Persist local
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_KEY, JSON.stringify([...localIds]));
    } catch {
      // ignore
    }
  }, [localIds]);

  const productIds = useMemo(() => {
    const merged = new Set<UUID>(localIds);
    remoteIds.forEach((id) => merged.add(id));
    return merged;
  }, [localIds, remoteIds]);

  const has = useCallback((id: UUID) => productIds.has(id), [productIds]);

  const toggle = useCallback(
    async (product: Product) => {
      const id = product.id;
      // Optimistic
      if (session?.user) {
        const owned = remoteIds.has(id);
        setRemoteIds((prev) => {
          const next = new Set(prev);
          if (owned) next.delete(id);
          else next.add(id);
          return next;
        });
        if (owned) {
          await supabase.from('wishlist').delete().eq('user_id', session.user.id).eq('product_id', id);
        } else {
          await supabase.from('wishlist').insert({ user_id: session.user.id, product_id: id });
        }
      } else {
        setLocalIds((prev) => {
          const next = new Set(prev);
          if (next.has(id)) next.delete(id);
          else next.add(id);
          return next;
        });
      }
    },
    [session, remoteIds],
  );

  const value: WishlistContextValue = {
    productIds,
    loading,
    toggle,
    has,
    count: productIds.size,
  };

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error('useWishlist must be used within WishlistProvider');
  return ctx;
}
