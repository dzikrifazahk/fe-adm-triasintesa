export const convertToDate = (timeStr: string) => {
  const [h, m, s] = timeStr.split(":").map(Number);
  const date = new Date();
  date.setHours(h, m, s ?? 0, 0);
  return date;
};

export const toTimeString = (date: Date | undefined): string => {
  if (!date) return "00:00:00";
  return date.toTimeString().slice(0, 8);
};
