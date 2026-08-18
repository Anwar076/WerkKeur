"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function TeamInviteForm() {
  const [pending, startTransition] = useTransition();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("EMPLOYEE");

  const submit = () => {
    startTransition(async () => {
      const response = await fetch("/api/team", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, role }),
      });

      if (response.ok) {
        setEmail("");
        window.location.reload();
      }
    });
  };

  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="min-w-64 flex-1 space-y-1">
        <label className="text-sm font-medium">E-mailadres</label>
        <Input value={email} onChange={(event) => setEmail(event.target.value)} placeholder="naam@bedrijf.nl" />
      </div>
      <div className="space-y-1">
        <label className="text-sm font-medium">Rol</label>
        <select
          className="h-10 rounded-md border border-slate-200 px-3 text-sm"
          value={role}
          onChange={(event) => setRole(event.target.value)}
        >
          <option value="ADMIN">Admin</option>
          <option value="EMPLOYEE">Employee</option>
        </select>
      </div>
      <Button onClick={submit} disabled={pending || !email}>
        {pending ? "Versturen..." : "Uitnodigen"}
      </Button>
    </div>
  );
}
