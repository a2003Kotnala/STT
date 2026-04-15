import { AppShell } from "@/components/layout/app-shell";
import { requireUser } from "@/server/auth";

export default async function PlatformLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const user = await requireUser();

  return (
    <AppShell userName={user.name} userEmail={user.email}>
      {children}
    </AppShell>
  );
}
