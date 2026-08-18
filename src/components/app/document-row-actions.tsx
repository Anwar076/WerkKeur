"use client";

import Link from "next/link";
import { useTransition } from "react";
import { Button } from "@/components/ui/button";

type Props = {
  documentId: string | null;
};

export function DocumentRowActions({ documentId }: Props) {
  const [pending, startTransition] = useTransition();

  if (!documentId) {
    return <span className="text-slate-500">—</span>;
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Link href={`/api/documents/${documentId}/download`} className="text-slate-900 underline">
        Bekijken
      </Link>
      <Link href={`/api/documents/${documentId}/download`} className="text-slate-900 underline">
        Downloaden
      </Link>
      <span className="text-slate-500">Vervangen via upload</span>
      <Button
        variant="outline"
        size="sm"
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            await fetch(`/api/documents/${documentId}`, { method: "DELETE" });
            window.location.reload();
          })
        }
      >
        Verwijderen
      </Button>
    </div>
  );
}
