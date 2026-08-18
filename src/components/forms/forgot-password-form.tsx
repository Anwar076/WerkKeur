"use client";

import { useState, useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { passwordResetRequestSchema } from "@/lib/validation";

type FormValues = z.infer<typeof passwordResetRequestSchema>;

export function ForgotPasswordForm() {
  const [pending, startTransition] = useTransition();
  const [sent, setSent] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(passwordResetRequestSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = (values: FormValues) => {
    startTransition(async () => {
      await fetch("/api/password-reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      setSent(true);
    });
  };

  return (
    <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
      <div className="space-y-2">
        <Label htmlFor="email">Zakelijk e-mailadres</Label>
        <Input id="email" type="email" {...form.register("email")} />
      </div>
      {sent && (
        <p className="text-sm text-emerald-700">
          Als het e-mailadres bestaat, is er een herstelbericht verstuurd.
        </p>
      )}
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Versturen..." : "Stuur herstelinstructies"}
      </Button>
    </form>
  );
}
