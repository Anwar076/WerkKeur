import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function HelpPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Help</h1>
        <p className="text-sm text-slate-600">Ondersteuning en praktische tips voor WerkKeur.</p>
      </div>
      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle>Ondersteuning</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-slate-700">
          <p>E-mail: support@werkkeur.nl</p>
          <p>Telefonisch: +31 (0)20 123 45 67</p>
          <p>
            Voor prioriteitsondersteuning kun je later een Business- of Pro-abonnement kiezen.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
