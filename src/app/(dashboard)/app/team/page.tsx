import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TeamInviteForm } from "@/components/forms/team-invite-form";
import { getAppContext } from "@/lib/app-context";
import { db } from "@/lib/db";
import { hasPermission } from "@/lib/permissions";

export default async function TeamPage() {
  const { organization, role } = await getAppContext();
  const canManage = hasPermission(role, "manageTeam");

  const members = await db.organizationMember.findMany({
    where: { organizationId: organization.id },
    include: { user: true },
    orderBy: { createdAt: "asc" },
  });

  const invitations = await db.teamInvitation.findMany({
    where: {
      organizationId: organization.id,
      status: "INVITED",
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Team</h1>
        <p className="text-sm text-slate-600">Beheer gebruikers en rollen binnen je organisatie.</p>
      </div>

      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle>Teamleden</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Naam</TableHead>
                <TableHead>E-mail</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {members.map((member) => (
                <TableRow key={member.id}>
                  <TableCell className="font-medium">
                    {member.user.firstName} {member.user.lastName}
                  </TableCell>
                  <TableCell>{member.user.email}</TableCell>
                  <TableCell>{member.role}</TableCell>
                  <TableCell>{member.status}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle>Uitnodigingen</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {canManage ? (
            <TeamInviteForm />
          ) : (
            <p className="text-sm text-slate-600">
              Alleen owner en admin kunnen teamleden uitnodigen.
            </p>
          )}
          {invitations.length > 0 && (
            <div className="space-y-2 text-sm">
              {invitations.map((invitation) => (
                <div key={invitation.id} className="rounded-md border border-slate-200 p-3">
                  <p className="font-medium">{invitation.email}</p>
                  <p className="text-slate-600">Rol: {invitation.role}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
