import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { loadPrivateFile } from "@/lib/storage";

type Params = Promise<{ id: string }>;

export async function GET(_: Request, context: { params: Params }) {
  const session = await auth();
  if (!session?.user?.organizationId) {
    return NextResponse.json({ error: "Niet geautoriseerd." }, { status: 401 });
  }

  const { id } = await context.params;
  const document = await db.document.findFirst({
    where: {
      id,
      organizationId: session.user.organizationId,
      deletedAt: null,
    },
  });

  if (!document) {
    return NextResponse.json({ error: "Document niet gevonden." }, { status: 404 });
  }

  try {
    const buffer = await loadPrivateFile(document.storageKey);
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": document.mimeType,
        "Content-Length": String(document.fileSize),
        "Content-Disposition": `attachment; filename="${document.originalFilename}"`,
      },
    });
  } catch {
    return NextResponse.json({ error: "Bestand kon niet worden geladen." }, { status: 404 });
  }
}
