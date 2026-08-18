"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";

type Props = {
  notificationId: string;
  isRead: boolean;
};

export function NotificationReadButton({ notificationId, isRead }: Props) {
  const [pending, startTransition] = useTransition();

  if (isRead) {
    return <span className="text-xs text-slate-500">Gelezen</span>;
  }

  return (
    <Button
      variant="outline"
      size="sm"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          await fetch(`/api/notifications/${notificationId}/read`, { method: "POST" });
          window.location.reload();
        })
      }
    >
      Markeer als gelezen
    </Button>
  );
}
