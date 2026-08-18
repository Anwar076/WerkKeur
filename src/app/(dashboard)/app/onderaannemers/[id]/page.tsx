import { notFound } from "next/navigation";
import { format } from "date-fns";
import { nl } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DocumentRowActions } from "@/components/app/document-row-actions";
import { DocumentUploadForm } from "@/components/forms/document-upload-form";
import { RequestDocumentsForm } from "@/components/forms/request-documents-form";
import { getAppContext } from "@/lib/app-context";
import { db } from "@/lib/db";
import { documentStatusMeta, subcontractorStatusMeta } from "@/lib/presentation";
import { buildSubcontractorStatuses } from "@/lib/subcontractor-status";

type Params = Promise<{ id: string }>;

export default async function OnderaannemerDetailPage({ params }: { params: Params }) {
  const { organization } = await getAppContext();
  const { id } = await params;

  const subcontractor = await db.subcontractor.findFirst({
    where: {
      id,
      organizationId: organization.id,
    },
    include: {
      requirements: {
        include: { documentType: true },
      },
      documents: {
        where: { deletedAt: null },
        orderBy: { uploadedAt: "desc" },
      },
      documentRequests: {
        orderBy: { createdAt: "desc" },
        take: 5,
      },
    },
  });

  if (!subcontractor) {
    notFound();
  }

  const status = buildSubcontractorStatuses(subcontractor.requirements, subcontractor.documents);

  const activities = (
    await db.activityLog.findMany({
      where: {
        organizationId: organization.id,
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    })
  )
    .filter((item) => {
      if (item.entityType === "Subcontractor" && item.entityId === subcontractor.id) {
        return true;
      }

      const metadata = item.metadata as { subcontractorId?: string } | null;
      return metadata?.subcontractorId === subcontractor.id;
    })
    .slice(0, 20);

  const documentTypes = subcontractor.requirements.map((item) => ({
    id: item.documentType.id,
    name: item.documentType.name,
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight">{subcontractor.companyName}</h1>
          <Badge
            variant="outline"
            className={subcontractorStatusMeta[status.subcontractorStatus].className}
          >
            {subcontractorStatusMeta[status.subcontractorStatus].label}
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="documenten" className="space-y-4">
        <TabsList>
          <TabsTrigger value="documenten">Documenten</TabsTrigger>
          <TabsTrigger value="activiteit">Activiteit</TabsTrigger>
          <TabsTrigger value="gegevens">Gegevens</TabsTrigger>
        </TabsList>

        <TabsContent value="documenten" className="space-y-4">
          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle>Documenten</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Document</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Geldig tot</TableHead>
                    <TableHead>Laatste update</TableHead>
                    <TableHead>Acties</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {status.documentStatuses.map((item) => (
                    <TableRow key={item.requirementId}>
                      <TableCell className="font-medium">{item.documentTypeName}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={documentStatusMeta[item.status].className}>
                          {documentStatusMeta[item.status].label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {item.expirationDate
                          ? format(item.expirationDate, "dd-MM-yyyy", { locale: nl })
                          : "—"}
                      </TableCell>
                      <TableCell>
                        {item.uploadedAt
                          ? format(item.uploadedAt, "d MMM yyyy", { locale: nl })
                          : "—"}
                      </TableCell>
                      <TableCell>
                        <DocumentRowActions documentId={item.documentId} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <div className="grid gap-4 lg:grid-cols-2">
            <Card className="border-slate-200">
              <CardHeader>
                <CardTitle>Document toevoegen</CardTitle>
              </CardHeader>
              <CardContent>
                <DocumentUploadForm subcontractorId={subcontractor.id} documentTypes={documentTypes} />
              </CardContent>
            </Card>
            <Card className="border-slate-200">
              <CardHeader>
                <CardTitle>Documenten opvragen</CardTitle>
              </CardHeader>
              <CardContent>
                <RequestDocumentsForm subcontractorId={subcontractor.id} documentTypes={documentTypes} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="activiteit">
          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle>Recente activiteit</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {activities.length === 0 && <p className="text-slate-600">Nog geen activiteit.</p>}
              {activities.map((item) => (
                <div key={item.id} className="rounded-md border border-slate-200 p-3">
                  <p>{item.action}</p>
                  <p className="text-xs text-slate-500">
                    {format(item.createdAt, "d MMM yyyy, HH:mm", { locale: nl })}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="gegevens">
          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle>Bedrijfs- en contactgegevens</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 text-sm sm:grid-cols-2">
              <div>
                <p className="text-slate-500">Bedrijfsnaam</p>
                <p className="font-medium">{subcontractor.companyName}</p>
              </div>
              <div>
                <p className="text-slate-500">KvK-nummer</p>
                <p className="font-medium">{subcontractor.kvkNumber || "—"}</p>
              </div>
              <div>
                <p className="text-slate-500">BTW-nummer</p>
                <p className="font-medium">{subcontractor.vatNumber || "—"}</p>
              </div>
              <div>
                <p className="text-slate-500">Contactpersoon</p>
                <p className="font-medium">
                  {[subcontractor.contactFirstName, subcontractor.contactLastName]
                    .filter(Boolean)
                    .join(" ") || "—"}
                </p>
              </div>
              <div>
                <p className="text-slate-500">E-mailadres</p>
                <p className="font-medium">{subcontractor.contactEmail || "—"}</p>
              </div>
              <div>
                <p className="text-slate-500">Aangemaakt op</p>
                <p className="font-medium">
                  {format(subcontractor.createdAt, "d MMMM yyyy", { locale: nl })}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
