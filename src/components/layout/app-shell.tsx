"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, CircleHelp, FileText, LayoutDashboard, Menu, Settings, Users, UserSquare2 } from "lucide-react";
import { signOut } from "next-auth/react";
import { useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

type AppShellProps = {
  organizationName: string;
  userName: string;
  userInitials: string;
  children: React.ReactNode;
};

const primaryNav = [
  { href: "/app", label: "Overzicht", icon: LayoutDashboard },
  { href: "/app/onderaannemers", label: "Onderaannemers", icon: UserSquare2 },
  { href: "/app/documenten", label: "Documenten", icon: FileText },
  { href: "/app/verzoeken", label: "Verzoeken", icon: Users },
  { href: "/app/meldingen", label: "Meldingen", icon: Bell },
];

const secondaryNav = [
  { href: "/app/team", label: "Team", icon: Users },
  { href: "/app/instellingen", label: "Instellingen", icon: Settings },
  { href: "/app/help", label: "Help", icon: CircleHelp },
];

function NavLinks() {
  const pathname = usePathname();

  return (
    <nav className="space-y-1">
      {primaryNav.map((item) => {
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              pathname === item.href || pathname.startsWith(`${item.href}/`)
                ? "bg-slate-900 text-white"
                : "text-slate-700 hover:bg-slate-100",
            )}
          >
            <Icon className="h-4 w-4" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function AppShell({ organizationName, userName, userInitials, children }: AppShellProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50">
      <aside className="fixed inset-y-0 left-0 hidden w-72 border-r border-slate-200 bg-white lg:block">
        <div className="flex h-full flex-col p-5">
          <Link href="/" className="mb-6 text-xl font-semibold text-slate-900">
            WerkKeur
          </Link>
          <NavLinks />
          <div className="mt-auto space-y-1 border-t border-slate-200 pt-4">
            {secondaryNav.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-slate-700 hover:bg-slate-100"
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
            <p className="px-3 pt-2 text-xs text-slate-500">{organizationName}</p>
          </div>
        </div>
      </aside>

      <div className="lg:pl-72">
        <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
          <div className="flex h-16 items-center justify-between px-4 sm:px-6">
            <div className="flex items-center gap-3">
              <Sheet open={open} onOpenChange={setOpen}>
                <SheetTrigger className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-slate-200 lg:hidden">
                  <Menu className="h-4 w-4" />
                </SheetTrigger>
                <SheetContent side="left" className="w-72">
                  <div className="mt-6">
                    <p className="mb-4 text-lg font-semibold">WerkKeur</p>
                    <NavLinks />
                  </div>
                </SheetContent>
              </Sheet>
              <input
                aria-label="Zoeken"
                placeholder="Zoeken..."
                className="h-9 w-56 rounded-md border border-slate-200 px-3 text-sm outline-none ring-primary/20 focus:ring-2"
              />
            </div>
            <div className="flex items-center gap-4">
              <Link href="/app/meldingen" className="text-slate-600 hover:text-slate-900">
                <Bell className="h-5 w-5" />
              </Link>
              <div className="flex items-center gap-2">
                <Avatar className="h-9 w-9">
                  <AvatarFallback>{userInitials}</AvatarFallback>
                </Avatar>
                <div className="hidden text-sm sm:block">
                  <p className="font-medium">{userName}</p>
                </div>
              </div>
              <Button
                variant="outline"
                onClick={() => signOut({ callbackUrl: "/inloggen" })}
                className="hidden sm:inline-flex"
              >
                Uitloggen
              </Button>
            </div>
          </div>
        </header>
        <main className="p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
