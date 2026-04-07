export function getInitials(name: string): string {
  if (!name) return "U";

  const words = name.trim().split(" ").filter(Boolean);

  if (words.length === 1) {
    return words[0].substring(0, 2).toUpperCase();
  }

  return (words[0][0] + words[1][0]).toUpperCase();
}
