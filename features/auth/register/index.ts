export const getStrength = (pwd: string) => {
  if (pwd.length === 0) return { level: 0, label: "", color: "" };
  if (pwd.length < 6)
    return { level: 1, label: "Too short", color: "bg-red-500" };
  if (pwd.length < 8)
    return { level: 2, label: "Weak", color: "bg-orange-500" };
  if (/[A-Z]/.test(pwd) && /[0-9]/.test(pwd) && pwd.length >= 8)
    return { level: 4, label: "Strong", color: "bg-green-500" };
  return { level: 3, label: "Fair", color: "bg-yellow-500" };
};
