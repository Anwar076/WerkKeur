import Link from "next/link";

export function MarketingFooter() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-start justify-between gap-4 px-4 py-8 text-sm text-slate-600 sm:flex-row sm:items-center sm:px-6">
        <p>© {new Date().getFullYear()} WerkKeur. Alle rechten voorbehouden.</p>
        <div className="flex items-center gap-4">
          <Link href="/privacy" className="hover:text-slate-900">
            Privacy
          </Link>
          <Link href="/voorwaarden" className="hover:text-slate-900">
            Voorwaarden
          </Link>
          <Link href="/beveiliging" className="hover:text-slate-900">
            Beveiliging
          </Link>
        </div>
      </div>
    </footer>
  );
}
