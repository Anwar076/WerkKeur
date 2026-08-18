import Link from "next/link";

export default function NotFoundPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-2xl flex-col items-center justify-center px-4 text-center">
      <h1 className="text-3xl font-semibold tracking-tight">Pagina niet gevonden</h1>
      <p className="mt-3 text-sm text-slate-600">
        De opgevraagde pagina bestaat niet of is verplaatst.
      </p>
      <Link
        href="/"
        className="mt-6 inline-flex rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white"
      >
        Terug naar home
      </Link>
    </main>
  );
}
