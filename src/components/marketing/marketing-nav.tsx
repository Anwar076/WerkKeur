"use client";

import Link from "next/link";
import { Menu } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const links = [
  { href: "#product", label: "Product" },
  { href: "#werkwijze", label: "Werkwijze" },
  { href: "/prijzen", label: "Prijzen" },
  { href: "#faq", label: "Veelgestelde vragen" },
];

export function MarketingNav() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="text-xl font-semibold tracking-tight text-slate-950">
          WerkKeur
        </Link>

        <nav className="hidden items-center gap-7 text-sm text-slate-700 md:flex">
          {links.map((link) => (
            <Link key={link.label} href={link.href} className="hover:text-slate-950">
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <Button variant="ghost" asChild>
            <Link href="/inloggen">Inloggen</Link>
          </Button>
          <Button asChild>
            <Link href="/registreren">Gratis proberen</Link>
          </Button>
        </div>

        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger
            className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-slate-200 md:hidden"
            aria-label="Menu openen"
          >
            <Menu className="h-4 w-4" />
          </SheetTrigger>
          <SheetContent side="right">
            <div className="mt-8 flex flex-col gap-4">
              {links.map((link) => (
                <Link key={link.label} href={link.href} onClick={() => setOpen(false)}>
                  {link.label}
                </Link>
              ))}
              <Link href="/inloggen" onClick={() => setOpen(false)}>
                Inloggen
              </Link>
              <Button asChild>
                <Link href="/registreren" onClick={() => setOpen(false)}>
                  Gratis proberen
                </Link>
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
