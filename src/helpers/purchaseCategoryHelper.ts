export type PurchaseCategoryId = "1" | "2" | "3" | "4" | "5";

export const PURCHASE_CATEGORY = {
  FLASH_CASH: "1",
  INVOICE: "2",
  MAN_POWER: "3",
  EXPENSE: "4",
  REIMBURSEMENT: "5",
} as const;

/**
 * Normalisasi nama label jadi bentuk kunci yang stabil:
 * - uppercase
 * - ganti spasi & simbol non-alfanumerik -> underscore
 * - rapikan underscore
 */
const normalizeName = (name: string) =>
  name
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "_") // semua non-alfanumerik -> _
    .replace(/^_+|_+$/g, "");    // trim _ di depan/belakang

/**
 * Input: nama/label kategori (contoh: "FLASH CASH", "Man-Power", "reimbursement")
 * Output: id kategori ("1"..."5") atau "" kalau tidak cocok.
 */
export function getPurchaseCategoryIdByName(
  name: string | null | undefined
): PurchaseCategoryId | "" {
  if (!name) return "";

  const key = normalizeName(name);

  switch (key) {
    case "FLASH_CASH":
    case "FLASHCASH":
      return "1";
    case "INVOICE":
      return "2";
    case "MAN_POWER":
    case "MANPOWER":
      return "3";
    case "EXPENSE":
      return "4";
    case "REIMBURSEMENT":
      return "5";
    default:
      return "";
  }
}
