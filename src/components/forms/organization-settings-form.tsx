"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Props = {
  initial: {
    name: string;
    kvkNumber: string | null;
    addressLine1: string | null;
    postalCode: string | null;
    city: string | null;
    email: string | null;
    phone: string | null;
  };
};

export function OrganizationSettingsForm({ initial }: Props) {
  const [pending, startTransition] = useTransition();
  const [state, setState] = useState({
    name: initial.name,
    kvkNumber: initial.kvkNumber ?? "",
    addressLine1: initial.addressLine1 ?? "",
    postalCode: initial.postalCode ?? "",
    city: initial.city ?? "",
    email: initial.email ?? "",
    phone: initial.phone ?? "",
  });

  const onSubmit = () => {
    startTransition(async () => {
      await fetch("/api/settings/organization", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(state),
      });
      window.location.reload();
    });
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Label>Bedrijfsnaam</Label>
          <Input value={state.name} onChange={(event) => setState({ ...state, name: event.target.value })} />
        </div>
        <div className="space-y-2">
          <Label>KvK-nummer</Label>
          <Input
            value={state.kvkNumber}
            onChange={(event) => setState({ ...state, kvkNumber: event.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label>E-mailadres</Label>
          <Input
            value={state.email}
            onChange={(event) => setState({ ...state, email: event.target.value })}
            type="email"
          />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label>Adres</Label>
          <Input
            value={state.addressLine1}
            onChange={(event) => setState({ ...state, addressLine1: event.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label>Postcode</Label>
          <Input
            value={state.postalCode}
            onChange={(event) => setState({ ...state, postalCode: event.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label>Plaats</Label>
          <Input value={state.city} onChange={(event) => setState({ ...state, city: event.target.value })} />
        </div>
        <div className="space-y-2">
          <Label>Telefoon</Label>
          <Input value={state.phone} onChange={(event) => setState({ ...state, phone: event.target.value })} />
        </div>
      </div>
      <Button onClick={onSubmit} disabled={pending}>
        {pending ? "Opslaan..." : "Opslaan"}
      </Button>
    </div>
  );
}
