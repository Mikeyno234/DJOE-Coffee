"use client";

import React, { useEffect } from "react";
import { CheckCircleIcon, ExclamationTriangleIcon, XMarkIcon } from "@heroicons/react/24/solid";

export interface ToastMessage {
  id: string;
  type: "success" | "error" | "info";
  text: string;
}

interface ToastItemProps {
  toast: ToastMessage;
  onClose: (id: string) => void;
}

export const ToastItem: React.FC<ToastItemProps> = ({ toast, onClose }) => {
  useEffect(() => {
    // Auto dismiss after 6 seconds
    const timer = setTimeout(() => {
      onClose(toast.id);
    }, 6000);
    return () => clearTimeout(timer);
  }, [toast, onClose]);

  const isSuccess = toast.type === "success";

  return (
    <div
      className={`px-4 py-3 rounded-xl shadow-xl border flex items-center justify-between gap-3 transition-all duration-300 transform animate-slide-up ${
        isSuccess
          ? "bg-stone-900/95 text-white border-stone-800 backdrop-blur-md"
          : "bg-rose-950/95 text-white border-rose-800 backdrop-blur-md"
      }`}
    >
      <div className="flex items-center gap-2.5 min-w-0">
        {isSuccess ? (
          <CheckCircleIcon className="w-4 h-4 text-emerald-400 shrink-0" />
        ) : (
          <ExclamationTriangleIcon className="w-4 h-4 text-rose-400 shrink-0" />
        )}
        <p className="text-xs font-medium text-stone-100 truncate">{toast.text}</p>
      </div>

      <button
        onClick={() => onClose(toast.id)}
        className="p-1 rounded-lg text-stone-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer shrink-0"
      >
        <XMarkIcon className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};

interface ToastProps {
  toasts?: ToastMessage[];
  toast?: ToastMessage | null;
  onClose: (id?: string) => void;
}

export const Toast: React.FC<ToastProps> = ({ toasts, toast, onClose }) => {
  const list: ToastMessage[] = toasts
    ? toasts
    : toast
    ? [toast]
    : [];

  if (list.length === 0) return null;

  return (
    <div className="fixed top-5 right-5 z-[99999] max-w-sm w-full space-y-2.5 no-print pointer-events-auto">
      {list.map((item) => (
        <ToastItem
          key={item.id}
          toast={item}
          onClose={(id) => onClose(id)}
        />
      ))}
    </div>
  );
};
