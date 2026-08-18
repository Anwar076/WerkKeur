import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/lib/db";

export async function getCurrentUser() {
  const session = await auth();
  if (!session?.user?.id) {
    return null;
  }

  return db.user.findUnique({
    where: { id: session.user.id },
  });
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/inloggen");
  }
  return user;
}

export async function requireSession() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/inloggen");
  }
  return session;
}
