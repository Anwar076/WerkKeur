import { formatDistanceToNow } from "date-fns";
import { nl } from "date-fns/locale";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { NotificationReadButton } from "@/components/app/notification-read-button";
import { getAppContext } from "@/lib/app-context";
import { db } from "@/lib/db";

export default async function MeldingenPage() {
  const { user, organization } = await getAppContext();

  const notifications = await db.notification.findMany({
    where: {
      organizationId: organization.id,
      recipientUserId: user.id,
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Meldingen</h1>
        <p className="text-sm text-slate-600">Belangrijke updates over documenten en verzoeken.</p>
      </div>

      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle>Recente meldingen</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {notifications.length === 0 ? (
            <div className="rounded-md border border-dashed border-slate-300 p-8 text-center text-sm text-slate-600">
              Je hebt nog geen meldingen.
            </div>
          ) : (
            notifications.map((notification) => (
              <div key={notification.id} className="rounded-md border border-slate-200 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <p className="font-medium">{notification.title}</p>
                    <p className="text-sm text-slate-600">{notification.message}</p>
                    <p className="text-xs text-slate-500">
                      {formatDistanceToNow(notification.createdAt, { addSuffix: true, locale: nl })}
                    </p>
                  </div>
                  <NotificationReadButton
                    notificationId={notification.id}
                    isRead={Boolean(notification.readAt)}
                  />
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
