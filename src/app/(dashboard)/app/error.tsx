"use client";

import { Button } from "@/components/ui/button";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="rounded-lg border border-red-200 bg-red-50 p-6">
      <h2 className="text-lg font-semibold text-red-800">Er ging iets mis</h2>
      <p className="mt-2 text-sm text-red-700">{error.message || "Onbekende fout"}</p>
      <Button className="mt-4" onClick={reset}>
        Opnieuw proberen
      </Button>
    </div>
  );
}
