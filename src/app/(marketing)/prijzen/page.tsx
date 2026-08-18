import Link from "next/link";
import type { Metadata } from "next";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Prijzen | WerkKeur",
  description: "Kies het WerkKeur abonnement dat past bij jouw organisatie.",
};

const plans = [
  {
    name: "Starter",
    price: "€29",
    subtitle: "per maand",
    features: [
      "Tot 15 actieve onderaannemers",
      "Documentbeheer",
      "Vervaldatums",
      "E-mailverzoeken",
      "Automatische herinneringen",
      "1 gebruiker",
    ],
  },
  {
    name: "Business",
    price: "€69",
    subtitle: "per maand",
    highlight: "Meest gekozen",
    features: [
      "Tot 75 actieve onderaannemers",
      "Alles in Starter",
      "5 gebruikers",
      "Eigen documenttypes",
      "Uitgebreid overzicht",
      "Exportfunctionaliteit",
      "Prioriteit support",
    ],
  },
  {
    name: "Pro",
    price: "€129",
    subtitle: "per maand",
    features: [
      "Tot 250 actieve onderaannemers",
      "Alles in Business",
      "Onbeperkt gebruikers",
      "Meerdere projecten",
      "Geavanceerde rapportages",
      "API-toegang (binnenkort)",
    ],
  },
];

export default function PrijzenPage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="text-4xl font-semibold tracking-tight">Duidelijke prijzen voor elk team</h1>
        <p className="mt-3 text-slate-600">
          Start zonder risico en schaal op wanneer je organisatie groeit.
        </p>
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-3">
        {plans.map((plan) => (
          <Card
            key={plan.name}
            className={`border-slate-200 ${plan.highlight ? "border-slate-900 shadow-md" : ""}`}
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{plan.name}</CardTitle>
                {plan.highlight && (
                  <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-medium text-white">
                    {plan.highlight}
                  </span>
                )}
              </div>
              <p className="text-3xl font-semibold">
                {plan.price} <span className="text-sm font-normal text-slate-500">{plan.subtitle}</span>
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2 text-sm">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2">
                    <Check className="mt-0.5 h-4 w-4 text-emerald-600" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Button asChild className="w-full">
                <Link href="/registreren">Start gratis</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <p className="mt-8 text-center text-sm text-slate-600">
        Alle abonnementen zijn 14 dagen gratis te proberen. Geen creditcard nodig.
      </p>
    </main>
  );
}
