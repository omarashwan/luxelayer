import { motion, AnimatePresence } from 'framer-motion';
import { Check, AlertCircle, Info, X } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { classNames } from '../../lib/utils';

export function Toaster() {
  const { toasts, dismiss } = useToast();
  return (
    <div className="fixed bottom-6 right-6 z-[200] flex flex-col items-end gap-3">
      <AnimatePresence>
        {toasts.map((t) => {
          const Icon = t.type === 'success' ? Check : t.type === 'error' ? AlertCircle : Info;
          return (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 24, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: 40, scale: 0.9 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className={classNames(
                'flex items-start gap-3 rounded-2xl bg-warmwhite px-5 py-4 shadow-luxe-lg ring-1 ring-ink-100/60 max-w-sm',
              )}
            >
              <span
                className={classNames(
                  'mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full',
                  t.type === 'success' && 'bg-emerald-100 text-emerald-700',
                  t.type === 'error' && 'bg-rose-100 text-rose-700',
                  t.type === 'info' && 'bg-champagne-100 text-champagne-700',
                )}
              >
                <Icon className="h-3.5 w-3.5" strokeWidth={2.5} />
              </span>
              <p className="text-sm font-medium text-ink-800 leading-relaxed">{t.message}</p>
              <button
                onClick={() => dismiss(t.id)}
                className="ml-1 text-ink-400 transition hover:text-ink-700"
                aria-label="Dismiss"
              >
                <X className="h-4 w-4" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
