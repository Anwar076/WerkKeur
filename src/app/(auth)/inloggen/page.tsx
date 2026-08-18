import Link from "next/link";
import { LoginForm } from "@/components/forms/login-form";

export default function InloggenPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">Inloggen</h1>
        <p className="text-sm text-slate-600">Welkom terug bij WerkKeur.</p>
      </div>
      <LoginForm />
      <div className="flex items-center justify-between text-sm">
        <Link href="/wachtwoord-vergeten" className="text-slate-600 hover:text-slate-900">
          Wachtwoord vergeten?
        </Link>
        <Link href="/registreren" className="font-medium text-slate-900">
          Nog geen account?
        </Link>
      </div>
    </div>
  );
}
