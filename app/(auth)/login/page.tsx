import { LoginForm } from "./login-form";

export const metadata = { title: "Sign in" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  return (
    <div className="cf-auth-card flex flex-col gap-6 rounded-[var(--cf-radius)] border border-[var(--cf-border)] bg-[var(--cf-surface)] p-8 shadow-sm">
      <div>
        <h1 className="cf-auth-title text-2xl font-semibold">Welcome back</h1>
        <p className="cf-auth-subtitle text-sm text-[var(--cf-muted-fg)]">
          Sign in to continue.
        </p>
      </div>
      <LoginForm next={next} />
    </div>
  );
}
