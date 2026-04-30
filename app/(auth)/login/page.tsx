import { Suspense } from "react";
import { LoginForm } from "./login-form";

export const metadata = { title: "Sign in" };

async function LoginFormWithNext({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  return <LoginForm next={next} />;
}

export default function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  return (
    <div className="cm-auth-card flex flex-col gap-6 rounded-[var(--cm-radius)] border border-[var(--cm-border)] bg-[var(--cm-surface)] p-8 shadow-sm">
      <div>
        <h1 className="cm-auth-title text-2xl font-semibold">Welcome back</h1>
        <p className="cm-auth-subtitle text-sm text-[var(--cm-muted-fg)]">
          Sign in to continue.
        </p>
      </div>
      <Suspense fallback={<LoginForm next={undefined} />}>
        <LoginFormWithNext searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
