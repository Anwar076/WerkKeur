import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacyverklaring | WerkKeur",
  description: "Privacyverklaring van WerkKeur voor zakelijke gebruikers in Nederland.",
};

export default function PrivacyPage() {
  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-16 sm:px-6">
      <h1 className="text-3xl font-semibold tracking-tight">Privacyverklaring</h1>
      <div className="mt-6 space-y-4 text-sm leading-7 text-slate-700">
        <p>
          <strong>Concepttekst — juridisch laten toetsen.</strong>
        </p>
        <p>
          WerkKeur verwerkt uitsluitend persoonsgegevens die nodig zijn voor documentbeheer van
          onderaannemers, zoals naam, e-mailadres en bedrijfsgegevens.
        </p>
        <p>
          Gegevens worden opgeslagen binnen de EU of bij gelijkwaardige beschermingsmaatregelen.
          Toegang is beperkt op basis van rollen en tenant-scheiding.
        </p>
        <p>
          Betrokkenen kunnen verzoeken om inzage, correctie en verwijdering via
          privacy@werkkeur.nl.
        </p>
      </div>
    </main>
  );
}
