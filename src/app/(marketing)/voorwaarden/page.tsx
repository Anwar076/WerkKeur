import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Algemene voorwaarden | WerkKeur",
  description: "Concept algemene voorwaarden voor gebruik van WerkKeur.",
};

export default function VoorwaardenPage() {
  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-16 sm:px-6">
      <h1 className="text-3xl font-semibold tracking-tight">Algemene voorwaarden</h1>
      <div className="mt-6 space-y-4 text-sm leading-7 text-slate-700">
        <p>
          <strong>Concepttekst — juridisch laten toetsen.</strong>
        </p>
        <p>
          Deze voorwaarden zijn van toepassing op het gebruik van WerkKeur door zakelijke klanten.
          Klanten zijn verantwoordelijk voor de juistheid van aangeleverde documenten.
        </p>
        <p>
          WerkKeur levert software als dienst en streeft naar hoge beschikbaarheid, maar geeft geen
          absolute garanties op ononderbroken toegang.
        </p>
        <p>
          Aansprakelijkheid, opzegtermijnen, betaalvoorwaarden en verwerkersafspraken worden in de
          definitieve contractstukken vastgelegd.
        </p>
      </div>
    </main>
  );
}
