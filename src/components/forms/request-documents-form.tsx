"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

type DocumentType = {
  id: string;
  name: string;
};

type Props = {
  subcontractorId: string;
  documentTypes: DocumentType[];
};

export function RequestDocumentsForm({ subcontractorId, documentTypes }: Props) {
  const [pending, startTransition] = useTransition();
  const [selected, setSelected] = useState<string[]>(documentTypes.map((item) => item.id));
  const [message, setMessage] = useState<string | null>(null);

  const onSubmit = () => {
    setMessage(null);
    startTransition(async () => {
      const response = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subcontractorId,
          documentTypeIds: selected,
        }),
      });

      if (!response.ok) {
        setMessage("Verzoek versturen mislukt.");
        return;
      }

      setMessage("Documentverzoek verstuurd.");
      window.location.reload();
    });
  };

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        {documentTypes.map((type) => (
          <label key={type.id} className="flex items-center gap-3 rounded-md border p-3 text-sm">
            <Checkbox
              checked={selected.includes(type.id)}
              onCheckedChange={(checked) =>
                setSelected((prev) =>
                  checked ? [...prev, type.id] : prev.filter((id) => id !== type.id),
                )
              }
            />
            {type.name}
          </label>
        ))}
      </div>
      {message && <p className="text-sm text-slate-700">{message}</p>}
      <Button onClick={onSubmit} disabled={pending || selected.length === 0}>
        {pending ? "Versturen..." : "Documenten opvragen"}
      </Button>
    </div>
  );
}
