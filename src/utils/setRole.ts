export default function mapRoleToString(role: number): string {
  if (role === 1) {
    return "Owner";
  } else if (role === 2) {
    return "Admin";
  } else if (role === 3) {
    return "Supervisor";
  } else if (role === 4) {
    return "Karyawan";
  }
  return "Unknown";
}
