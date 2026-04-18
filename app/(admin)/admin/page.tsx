export const metadata = { title: "Admin overview" };

export default function AdminOverviewPage() {
  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-2xl font-semibold">Overview</h1>
        <p className="text-sm text-[var(--cf-muted-fg)]">
          Revenue and enrollment stats will surface here.
        </p>
      </header>
      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {["Revenue", "Enrollments", "Courses"].map((label) => (
          <div
            key={label}
            className="rounded-[var(--cf-radius)] border border-[var(--cf-border)] bg-[var(--cf-surface)] p-4"
          >
            <div className="text-sm text-[var(--cf-muted-fg)]">{label}</div>
            <div className="mt-2 text-2xl font-semibold">—</div>
          </div>
        ))}
      </section>
    </div>
  );
}
