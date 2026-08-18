import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SubcontractorForm } from "@/components/forms/subcontractor-form";
import { getAppContext } from "@/lib/app-context";
import { db } from "@/lib/db";

export default async function NieuweOnderaannemerPage() {
  const { organization } = await getAppContext();

  const documentTypes = await db.documentType.findMany({
    where: { organizationId: organization.id },
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      isRequiredByDefault: true,
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Onderaannemer toevoegen</h1>
        <p className="text-sm text-slate-600">Voeg een nieuwe onderaannemer toe aan WerkKeur.</p>
      </div>
      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle>Nieuwe onderaannemer</CardTitle>
        </CardHeader>
        <CardContent>
          <SubcontractorForm documentTypes={documentTypes} />
        </CardContent>
      </Card>
    </div>
  );
}
