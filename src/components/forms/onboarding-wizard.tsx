"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type DocumentTypeOption = {
  id: string;
  name: string;
};

type OnboardingWizardProps = {
  initialCompanyName: string;
  documentTypes: DocumentTypeOption[];
};

const ranges = ["1-10", "11-25", "26-75", "76-250", "250+"] as const;

export function OnboardingWizard({ initialCompanyName, documentTypes }: OnboardingWizardProps) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [pending, startTransition] = useTransition();
  const [companyName, setCompanyName] = useState(initialCompanyName);
  const [range, setRange] = useState<(typeof ranges)[number]>("1-10");
  const [selected, setSelected] = useState<string[]>(
    documentTypes.slice(0, 3).map((item) => item.id),
  );

  const submitStep = (nextStep: number) => {
    startTransition(async () => {
      const payload =
        step === 1
          ? { step, data: { organizationName: companyName } }
          : step === 2
            ? { step, data: { subcontractorRange: range } }
            : { step, data: { documentTypeIds: selected } };

      const response = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        return;
      }

      if (step < 3) {
        setStep(nextStep);
      } else {
        setStep(4);
      }
    });
  };

  if (step === 4) {
    return (
      <Card className="mx-auto max-w-xl border-slate-200">
        <CardHeader>
          <CardTitle>WerkKeur is klaar voor gebruik.</CardTitle>
          <CardDescription>
            Je omgeving is ingesteld. Voeg nu je eerste onderaannemer toe.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => router.push("/app/onderaannemers/nieuw")}>
            Voeg je eerste onderaannemer toe
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mx-auto max-w-xl border-slate-200">
      <CardHeader>
        <CardTitle>
          {step === 1 && "Welkom bij WerkKeur"}
          {step === 2 && "Hoeveel onderaannemers werk je ongeveer mee?"}
          {step === 3 && "Welke documenten zijn standaard verplicht?"}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {step === 1 && (
          <div className="space-y-2">
            <Label htmlFor="organizationName">Hoe heet je bedrijf?</Label>
            <Input
              id="organizationName"
              value={companyName}
              onChange={(event) => setCompanyName(event.target.value)}
            />
          </div>
        )}

        {step === 2 && (
          <div className="grid gap-2">
            {ranges.map((value) => (
              <button
                key={value}
                type="button"
                className={`rounded-md border p-3 text-left text-sm ${
                  range === value ? "border-primary bg-primary/5" : "border-slate-200"
                }`}
                onClick={() => setRange(value)}
              >
                {value}
              </button>
            ))}
          </div>
        )}

        {step === 3 && (
          <div className="space-y-3">
            {documentTypes.map((type) => (
              <label key={type.id} className="flex items-center gap-3 rounded-md border p-3 text-sm">
                <Checkbox
                  checked={selected.includes(type.id)}
                  onCheckedChange={(checked) => {
                    setSelected((prev) =>
                      checked ? [...prev, type.id] : prev.filter((id) => id !== type.id),
                    );
                  }}
                />
                {type.name}
              </label>
            ))}
          </div>
        )}

        <div className="flex justify-end">
          <Button onClick={() => submitStep(step + 1)} disabled={pending}>
            {pending ? "Opslaan..." : step === 3 ? "Afronden" : "Volgende"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
