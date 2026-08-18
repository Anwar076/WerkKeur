import Link from "next/link";
import { RegisterForm } from "@/components/forms/register-form";

export default function RegistrerenPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">Start met WerkKeur</h1>
        <p className="text-sm text-slate-600">14 dagen gratis · Geen creditcard nodig</p>
      </div>
      <RegisterForm />
      <p className="text-sm text-slate-600">
        Heb je al een account?{" "}
        <Link href="/inloggen" className="font-medium text-slate-900">
          Log hier in
        </Link>
      </p>
    </div>
  );
}
