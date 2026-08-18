import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Beveiliging | WerkKeur",
  description: "Informatie over beveiligingsmaatregelen binnen WerkKeur.",
};

export default function BeveiligingPage() {
  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-16 sm:px-6">
      <h1 className="text-3xl font-semibold tracking-tight">Beveiliging</h1>
      <div className="mt-6 space-y-4 text-sm leading-7 text-slate-700">
        <p>
          <strong>Informatiepagina — geen certificeringsclaims zonder audit.</strong>
        </p>
        <p>
          WerkKeur gebruikt rolgebaseerde toegang, tenant-isolatie, server-side validatie en veilige
          sessies om klantdata te beschermen.
        </p>
        <p>
          Documenten worden niet publiek opgeslagen; toegang verloopt via geautoriseerde routes en
          tijdelijke uploadtokens.
        </p>
        <p>
          We verbeteren continu logging, monitoring en auditmogelijkheden.
        </p>
      </div>
    </main>
  );
}
