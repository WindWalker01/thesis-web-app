// Minimal layout for account status pages (suspended, banned)
// These pages do NOT use the main app layout to avoid redirect loops.

export default function AccountLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}