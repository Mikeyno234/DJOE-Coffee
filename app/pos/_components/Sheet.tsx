"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";

interface SheetProps {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  /** Blocks backdrop click and the close button while a request is in flight. */
  locked?: boolean;
}

/**
 * Modal built on the native dialog element: the browser supplies the focus trap,
 * Escape-to-close and inert background, so none of it is reimplemented here.
 * Children render only while open, so form state resets on every opening.
 */
export function Sheet({ open, title, onClose, children, locked = false }: SheetProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onClose={onClose}
      onCancel={(event) => {
        if (locked) event.preventDefault();
      }}
      onClick={(event) => {
        if (!locked && event.target === ref.current) onClose();
      }}
      className="m-auto w-[min(34rem,calc(100vw-1.5rem))] max-h-[calc(100dvh-1.5rem)] overflow-hidden rounded-2xl bg-surface p-0 text-ink shadow-xl backdrop:bg-espresso/60"
    >
      {open && (
        <div className="flex max-h-[calc(100dvh-1.5rem)] flex-col">
          <header className="flex items-center justify-between gap-3 border-b border-stone-200 px-5 py-3">
            <h2 id={titleId} className="text-lg font-bold">
              {title}
            </h2>
            <button
              type="button"
              onClick={onClose}
              disabled={locked}
              aria-label="Tutup"
              className="flex size-11 items-center justify-center rounded-lg text-ink-muted hover:bg-stone-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-espresso disabled:opacity-40"
            >
              <XMarkIcon className="size-6" aria-hidden="true" />
            </button>
          </header>
          <div className="overflow-y-auto">{children}</div>
        </div>
      )}
    </dialog>
  );
}
