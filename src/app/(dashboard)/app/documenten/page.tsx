import Link from "next/link";
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
import { getAppContext } from "@/lib/app-context";
import { db } from "@/lib/db";
import { documentStatusMeta } from "@/lib/presentation";
import { calculateDocumentStatus } from "@/lib/status-engine";

export default async function DocumentenPage() {
  const { organization } = await getAppContext();
  const documents = await db.document.findMany({
    where: {
      organizationId: organization.id,
      deletedAt: null,
    },
    include: {
      subcontractor: true,
      documentType: true,
    },
    orderBy: { uploadedAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Documenten</h1>
        <p className="text-sm text-slate-600">Overzicht van alle aangeleverde documenten.</p>
      </div>
      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle>Documentenlijst</CardTitle>
        </CardHeader>
        <CardContent>
          {documents.length === 0 ? (
            <div className="rounded-md border border-dashed border-slate-300 p-8 text-center text-sm text-slate-600">
              Er zijn nog geen documenten geüpload.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Onderaannemer</TableHead>
                  <TableHead>Document</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Geldig tot</TableHead>
                  <TableHead>Laatst geüpload</TableHead>
                  <TableHead>Actie</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {documents.map((document) => {
                  const status = calculateDocumentStatus({
                    exists: true,
                    expirationDate: document.expirationDate,
                    reviewStatus: document.reviewStatus,
                    reminderDays: document.documentType.reminderDays,
                  });
                  return (
                    <TableRow key={document.id}>
                      <TableCell>{document.subcontractor.companyName}</TableCell>
                      <TableCell className="font-medium">{document.documentType.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={documentStatusMeta[status].className}>
                          {documentStatusMeta[status].label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {document.expirationDate
                          ? format(document.expirationDate, "dd-MM-yyyy", { locale: nl })
                          : "—"}
                      </TableCell>
                      <TableCell>{format(document.uploadedAt, "d MMM yyyy", { locale: nl })}</TableCell>
                      <TableCell>
                        <Link href={`/api/documents/${document.id}/download`} className="underline">
                          Downloaden
                        </Link>
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
