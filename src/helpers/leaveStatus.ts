export const mapLeaveStatus = (status: string | null | undefined) => {
  const s = (status || "").toLowerCase();

  switch (s) {
    case "waiting":
      return {
        label: "Waiting",
        className: "bg-amber-100 text-amber-700 border border-amber-200",
      };
    case "approved":
      return {
        label: "Approved",
        className: "bg-emerald-100 text-emerald-700 border border-emerald-200",
      };
    default:
      return {
        label: "-",
        className: "bg-slate-100 text-slate-600 border border-slate-200",
      };
  }
};