import Link from "next/link";
import { CheckCircle2, CircleAlert, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function HomePage() {
  return (
    <main>
      <section className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:py-20">
        <div className="space-y-6">
          <h1 className="text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
            Alle documenten van je onderaannemers. Altijd op orde.
          </h1>
          <p className="max-w-xl text-lg text-slate-600">
            WerkKeur verzamelt, controleert en bewaakt de documenten van je onderaannemers. Zo zie je
            direct wie klaar is om aan het werk te gaan.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link href="/registreren">Gratis proberen</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <a href="#werkwijze">Bekijk hoe het werkt</a>
            </Button>
          </div>
          <p className="text-sm text-slate-500">14 dagen gratis · Geen creditcard nodig</p>
        </div>

        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle>WerkKeur Dashboard</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-md border border-slate-200 p-3">
                <p className="text-xs text-slate-500">In orde</p>
                <p className="text-xl font-semibold text-emerald-700">108</p>
              </div>
              <div className="rounded-md border border-slate-200 p-3">
                <p className="text-xs text-slate-500">Aandacht</p>
                <p className="text-xl font-semibold text-amber-700">14</p>
              </div>
              <div className="rounded-md border border-slate-200 p-3">
                <p className="text-xs text-slate-500">Actie</p>
                <p className="text-xl font-semibold text-red-700">5</p>
              </div>
            </div>
            <div className="space-y-2 rounded-md border border-slate-200 p-3 text-sm">
              <p className="font-medium">Actie vereist</p>
              <div className="flex items-center justify-between">
                <p>Dakwerken Zuid B.V. · VCA verlopen</p>
                <CircleAlert className="h-4 w-4 text-red-600" />
              </div>
              <div className="flex items-center justify-between">
                <p>Van Dijk Installaties · AVB ontbreekt</p>
                <CircleAlert className="h-4 w-4 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      <section id="product" className="border-y border-slate-200 bg-slate-50">
        <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6">
          <h2 className="text-3xl font-semibold tracking-tight">
            Stop met zoeken in Excel, mailboxen en mappen.
          </h2>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <Card className="border-slate-200">
              <CardHeader>
                <CardTitle className="text-lg">Documenten overal verspreid</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-slate-600">
                VCA&apos;s in de mailbox, verzekeringen in mappen en gegevens in Excel.
              </CardContent>
            </Card>
            <Card className="border-slate-200">
              <CardHeader>
                <CardTitle className="text-lg">Verlopen documenten</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-slate-600">
                Je ontdekt te laat dat een certificaat of verzekering niet meer geldig is.
              </CardContent>
            </Card>
            <Card className="border-slate-200">
              <CardHeader>
                <CardTitle className="text-lg">Eindeloos achter documenten aan</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-slate-600">
                Onderaannemers vergeten documenten aan te leveren en medewerkers moeten blijven mailen.
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section id="werkwijze" className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6">
        <h2 className="text-3xl font-semibold tracking-tight">Zo werkt WerkKeur</h2>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle className="text-lg">1. Voeg een onderaannemer toe</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-slate-600">
              Vul de bedrijfsgegevens in en kies welke documenten verplicht zijn.
            </CardContent>
          </Card>
          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle className="text-lg">2. WerkKeur vraagt de documenten op</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-slate-600">
              De onderaannemer ontvangt automatisch een veilige persoonlijke uploadlink.
            </CardContent>
          </Card>
          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle className="text-lg">3. Zie direct wie in orde is</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-slate-600">
              WerkKeur bewaakt ontbrekende documenten en vervaldatums en stuurt automatisch herinneringen.
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="border-y border-slate-200 bg-slate-50">
        <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6">
          <h2 className="text-3xl font-semibold tracking-tight">Functionaliteiten</h2>
          <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[
              "Centraal documentenbeheer",
              "Automatische herinneringen",
              "Persoonlijke uploadlinks",
              "Vervaldatums bewaken",
              "Direct overzicht",
              "Eigen documenttypes",
              "Veilige opslag",
            ].map((feature) => (
              <Card key={feature} className="border-slate-200">
                <CardContent className="flex items-start gap-3 p-4 text-sm">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-600" />
                  <p>{feature}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section id="faq" className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6">
        <h2 className="text-3xl font-semibold tracking-tight">Veelgestelde vragen</h2>
        <div className="mt-8 space-y-4">
          <Card className="border-slate-200">
            <CardContent className="p-4">
              <p className="font-medium">Moeten onderaannemers een account aanmaken?</p>
              <p className="mt-1 text-sm text-slate-600">
                Nee, onderaannemers leveren documenten aan via een persoonlijke beveiligde link.
              </p>
            </CardContent>
          </Card>
          <Card className="border-slate-200">
            <CardContent className="p-4">
              <p className="font-medium">Kan ik eigen documenttypes instellen?</p>
              <p className="mt-1 text-sm text-slate-600">
                Ja, je bepaalt zelf welke documenten verplicht zijn voor jouw organisatie.
              </p>
            </CardContent>
          </Card>
          <Card className="border-slate-200">
            <CardContent className="p-4">
              <p className="font-medium">Is WerkKeur geschikt voor 5–250 onderaannemers?</p>
              <p className="mt-1 text-sm text-slate-600">
                Ja, WerkKeur is speciaal ontwikkeld voor mkb-bedrijven met veel onderaannemers.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="border-t border-slate-200 bg-slate-950 py-16 text-white">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-start justify-between gap-6 px-4 sm:flex-row sm:items-center sm:px-6">
          <div className="space-y-2">
            <p className="text-2xl font-semibold">Iedere onderaannemer. Altijd op orde.</p>
            <p className="text-sm text-slate-300">Start vandaag nog met 14 dagen gratis proberen.</p>
          </div>
          <Button asChild variant="secondary" size="lg">
            <Link href="/registreren">
              <ShieldCheck className="mr-2 h-4 w-4" />
              Gratis proberen
            </Link>
          </Button>
        </div>
      </section>
    </main>
  );
}
