export const STATUS_STYLES = {
  OPEN: "bg-[#D1FADF] border border-[#A0F2C1] text-[#22BB72]",
  "NEED TO CHECK": "bg-[#FEE4E2] border border-[#FDCFCB] text-[#ED271A]",
  CLOSED: "bg-[#FEE4E2] border border-[#FDCFCB] text-[#ED271A]",
} as const;

export type StatusKey = keyof typeof STATUS_STYLES;

export function getStatusClass(value: string, opts?: { base?: string }) {
  const base = opts?.base ?? "";
  const key = value?.toUpperCase() as StatusKey;
  const style = STATUS_STYLES[key];

  const fallback = "bg-gray-100 border border-gray-200 text-gray-600";

  return [base, style ?? fallback].filter(Boolean).join(" ").trim();
}
