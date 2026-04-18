import { SignupForm } from "./signup-form";

export const metadata = { title: "Create account" };

export default function SignupPage() {
  return (
    <div className="cf-auth-card flex flex-col gap-6 rounded-[var(--cf-radius)] border border-[var(--cf-border)] bg-[var(--cf-surface)] p-8 shadow-sm">
      <div>
        <h1 className="cf-auth-title text-2xl font-semibold">Create account</h1>
        <p className="cf-auth-subtitle text-sm text-[var(--cf-muted-fg)]">
          The first account becomes the admin.
        </p>
      </div>
      <SignupForm />
    </div>
  );
}
