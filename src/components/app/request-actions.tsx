"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";

type Props = {
  requestId: string;
};

export function RequestActions({ requestId }: Props) {
  const [pending, startTransition] = useTransition();

  const post = (url: string) => {
    startTransition(async () => {
      await fetch(url, { method: "POST" });
      window.location.reload();
    });
  };

  return (
    <div className="flex flex-wrap gap-2">
      <Button size="sm" variant="outline" onClick={() => post(`/api/requests/${requestId}/reminder`)}>
        Herinnering sturen
      </Button>
      <Button
        size="sm"
        variant="outline"
        onClick={() =>
          startTransition(async () => {
            const response = await fetch(`/api/requests/${requestId}/link`, {
              method: "POST",
            });
            if (!response.ok) {
              return;
            }
            const payload = (await response.json()) as { uploadUrl: string };
            await navigator.clipboard.writeText(payload.uploadUrl);
          })
        }
      >
        Link kopiëren
      </Button>
      <Button
        size="sm"
        variant="outline"
        onClick={() => post(`/api/requests/${requestId}/revoke`)}
        disabled={pending}
      >
        Intrekken
      </Button>
    </div>
  );
}
