"use client";

import { useState, useTransition } from "react";
import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type RequestItem = {
  id: string;
  status: "REQUESTED" | "RECEIVED";
  documentType: {
    name: string;
    requiresExpirationDate: boolean;
  };
};

type Props = {
  requestId: string;
  token: string;
  items: RequestItem[];
};

export function PublicRequestUpload({ requestId, token, items }: Props) {
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  const upload = (itemId: string, formData: FormData) => {
    startTransition(async () => {
      setMessage(null);
      formData.set("token", token);
      const response = await fetch(`/api/requests/${requestId}/items/${itemId}/upload`, {
        method: "POST",
        body: formData,
      });
      if (!response.ok) {
        setMessage("Upload mislukt. Controleer bestandstype en grootte.");
        return;
      }
      setMessage("Document ontvangen. Bedankt!");
      window.location.reload();
    });
  };

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <div key={item.id} className="rounded-lg border border-slate-200 p-4">
          <div className="mb-3 flex items-center justify-between">
            <p className="font-medium">{item.documentType.name}</p>
            {item.status === "RECEIVED" ? (
              <span className="inline-flex items-center gap-2 text-sm text-emerald-700">
                <CheckCircle2 className="h-4 w-4" />
                Ontvangen
              </span>
            ) : (
              <span className="inline-flex items-center gap-2 text-sm text-amber-700">
                <AlertTriangle className="h-4 w-4" />
                Nog aanleveren
              </span>
            )}
          </div>

          {item.status === "REQUESTED" && (
            <form action={(formData) => upload(item.id, formData)} className="space-y-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <Input name="issueDate" type="date" />
                {item.documentType.requiresExpirationDate && (
                  <Input name="expirationDate" type="date" required />
                )}
              </div>
              <Input name="file" type="file" accept=".pdf,.jpg,.jpeg,.png" required />
              <Button type="submit" disabled={pending}>
                {pending ? "Uploaden..." : "Upload document"}
              </Button>
            </form>
          )}
        </div>
      ))}
      {message && <p className="text-sm text-slate-700">{message}</p>}
      <p className="text-sm text-slate-500">Je hoeft geen WerkKeur-account aan te maken.</p>
    </div>
  );
}
