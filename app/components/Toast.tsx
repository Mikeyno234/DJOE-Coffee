"use client";

import React, { useEffect } from "react";
import { CheckCircleIcon, ExclamationTriangleIcon, XMarkIcon } from "@heroicons/react/24/solid";

export interface ToastMessage {
  id: string;
  type: "success" | "error" | "info";
  text: string;
}

interface ToastProps {
  toast: ToastMessage | null;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ toast, onClose }) => {
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        onClose();
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toast, onClose]);

  if (!toast) return null;

  const isSuccess = toast.type === "success";

  return (
    <div className="fixed top-5 right-5 z-[99999] max-w-md w-full animate-slide-up no-print">
      <div
        className={`p-4 rounded-2xl shadow-2xl border flex items-center justify-between gap-3 backdrop-blur-md transition-all ${
          isSuccess
            ? "bg-[#543A14]/95 text-white border-[#F0BB78]/40 shadow-amber-950/40"
            : "bg-rose-950/95 text-white border-rose-400/40 shadow-rose-950/40"
        }`}
      >
        <div className="flex items-center gap-3">
          {isSuccess ? (
            <CheckCircleIcon className="w-6 h-6 text-[#F0BB78] shrink-0" />
          ) : (
            <ExclamationTriangleIcon className="w-6 h-6 text-rose-300 shrink-0" />
          )}

          <div>
            <p className="text-xs font-black uppercase tracking-wider text-amber-200">
              {isSuccess ? "Berhasil!" : "Terjadi Kesalahan"}
            </p>
            <p className="text-xs font-semibold text-stone-100 mt-0.5">{toast.text}</p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
        >
          <XMarkIcon className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
