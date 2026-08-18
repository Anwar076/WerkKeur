"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { subcontractorSchema } from "@/lib/validation";

type DocumentType = {
  id: string;
  name: string;
  isRequiredByDefault?: boolean;
};

type Props = {
  documentTypes: DocumentType[];
};

type Values = z.infer<typeof subcontractorSchema>;

export function SubcontractorForm({ documentTypes }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [createdId, setCreatedId] = useState<string | null>(null);

  const defaultRequired = documentTypes.filter((item) => item.isRequiredByDefault).map((item) => item.id);

  const form = useForm<Values>({
    resolver: zodResolver(subcontractorSchema),
    defaultValues: {
      companyName: "",
      kvkNumber: "",
      vatNumber: "",
      contactFirstName: "",
      contactLastName: "",
      contactEmail: "",
      contactPhone: "",
      requirementDocumentTypeIds: defaultRequired.length > 0 ? defaultRequired : documentTypes.slice(0, 3).map((item) => item.id),
    },
  });
  const selectedTypes = useWatch({
    control: form.control,
    name: "requirementDocumentTypeIds",
  });

  const onSubmit = (values: Values) => {
    setError(null);
    startTransition(async () => {
      const response = await fetch("/api/subcontractors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        setError("Aanmaken mislukt.");
        return;
      }

      const payload = (await response.json()) as { subcontractorId: string };
      setCreatedId(payload.subcontractorId);
    });
  };

  return (
    <div className="space-y-6">
      <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
        <section className="space-y-4">
          <h2 className="text-lg font-medium">Bedrijfsgegevens</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="companyName">Bedrijfsnaam *</Label>
              <Input id="companyName" {...form.register("companyName")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="kvkNumber">KvK-nummer</Label>
              <Input id="kvkNumber" {...form.register("kvkNumber")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="vatNumber">BTW-nummer</Label>
              <Input id="vatNumber" {...form.register("vatNumber")} />
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-medium">Contactpersoon</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="contactFirstName">Voornaam</Label>
              <Input id="contactFirstName" {...form.register("contactFirstName")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contactLastName">Achternaam</Label>
              <Input id="contactLastName" {...form.register("contactLastName")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contactEmail">E-mailadres *</Label>
              <Input id="contactEmail" type="email" {...form.register("contactEmail")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contactPhone">Telefoonnummer</Label>
              <Input id="contactPhone" {...form.register("contactPhone")} />
            </div>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-medium">Verplichte documenten</h2>
          <div className="space-y-2">
            {documentTypes.map((type) => {
              const selected = selectedTypes?.includes(type.id) ?? false;
              return (
                <label key={type.id} className="flex items-center gap-3 rounded-md border p-3 text-sm">
                  <Checkbox
                    checked={selected}
                    onCheckedChange={(checked) => {
                      const current = form.getValues("requirementDocumentTypeIds");
                      form.setValue(
                        "requirementDocumentTypeIds",
                        checked ? [...current, type.id] : current.filter((id) => id !== type.id),
                      );
                    }}
                  />
                  {type.name}
                </label>
              );
            })}
          </div>
        </section>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex gap-3">
          <Button type="button" variant="outline" onClick={() => router.push("/app/onderaannemers")}>
            Annuleren
          </Button>
          <Button type="submit" disabled={pending}>
            {pending ? "Opslaan..." : "Onderaannemer toevoegen"}
          </Button>
        </div>
      </form>

      {createdId && (
        <div className="rounded-md border border-emerald-200 bg-emerald-50 p-4 text-sm">
          <p className="font-medium text-emerald-800">Onderaannemer toegevoegd.</p>
          <div className="mt-2 flex gap-3">
            <Button
              size="sm"
              onClick={() => router.push(`/app/verzoeken?subcontractorId=${createdId}`)}
            >
              Documentverzoek versturen
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => router.push(`/app/onderaannemers/${createdId}`)}
            >
              Details bekijken
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
