"use client";

import {
  getPurchaseStatusMeta,
  PurchaseStatusKey,
} from "@/helpers/purchaseStatus";
import clsx from "clsx";

export default function PurchaseStatusBadge({
  status,
  locale = "id",
  className,
}: {
  status?: PurchaseStatusKey;
  locale?: "id" | "en";
  className?: string;
}) {
  const { label, className: statusClass } = getPurchaseStatusMeta(
    status,
    locale
  );
  return (
    <span
      className={clsx(
        "px-2 py-1 rounded-xl text-xs font-medium flex justify-center",
        statusClass,
        className
      )}
    >
      {label}
    </span>
  );
}
