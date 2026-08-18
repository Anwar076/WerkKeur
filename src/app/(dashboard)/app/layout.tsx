import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { getAppContext } from "@/lib/app-context";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const context = await getAppContext();

  if (!context.organization.onboardingCompleted) {
    redirect("/onboarding");
  }

  const initials = `${context.user.firstName[0] ?? ""}${context.user.lastName[0] ?? ""}`.toUpperCase();

  return (
    <AppShell
      organizationName={context.organization.name}
      userName={`${context.user.firstName} ${context.user.lastName}`}
      userInitials={initials}
    >
      {children}
    </AppShell>
  );
}
