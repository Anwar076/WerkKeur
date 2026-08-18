import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { OnboardingWizard } from "@/components/forms/onboarding-wizard";
import { db } from "@/lib/db";

export default async function OnboardingPage() {
  const session = await auth();
  if (!session?.user?.id || !session.user.organizationId) {
    redirect("/inloggen");
  }

  const [organization, documentTypes] = await Promise.all([
    db.organization.findUnique({
      where: { id: session.user.organizationId },
      select: {
        name: true,
        onboardingCompleted: true,
      },
    }),
    db.documentType.findMany({
      where: { organizationId: session.user.organizationId },
      select: {
        id: true,
        name: true,
      },
      orderBy: { name: "asc" },
    }),
  ]);

  if (!organization) {
    redirect("/inloggen");
  }

  if (organization.onboardingCompleted) {
    redirect("/app");
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10">
      <OnboardingWizard initialCompanyName={organization.name} documentTypes={documentTypes} />
    </div>
  );
}
