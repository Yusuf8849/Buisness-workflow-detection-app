import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from 'lucide-react';
import { soundFX } from '../../utils/audioEffects';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastMessage {
  id: string;
  title: string;
  message?: string;
  type: ToastType;
  duration?: number;
}

interface ToastContextType {
  showToast: (toast: Omit<ToastMessage, 'id'>) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = useCallback(({ title, message, type = 'info', duration = 4000 }: Omit<ToastMessage, 'id'>) => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    const newToast: ToastMessage = { id, title, message, type, duration };

    if (type === 'success') {
      soundFX.playChime();
    } else if (type === 'error') {
      soundFX.playClick();
    }

    setToasts((prev) => [...prev, newToast]);

    if (duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    }
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      {/* 3. Notifications: Floating Toast Stream in Top-Right */}
      <div className="fixed top-20 right-4 sm:right-6 z-50 flex flex-col gap-3 pointer-events-none max-w-sm w-full">
        <AnimatePresence>
          {toasts.map((t) => {
            let borderStyle = 'border-[#00d4ff]/40 shadow-[0_0_30px_rgba(0,212,255,0.25)]';
            let icon = <Info className="w-5 h-5 text-[#00d4ff] shrink-0" />;
            let isError = t.type === 'error';

            if (t.type === 'success') {
              borderStyle = 'border-[#10b981]/50 shadow-[0_0_30px_rgba(16,185,129,0.35)]';
              icon = (
                <motion.div
                  initial={{ scale: 0.6, rotate: -20 }}
                  animate={{ scale: [0.6, 1.3, 1], rotate: [0, 10, 0] }}
                  transition={{ duration: 0.45 }}
                >
                  <CheckCircle2 className="w-5 h-5 text-[#10b981] shrink-0" />
                </motion.div>
              );
            } else if (t.type === 'error') {
              borderStyle = 'border-[#f43f5e]/50 shadow-[0_0_30px_rgba(244,63,94,0.35)]';
              icon = <XCircle className="w-5 h-5 text-[#f43f5e] shrink-0" />;
            } else if (t.type === 'warning') {
              borderStyle = 'border-[#f59e0b]/50 shadow-[0_0_30px_rgba(245,158,11,0.35)]';
              icon = <AlertTriangle className="w-5 h-5 text-[#f59e0b] shrink-0" />;
            }

            return (
              <motion.div
                key={t.id}
                initial={{ x: 100, opacity: 0, scale: 0.9 }}
                animate={
                  isError
                    ? { x: [100, 0, -8, 8, -5, 5, 0], opacity: 1, scale: 1 }
                    : { x: 0, opacity: 1, scale: 1 }
                }
                exit={{ x: 100, opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.45, ease: 'easeOut' }}
                className={`pointer-events-auto p-4 rounded-2xl bg-[#0a0e1a]/95 border backdrop-blur-[24px] flex items-start gap-3 relative overflow-hidden card-lift ${borderStyle}`}
              >
                {/* Auto-Dismiss Timer Bar */}
                <motion.div
                  initial={{ width: '100%' }}
                  animate={{ width: '0%' }}
                  transition={{ duration: (t.duration || 4000) / 1000, ease: 'linear' }}
                  className={`absolute bottom-0 left-0 h-1 ${
                    t.type === 'success'
                      ? 'bg-[#10b981]'
                      : t.type === 'error'
                      ? 'bg-[#f43f5e]'
                      : t.type === 'warning'
                      ? 'bg-[#f59e0b]'
                      : 'bg-[#00d4ff]'
                  }`}
                />

                {icon}

                <div className="flex-1 space-y-0.5">
                  <h4 className="text-xs font-bold text-[#e8edf5] font-display leading-tight">{t.title}</h4>
                  {t.message && (
                    <p className="text-[11px] text-slate-300 font-sans leading-relaxed">{t.message}</p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => removeToast(t.id)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
