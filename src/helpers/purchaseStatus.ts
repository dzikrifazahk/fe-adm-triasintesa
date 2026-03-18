export type PurchaseStatusKey =
  | "Awaiting"
  | "Open"
  | "Due Date"
  | "Over Due"
  | "Rejected"
  | "Paid"
  | string;

type Locale = "id" | "en";

type StatusMeta = {
  label: Record<Locale, string>;
  className: string;
};

const STATUS_MAP: Record<string, StatusMeta> = {
  Awaiting: {
    label: { id: "Pengajuan", en: "Awaiting" },
    className: "bg-[#FFEFC7] border border-[#FDDF8A] text-[#F58101]",
  },
  Open: {
    label: { id: "Open", en: "Open" },
    className: "bg-[#D1FADF] border border-[#A0F2C1] text-[#22BB72]",
  },
  "Due Date": {
    label: { id: "Jatuh Tempo", en: "Due Date" },
    className: "bg-[#D1E0FF] border border-[#BAD1FF] text-[#1A67FF]",
  },
  "Over Due": {
    label: { id: "Terlewati", en: "Over Due" },
    className: "bg-[#FEE4E2] border border-[#FDCFCB] text-[#ED271A]",
  },
  Rejected: {
    label: { id: "Ditolak", en: "Rejected" },
    className: "bg-[#FEE4E2] border border-[#FDCFCB] text-[#ED271A]",
  },
  Paid: {
    label: { id: "Lunas", en: "Paid" },
    className: "bg-[#D1FADF] border border-[#A0F2C1] text-[#22BB72]",
  },
};

const DEFAULT_META: StatusMeta = {
  label: { id: "-", en: "-" },
  className: "bg-muted border border-muted-foreground/20 text-muted-foreground",
};

export function getPurchaseStatusMeta(
  rawStatus?: PurchaseStatusKey,
  locale: Locale = "id"
) {
  const status = (rawStatus ?? "").trim();
  const meta = STATUS_MAP[status] ?? DEFAULT_META;
  return {
    label: (meta.label[locale] ?? status) || "-",
    className: meta.className,
  };
}
