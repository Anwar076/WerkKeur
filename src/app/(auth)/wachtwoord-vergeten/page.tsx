import Link from "next/link";
import { ForgotPasswordForm } from "@/components/forms/forgot-password-form";

export default function WachtwoordVergetenPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">Wachtwoord vergeten</h1>
        <p className="text-sm text-slate-600">
          Vul je e-mailadres in. We sturen je herstelinstructies.
        </p>
      </div>
      <ForgotPasswordForm />
      <Link href="/inloggen" className="text-sm text-slate-600 hover:text-slate-900">
        Terug naar inloggen
      </Link>
    </div>
  );
}
