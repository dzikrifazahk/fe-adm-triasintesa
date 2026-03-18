export const formatCurrencyIDR = (
  amount: number | null | undefined
): string => {
  if (amount == null || isNaN(amount)) {
    return "Rp0,00";
  }

  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

export const formatNumberIDR = (amount: number | null | undefined): string => {
  if (amount == null || isNaN(amount)) {
    return "0";
  }

  return new Intl.NumberFormat("id-ID", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};
