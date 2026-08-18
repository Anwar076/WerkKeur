"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";

type DocumentType = {
  id: string;
  name: string;
  description: string | null;
  requiresExpirationDate: boolean;
  defaultValidityMonths: number | null;
  reminderDays: number;
};

type Props = {
  items: DocumentType[];
};

export function DocumentTypesManager({ items }: Props) {
  const [pending, startTransition] = useTransition();
  const [name, setName] = useState("");
  const [requiresExpirationDate, setRequiresExpirationDate] = useState(true);

  const create = () => {
    startTransition(async () => {
      await fetch("/api/document-types", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          requiresExpirationDate,
          reminderDays: 30,
        }),
      });
      setName("");
      window.location.reload();
    });
  };

  const remove = (id: string) => {
    startTransition(async () => {
      await fetch(`/api/document-types/${id}`, { method: "DELETE" });
      window.location.reload();
    });
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-[2fr_1fr_auto]">
        <Input
          placeholder="Nieuw documenttype..."
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
        <label className="flex items-center gap-2 rounded-md border border-slate-200 px-3 text-sm">
          <Checkbox checked={requiresExpirationDate} onCheckedChange={(value) => setRequiresExpirationDate(Boolean(value))} />
          Vervaldatum verplicht
        </label>
        <Button onClick={create} disabled={pending || !name}>
          Toevoegen
        </Button>
      </div>

      <div className="space-y-2">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-slate-200 p-3 text-sm"
          >
            <div>
              <p className="font-medium">{item.name}</p>
              <p className="text-slate-600">
                {item.requiresExpirationDate ? "Vervaldatum vereist" : "Geen vervaldatum vereist"}
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={() => remove(item.id)} disabled={pending}>
              Verwijderen
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
