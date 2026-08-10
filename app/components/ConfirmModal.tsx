"use client";

import React from "react";
import { ExclamationTriangleIcon, XMarkIcon, TrashIcon } from "@heroicons/react/24/solid";

interface ConfirmModalProps {
  isOpen: boolean;
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onClose: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title = "Konfirmasi Hapus",
  message,
  confirmText = "Ya, Hapus Sekarang",
  cancelText = "Batal",
  onConfirm,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 top-0 left-0 w-screen h-screen z-[99999] bg-[#1E3932]/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in no-print overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-5 animate-scale-in border border-rose-200 relative my-auto">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-stone-100 pb-3">
          <div className="flex items-center gap-2 text-rose-700 font-black text-sm">
            <div className="p-2 rounded-xl bg-rose-100 text-rose-600">
              <ExclamationTriangleIcon className="w-5 h-5" />
            </div>
            <span>{title}</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-xl text-stone-400 hover:text-stone-700 cursor-pointer"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Content Message */}
        <div className="text-center py-2 space-y-2">
          <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 mx-auto flex items-center justify-center">
            <TrashIcon className="w-6 h-6" />
          </div>
          <p className="text-xs font-bold text-stone-800 leading-relaxed">{message}</p>
          <p className="text-[11px] text-stone-400 font-medium">Tindakan ini akan menghapus data permanen dari Supabase.</p>
        </div>

        {/* Footer Actions */}
        <div className="flex gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-2xl border border-stone-300 font-bold text-xs text-stone-600 hover:bg-stone-100 cursor-pointer transition-all active:scale-95"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="flex-1 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-rose-900/20 cursor-pointer transition-all active:scale-95"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};
