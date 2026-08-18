import { format } from "date-fns";
import { nl } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { RequestActions } from "@/components/app/request-actions";
import { getAppContext } from "@/lib/app-context";
import { db } from "@/lib/db";

const statusLabels: Record<string, string> = {
  OPEN: "Open",
  PARTIAL: "Gedeeltelijk ontvangen",
  COMPLETE: "Compleet",
  EXPIRED: "Verlopen",
  REVOKED: "Ingetrokken",
};

export default async function VerzoekenPage() {
  const { organization } = await getAppContext();

  const requests = await db.documentRequest.findMany({
    where: {
      organizationId: organization.id,
    },
    include: {
      subcontractor: true,
      items: {
        include: {
          documentType: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Verzoeken</h1>
        <p className="text-sm text-slate-600">Beheer documentverzoeken en herinneringen.</p>
      </div>
      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle>Documentverzoeken</CardTitle>
        </CardHeader>
        <CardContent>
          {requests.length === 0 ? (
            <div className="rounded-md border border-dashed border-slate-300 p-8 text-center text-sm text-slate-600">
              Nog geen verzoeken verzonden.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Onderaannemer</TableHead>
                  <TableHead>Ontvanger</TableHead>
                  <TableHead>Gevraagde documenten</TableHead>
                  <TableHead>Verzonden</TableHead>
                  <TableHead>Voortgang</TableHead>
                  <TableHead>Laatste herinnering</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Acties</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.map((request) => {
                  const total = request.items.length;
                  const received = request.items.filter((item) => item.status === "RECEIVED").length;
                  const computedStatus =
                    request.revokedAt
                      ? "REVOKED"
                      : request.tokenExpiresAt < new Date() && request.status !== "COMPLETE"
                        ? "EXPIRED"
                        : request.status;
                  return (
                    <TableRow key={request.id}>
                      <TableCell className="font-medium">{request.subcontractor.companyName}</TableCell>
                      <TableCell>{request.subcontractor.contactEmail || "—"}</TableCell>
                      <TableCell>{request.items.map((item) => item.documentType.name).join(", ")}</TableCell>
                      <TableCell>{format(request.sentAt, "d MMM yyyy", { locale: nl })}</TableCell>
                      <TableCell>{`${received}/${total}`}</TableCell>
                      <TableCell>
                        {request.lastReminderSentAt
                          ? format(request.lastReminderSentAt, "d MMM yyyy", { locale: nl })
                          : "—"}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{statusLabels[computedStatus] ?? computedStatus}</Badge>
                      </TableCell>
                      <TableCell>
                        <RequestActions requestId={request.id} />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
