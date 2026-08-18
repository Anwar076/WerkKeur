import Link from "next/link";
import { format } from "date-fns";
import { nl } from "date-fns/locale";
import { AlertTriangle, CheckCircle2, CircleAlert, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAppContext } from "@/lib/app-context";
import { getDashboardData } from "@/lib/dashboard";
import { documentStatusMeta } from "@/lib/presentation";

const activityLabels: Record<string, string> = {
  SUBCONTRACTOR_CREATED: "Onderaannemer toegevoegd",
  SUBCONTRACTOR_UPDATED: "Onderaannemer bijgewerkt",
  DOCUMENT_UPLOADED: "Document geüpload",
  DOCUMENT_REPLACED: "Document vervangen",
  DOCUMENT_DELETED: "Document verwijderd",
  REQUEST_SENT: "Documentverzoek verstuurd",
  REMINDER_SENT: "Herinnering verstuurd",
  DOCUMENT_APPROVED: "Document goedgekeurd",
  DOCUMENT_REJECTED: "Document afgekeurd",
  TEAM_MEMBER_ADDED: "Teamlid toegevoegd",
  TEAM_MEMBER_UPDATED: "Teamlid bijgewerkt",
  SETTINGS_UPDATED: "Instellingen bijgewerkt",
};

export default async function DashboardPage() {
  const { user, organization } = await getAppContext();
  const data = await getDashboardData(organization.id);

  if (data.totals.subcontractors === 0) {
    return (
      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle>Welkom bij WerkKeur 👋</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-slate-600">
          <p>
            Je hebt nog geen onderaannemers toegevoegd. Voeg je eerste onderaannemer toe en WerkKeur
            helpt je vanaf daar de documenten op orde te houden.
          </p>
          <Link
            href="/app/onderaannemers/nieuw"
            className="inline-flex rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white"
          >
            + Eerste onderaannemer toevoegen
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <section className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Goedemiddag, {user.firstName}</h1>
        <p className="text-sm text-slate-600">Dit is de actuele status van je onderaannemers.</p>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="border-slate-200">
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <p className="text-sm text-slate-600">Onderaannemers</p>
              <p className="text-2xl font-semibold">{data.totals.subcontractors}</p>
            </div>
            <Users className="h-5 w-5 text-slate-500" />
          </CardContent>
        </Card>
        <Card className="border-slate-200">
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <p className="text-sm text-slate-600">In orde</p>
              <p className="text-2xl font-semibold">{data.totals.compliant}</p>
            </div>
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
          </CardContent>
        </Card>
        <Card className="border-slate-200">
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <p className="text-sm text-slate-600">Aandacht nodig</p>
              <p className="text-2xl font-semibold">{data.totals.attention}</p>
            </div>
            <CircleAlert className="h-5 w-5 text-amber-600" />
          </CardContent>
        </Card>
        <Card className="border-slate-200">
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <p className="text-sm text-slate-600">Actie vereist</p>
              <p className="text-2xl font-semibold">{data.totals.actionRequired}</p>
            </div>
            <AlertTriangle className="h-5 w-5 text-red-600" />
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle className="text-lg">Actie vereist</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {data.actionRequired.length === 0 && <p className="text-slate-600">Geen open acties.</p>}
            {data.actionRequired.map((subcontractor) => {
              const missingOrExpired = subcontractor.documentStatuses.find((item) =>
                ["MISSING", "EXPIRED", "REJECTED"].includes(item.status),
              );
              return (
                <div key={subcontractor.id} className="rounded-md border border-slate-200 p-3">
                  <p className="font-medium">{subcontractor.companyName}</p>
                  <p className="mt-1 text-slate-600">
                    {missingOrExpired
                      ? `${missingOrExpired.documentTypeName} ${documentStatusMeta[missingOrExpired.status].label.toLowerCase()}`
                      : "Controle vereist"}
                  </p>
                  <div className="mt-2">
                    <Link href={`/app/onderaannemers/${subcontractor.id}`} className="text-slate-900 underline">
                      Bekijken
                    </Link>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle className="text-lg">Verloopt binnenkort</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {data.expiringDocuments.length === 0 && (
              <p className="text-slate-600">Geen documenten die binnenkort verlopen.</p>
            )}
            {data.expiringDocuments.map((item) => (
              <div key={`${item.subcontractorId}-${item.requirementId}`} className="rounded-md border border-slate-200 p-3">
                <p className="font-medium">{item.subcontractorName}</p>
                <p className="text-slate-600">{item.documentTypeName}</p>
                {item.expirationDate && (
                  <p className="mt-1 text-xs text-slate-500">
                    Geldig tot {format(item.expirationDate, "d MMMM yyyy", { locale: nl })}
                  </p>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      <section>
        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle className="text-lg">Recente activiteit</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {data.recentActivity.length === 0 && <p className="text-slate-600">Nog geen activiteit.</p>}
            {data.recentActivity.map((item) => (
              <div key={item.id} className="flex items-center justify-between rounded-md border border-slate-200 p-3">
                <p>
                  {(item.metadata as { message?: string } | null)?.message ??
                    activityLabels[item.action] ??
                    item.action}
                </p>
                <p className="text-xs text-slate-500">
                  {format(item.createdAt, "d MMM yyyy, HH:mm", { locale: nl })}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
