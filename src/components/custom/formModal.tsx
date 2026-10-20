"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import { useFormText } from "@/hooks/use-form-text";

/**
 * Modal form dengan header ikon + deskripsi dan footer Batal / Submit.
 * Berbasis div biasa (bukan Radix Dialog) supaya konfirmasi SweetAlert
 * di atasnya tetap bisa diklik.
 */
interface FormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  title: string;
  description?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  width?: string;
  submitLabel?: string;
  cancelLabel?: string;
  submitDisabled?: boolean;
}

export function FormModal({
  isOpen,
  onClose,
  onSubmit,
  title,
  description,
  icon,
  children,
  width = "w-[92vw] md:w-[640px]",
  submitLabel,
  cancelLabel,
  submitDisabled,
}: FormModalProps) {
  const t = useFormText();
  const modalRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "auto";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm"
      onClick={(e) => {
        if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
          onClose();
        }
      }}
    >
      <div
        ref={modalRef}
        className={cn(
          "flex max-h-[90vh] flex-col overflow-hidden rounded-2xl bg-white shadow-xl dark:bg-[#1F2023]",
          width,
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <form onSubmit={onSubmit} className="flex min-h-0 flex-1 flex-col">
          <div className="flex items-start gap-4 border-b px-6 py-5 dark:border-white/10">
            {icon ? (
              <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-iprimary-blue dark:bg-blue-500/15 dark:text-blue-300">
                {icon}
              </span>
            ) : null}
            <div className="min-w-0 flex-1">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{title}</h2>
              {description ? (
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{description}</p>
              ) : null}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-md p-1 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-white"
              aria-label="Tutup"
            >
              <X className="size-6" />
            </button>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">{children}</div>

          <div className="flex justify-end gap-3 border-t bg-slate-50/80 px-6 py-4 dark:border-white/10 dark:bg-white/[0.03]">
            <Button type="button" variant="outline" className="h-11 px-6" onClick={onClose}>
              {cancelLabel ?? t.common.cancel}
            </Button>
            <Button
              type="submit"
              disabled={submitDisabled}
              className="h-11 bg-iprimary-blue px-6 text-white hover:bg-iprimary-blue-tertiary"
            >
              {submitLabel ?? t.common.submit}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

/** Kartu field: ikon + label di atas, input di bawah. */
export function FormFieldCard({
  icon,
  label,
  required,
  children,
  className,
}: {
  icon?: React.ReactNode;
  label: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "space-y-3 rounded-2xl bg-slate-50 p-4 dark:bg-white/[0.04]",
        className,
      )}
    >
      <div className="flex items-center gap-3 font-semibold text-slate-900 dark:text-slate-100">
        {icon ? <span className="text-iprimary-blue dark:text-blue-300">{icon}</span> : null}
        <span>
          {label}
          {required ? <span className="ml-1 text-red-500">*</span> : null}
        </span>
      </div>
      {children}
    </div>
  );
}
