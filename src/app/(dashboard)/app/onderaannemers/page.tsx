import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { nl } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getAppContext } from "@/lib/app-context";
import { db } from "@/lib/db";
import { subcontractorStatusMeta } from "@/lib/presentation";
import { buildSubcontractorStatuses } from "@/lib/subcontractor-status";

type SearchParams = Promise<{ q?: string; status?: string }>;

export default async function OnderaannemersPage({ searchParams }: { searchParams: SearchParams }) {
  const { organization } = await getAppContext();
  const params = await searchParams;
  const q = params.q?.trim();
  const status = params.status ?? "ALL";

  const subcontractors = await db.subcontractor.findMany({
    where: {
      organizationId: organization.id,
      companyName: q ? { contains: q, mode: "insensitive" } : undefined,
    },
    include: {
      requirements: {
        include: { documentType: true },
      },
      documents: {
        where: { deletedAt: null },
        orderBy: { uploadedAt: "desc" },
      },
    },
    orderBy: { companyName: "asc" },
  });

  const rows = subcontractors
    .map((subcontractor) => {
      const computed = buildSubcontractorStatuses(subcontractor.requirements, subcontractor.documents);
      return {
        ...subcontractor,
        status: computed.subcontractorStatus,
      };
    })
    .filter((subcontractor) => (status === "ALL" ? true : subcontractor.status === status));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Onderaannemers</h1>
          <p className="text-sm text-slate-600">Beheer je onderaannemers en documentstatussen.</p>
        </div>
        <Button asChild>
          <Link href="/app/onderaannemers/nieuw">+ Onderaannemer toevoegen</Link>
        </Button>
      </div>

      <Card className="border-slate-200">
        <CardHeader className="space-y-4">
          <CardTitle className="text-base">Zoeken en filteren</CardTitle>
          <form className="grid gap-3 sm:grid-cols-3">
            <Input name="q" defaultValue={q} placeholder="Zoek op bedrijfsnaam..." />
            <select
              name="status"
              defaultValue={status}
              className="h-10 rounded-md border border-slate-200 px-3 text-sm"
            >
              <option value="ALL">Alle</option>
              <option value="COMPLIANT">In orde</option>
              <option value="ATTENTION">Aandacht nodig</option>
              <option value="ACTION_REQUIRED">Actie vereist</option>
            </select>
            <Button type="submit">Toepassen</Button>
          </form>
        </CardHeader>
        <CardContent>
          {rows.length === 0 ? (
            <div className="rounded-lg border border-dashed border-slate-300 p-8 text-center">
              <p className="text-sm text-slate-600">
                Geen onderaannemers gevonden. Voeg je eerste onderaannemer toe.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Bedrijf</TableHead>
                  <TableHead>Contactpersoon</TableHead>
                  <TableHead>Documenten</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Laatste activiteit</TableHead>
                  <TableHead>Acties</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="font-medium">{row.companyName}</TableCell>
                    <TableCell>
                      {[row.contactFirstName, row.contactLastName].filter(Boolean).join(" ") || "—"}
                    </TableCell>
                    <TableCell>{row.requirements.length}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={subcontractorStatusMeta[row.status].className}
                      >
                        {subcontractorStatusMeta[row.status].label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-slate-600">
                      {row.lastActivityAt
                        ? formatDistanceToNow(row.lastActivityAt, { addSuffix: true, locale: nl })
                        : "Geen activiteit"}
                    </TableCell>
                    <TableCell>
                      <Link href={`/app/onderaannemers/${row.id}`} className="text-slate-900 underline">
                        Bekijken
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
