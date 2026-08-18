"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type DocumentType = {
  id: string;
  name: string;
};

type Props = {
  subcontractorId: string;
  documentTypes: DocumentType[];
};

export function DocumentUploadForm({ subcontractorId, documentTypes }: Props) {
  const [pending, startTransition] = useTransition();
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedTypeId, setSelectedTypeId] = useState(documentTypes[0]?.id ?? "");

  const onSubmit = (formData: FormData) => {
    setError(null);
    setSuccess(null);
    startTransition(async () => {
      formData.set("subcontractorId", subcontractorId);
      formData.set("documentTypeId", selectedTypeId);

      const response = await fetch("/api/documents/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null;
        setError(payload?.error ?? "Upload mislukt.");
        return;
      }

      setSuccess("Document succesvol toegevoegd.");
      window.location.reload();
    });
  };

  if (documentTypes.length === 0) {
    return <p className="text-sm text-slate-600">Geen documenttypes beschikbaar.</p>;
  }

  return (
    <form action={onSubmit} className="space-y-3">
      <div className="space-y-2">
        <Label>Documenttype</Label>
        <select
          className="h-10 w-full rounded-md border border-slate-200 px-3 text-sm"
          value={selectedTypeId}
          onChange={(event) => setSelectedTypeId(event.target.value)}
        >
          {documentTypes.map((type) => (
            <option key={type.id} value={type.id}>
              {type.name}
            </option>
          ))}
        </select>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Ingangsdatum</Label>
          <Input name="issueDate" type="date" />
        </div>
        <div className="space-y-2">
          <Label>Geldig tot</Label>
          <Input name="expirationDate" type="date" />
        </div>
      </div>
      <div className="space-y-2">
        <Label>Bestand</Label>
        <Input name="file" type="file" accept=".pdf,.jpg,.jpeg,.png" required />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      {success && <p className="text-sm text-emerald-700">{success}</p>}
      <Button type="submit" disabled={pending}>
        {pending ? "Uploaden..." : "Document toevoegen"}
      </Button>
    </form>
  );
}
