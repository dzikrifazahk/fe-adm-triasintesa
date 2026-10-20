"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/** Ambil angka bulat (Rupiah) dari nilai apa pun: "250000.00", 250000, "Rp 1.250.000". */
export function toRupiahDigits(value: string | number | null | undefined): string {
  if (value === null || value === undefined || value === "") return "";
  if (typeof value === "number") return Number.isFinite(value) ? String(Math.round(value)) : "";
  const trimmed = value.trim();
  // angka dari API (mis. "250000.00") → bulatkan
  if (/^-?\d+(\.\d+)?$/.test(trimmed)) return String(Math.round(Number(trimmed)));
  return trimmed.replace(/\D/g, "").replace(/^0+(?=\d)/, "");
}

export function formatRupiah(
  value: string | number | null | undefined,
  withPrefix = true,
): string {
  const digits = toRupiahDigits(value);
  if (!digits) return "";
  const formatted = Number(digits).toLocaleString("id-ID");
  return withPrefix ? `Rp ${formatted}` : formatted;
}

type CurrencyInputProps = Omit<
  React.ComponentProps<"input">,
  "value" | "onChange" | "type" | "defaultValue"
> & {
  value: string | number | null | undefined;
  /** dipanggil dengan angka mentah tanpa format, mis. "1250000" ("" bila kosong) */
  onValueChange: (value: string) => void;
  /** tampilkan "Rp " di depan angka (matikan bila sudah ada ikon/label Rp) */
  showPrefix?: boolean;
};

/**
 * Input uang IDR: tampil "Rp 1.250.000" saat diketik, nilai yang dikirim
 * ke form tetap angka mentah sehingga logika submit tidak berubah.
 */
export function CurrencyInput({
  value,
  onValueChange,
  className,
  showPrefix = true,
  placeholder = showPrefix ? "Rp 0" : "0",
  ...props
}: CurrencyInputProps) {
  return (
    <input
      {...props}
      type="text"
      inputMode="numeric"
      autoComplete="off"
      data-slot="input"
      placeholder={placeholder}
      value={formatRupiah(value, showPrefix)}
      onChange={(event) => {
        const digits = event.target.value.replace(/\D/g, "").replace(/^0+(?=\d)/, "").slice(0, 15);
        onValueChange(digits);
      }}
      className={cn(
        "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
        "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
        "tabular-nums",
        className,
      )}
    />
  );
}
