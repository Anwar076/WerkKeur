import { format } from "date-fns";
import { nl } from "date-fns/locale";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DocumentTypesManager } from "@/components/forms/document-types-manager";
import { OrganizationSettingsForm } from "@/components/forms/organization-settings-form";
import { ReminderSettingsForm } from "@/components/forms/reminder-settings-form";
import { getAppContext } from "@/lib/app-context";
import { db } from "@/lib/db";

export default async function InstellingenPage() {
  const { organization, user } = await getAppContext();

  const [documentTypes, subscription] = await Promise.all([
    db.documentType.findMany({
      where: { organizationId: organization.id },
      orderBy: { name: "asc" },
    }),
    db.subscription.findUnique({
      where: { organizationId: organization.id },
    }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Instellingen</h1>
        <p className="text-sm text-slate-600">Beheer bedrijfsgegevens, documenttypes en abonnement.</p>
      </div>

      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle>Bedrijf</CardTitle>
        </CardHeader>
        <CardContent>
          <OrganizationSettingsForm initial={organization} />
        </CardContent>
      </Card>

      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle>Documenttypes</CardTitle>
        </CardHeader>
        <CardContent>
          <DocumentTypesManager items={documentTypes} />
        </CardContent>
      </Card>

      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle>Herinneringen</CardTitle>
        </CardHeader>
        <CardContent>
          <ReminderSettingsForm
            initial={{
              reminderDaysBefore30: organization.reminderDaysBefore30,
              reminderDaysBefore14: organization.reminderDaysBefore14,
              reminderDaysBefore7: organization.reminderDaysBefore7,
              reminderOnExpiration: organization.reminderOnExpiration,
              requestReminderAfter3: organization.requestReminderAfter3,
              requestReminderAfter7: organization.requestReminderAfter7,
              requestReminderAfter14: organization.requestReminderAfter14,
            }}
          />
        </CardContent>
      </Card>

      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle>Account</CardTitle>
          <CardDescription>
            Profielinstellingen en wachtwoordbeheer worden stapsgewijs uitgebreid.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-slate-700">
          <p>
            Ingelogd als <strong>{user.firstName} {user.lastName}</strong> ({user.email}).
          </p>
          <p className="mt-1 text-slate-600">
            Wachtwoord reset kan via <code>/wachtwoord-vergeten</code>.
          </p>
        </CardContent>
      </Card>

      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle>Abonnement</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-slate-700">
          {subscription ? (
            <div className="space-y-1">
              <p>
                Plan: <strong>{subscription.plan}</strong>
              </p>
              <p>
                Status: <strong>{subscription.status}</strong>
              </p>
              <p>
                Trial eindigt op{" "}
                <strong>{format(subscription.trialEndsAt, "d MMMM yyyy", { locale: nl })}</strong>
              </p>
              <p className="text-slate-600">
                Stripe/Mollie koppeling volgt in een latere fase.
              </p>
            </div>
          ) : (
            <p>Geen abonnementsinformatie beschikbaar.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
