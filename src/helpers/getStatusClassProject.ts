export function getStatusClassProject(value?: string) {
  switch (value) {
    case "Pending":
      return "bg-[#FFEFC7] border border-[#FDDF8A] text-[#F58101]";
    case "Active":
      return "bg-[#D1FADF] border border-[#A0F2C1] text-[#22BB72]";
    case "Rejected":
    case "Cancel":
      return "bg-[#FEE4E2] border border-[#FDCFCB] text-[#ED271A]";
    case "Closed":
      return "bg-[#D1E0FF] border border-[#B2CDFF] text-[#1C69FF]";
    default:
      return "bg-gray-100 border border-gray-200 text-gray-500";
  }
}
