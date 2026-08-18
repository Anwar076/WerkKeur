import Link from "next/link";
import { PublicRequestUpload } from "@/components/forms/public-request-upload";
import { db } from "@/lib/db";
import { hashToken, isRequestTokenUsable } from "@/lib/tokens";

type Params = Promise<{ token: string }>;

export default async function AanleverenPage({ params }: { params: Params }) {
  const { token } = await params;
  const tokenHash = hashToken(token);

  const requestRecord = await db.documentRequest.findFirst({
    where: {
      tokenHash,
    },
    include: {
      subcontractor: true,
      items: {
        include: {
          documentType: {
            select: {
              name: true,
              requiresExpirationDate: true,
            },
          },
        },
        orderBy: {
          createdAt: "asc",
        },
      },
      organization: {
        select: { name: true },
      },
    },
  });

  if (
    !requestRecord ||
    !isRequestTokenUsable({
      revokedAt: requestRecord.revokedAt,
      tokenExpiresAt: requestRecord.tokenExpiresAt,
      now: new Date(),
    })
  ) {
    return (
      <main className="mx-auto min-h-screen w-full max-w-3xl px-4 py-16">
        <Link href="/" className="text-xl font-semibold text-slate-900">
          WerkKeur
        </Link>
        <div className="mt-8 rounded-lg border border-red-200 bg-red-50 p-6">
          <h1 className="text-xl font-semibold text-red-800">Uploadlink niet geldig</h1>
          <p className="mt-2 text-sm text-red-700">
            Deze link is verlopen of ingetrokken. Vraag de opdrachtgever om een nieuwe link.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-3xl px-4 py-16">
      <Link href="/" className="text-xl font-semibold text-slate-900">
        WerkKeur
      </Link>
      <div className="mt-8 space-y-4">
        <h1 className="text-3xl font-semibold tracking-tight">Documenten aanleveren</h1>
        <p className="text-slate-600">
          {requestRecord.organization.name} heeft je gevraagd onderstaande documenten aan te leveren.
        </p>
      </div>
      <div className="mt-8">
        <PublicRequestUpload requestId={requestRecord.id} token={token} items={requestRecord.items} />
      </div>
    </main>
  );
}
