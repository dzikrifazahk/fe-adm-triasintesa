export const mapLeaveType = (type: number | string | null | undefined) => {
  const t = Number(type);

  switch (t) {
    case 0:
      return {
        label: "Cuti",
        className: "bg-blue-100 text-blue-700 border border-blue-200",
      };
    case 1:
      return {
        label: "Izin",
        className: "bg-amber-100 text-amber-700 border border-amber-200",
      };
    case 2:
      return {
        label: "Sakit",
        className: "bg-rose-100 text-rose-700 border border-rose-200",
      };
    default:
      return {
        label: "-",
        className: "bg-slate-100 text-slate-600 border border-slate-200",
      };
  }
};
