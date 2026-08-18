"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

type Props = {
  initial: {
    reminderDaysBefore30: boolean;
    reminderDaysBefore14: boolean;
    reminderDaysBefore7: boolean;
    reminderOnExpiration: boolean;
    requestReminderAfter3: boolean;
    requestReminderAfter7: boolean;
    requestReminderAfter14: boolean;
  };
};

export function ReminderSettingsForm({ initial }: Props) {
  const [pending, startTransition] = useTransition();
  const [state, setState] = useState(initial);

  const save = () => {
    startTransition(async () => {
      await fetch("/api/settings/reminders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(state),
      });
      window.location.reload();
    });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2 text-sm">
        <label className="flex items-center gap-3 rounded-md border p-3">
          <Checkbox
            checked={state.reminderDaysBefore30}
            onCheckedChange={(value) => setState({ ...state, reminderDaysBefore30: Boolean(value) })}
          />
          30 dagen voor vervaldatum
        </label>
        <label className="flex items-center gap-3 rounded-md border p-3">
          <Checkbox
            checked={state.reminderDaysBefore14}
            onCheckedChange={(value) => setState({ ...state, reminderDaysBefore14: Boolean(value) })}
          />
          14 dagen voor vervaldatum
        </label>
        <label className="flex items-center gap-3 rounded-md border p-3">
          <Checkbox
            checked={state.reminderDaysBefore7}
            onCheckedChange={(value) => setState({ ...state, reminderDaysBefore7: Boolean(value) })}
          />
          7 dagen voor vervaldatum
        </label>
        <label className="flex items-center gap-3 rounded-md border p-3">
          <Checkbox
            checked={state.reminderOnExpiration}
            onCheckedChange={(value) => setState({ ...state, reminderOnExpiration: Boolean(value) })}
          />
          Op de vervaldatum
        </label>
        <label className="flex items-center gap-3 rounded-md border p-3">
          <Checkbox
            checked={state.requestReminderAfter3}
            onCheckedChange={(value) => setState({ ...state, requestReminderAfter3: Boolean(value) })}
          />
          Herinnering na 3 dagen voor ontbrekende uploads
        </label>
        <label className="flex items-center gap-3 rounded-md border p-3">
          <Checkbox
            checked={state.requestReminderAfter7}
            onCheckedChange={(value) => setState({ ...state, requestReminderAfter7: Boolean(value) })}
          />
          Herinnering na 7 dagen
        </label>
        <label className="flex items-center gap-3 rounded-md border p-3">
          <Checkbox
            checked={state.requestReminderAfter14}
            onCheckedChange={(value) => setState({ ...state, requestReminderAfter14: Boolean(value) })}
          />
          Herinnering na 14 dagen
        </label>
      </div>
      <Button onClick={save} disabled={pending}>
        {pending ? "Opslaan..." : "Opslaan"}
      </Button>
    </div>
  );
}
