import { SignupForm } from "./signup-form";

export const metadata = { title: "Create account" };

export default function SignupPage() {
  return (
    <div className="cm-auth-card flex flex-col gap-6 rounded-[var(--cm-radius)] border border-[var(--cm-border)] bg-[var(--cm-surface)] p-8 shadow-sm">
      <div>
        <h1 className="cm-auth-title text-2xl font-semibold">Create account</h1>
        <p className="cm-auth-subtitle text-sm text-[var(--cm-muted-fg)]">
          The first account becomes the admin.
        </p>
      </div>
      <SignupForm />
    </div>
  );
}
