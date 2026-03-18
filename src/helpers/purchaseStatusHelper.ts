export function getStatusStyle(status?: string) {
  switch (status?.toLowerCase()) {
    case "awating":
      return "bg-blue-100 text-blue-700";
    case "open":
      return "bg-amber-100 text-amber-700";
    case "over due":
      return "bg-red-100 text-red-700";
    case "due date":
      return "bg-rose-100 text-rose-700";
    case "rejected":
      return "bg-rose-100 text-rose-700";
    case "paid":
      return "bg-green-100 text-green-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
}
