import { asc } from "drizzle-orm";
import { connection } from "next/server";
import { requireAdmin } from "@/lib/dal";
import { db } from "@/lib/db";
import { users, type TrainerGrants } from "@/lib/db/schema";
import { setUserRoleAction, setTrainerGrantsAction } from "./actions";

export const metadata = { title: "Users & roles" };

const CARD_STYLE: React.CSSProperties = {
  background: "var(--paper-2)",
  border: "1px solid var(--hair)",
  borderRadius: "var(--radius-lg)",
  padding: 20,
};

const ROLE_OPTIONS = [
  { value: "admin", label: "Admin" },
  { value: "trainer", label: "Trainer" },
  { value: "student", label: "Student" },
] as const;

function grants(raw: unknown): TrainerGrants {
  if (!raw || typeof raw !== "object") return {};
  const g = raw as TrainerGrants;
  return { publish: !!g.publish, pricing: !!g.pricing };
}

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ err?: string }>;
}) {
  await connection();
  const { session } = await requireAdmin();
  const [rows, sp] = await Promise.all([
    db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        trainerGrants: users.trainerGrants,
        createdAt: users.createdAt,
      })
      .from(users)
      .orderBy(asc(users.createdAt)),
    searchParams,
  ]);

  const errMsg =
    sp.err === "self-demote"
      ? "You cannot demote yourself from admin. Ask another admin."
      : null;

  const counts = rows.reduce(
    (acc, u) => {
      acc[u.role] = (acc[u.role] ?? 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  return (
    <>
      <div className="admin-header">
        <div>
          <h1>Users & roles</h1>
          <div className="admin-header-sub">
            — {rows.length} total · {counts.admin ?? 0} admin ·{" "}
            {counts.trainer ?? 0} trainer · {counts.student ?? 0} student
          </div>
        </div>
      </div>

      <div className="admin-section">
        {errMsg && (
          <div
            role="alert"
            style={{
              ...CARD_STYLE,
              borderColor: "var(--danger, #d63838)",
              color: "var(--danger, #d63838)",
              marginBottom: 16,
              fontSize: 13,
            }}
          >
            {errMsg}
          </div>
        )}

        <section style={{ ...CARD_STYLE, marginBottom: 20 }}>
          <div className="mono-label" style={{ marginBottom: 4 }}>
            — How roles work
          </div>
          <ul
            style={{
              margin: "10px 0 0",
              padding: 0,
              listStyle: "none",
              fontSize: 13,
              color: "var(--ink-2)",
              display: "grid",
              gap: 6,
            }}
          >
            <li>
              <b>Admin</b> — full access: courses, pricing, publishing,
              settings, appearance, users.
            </li>
            <li>
              <b>Trainer</b> — can create & manage courses, modules, lessons,
              and upload video. Cannot access settings/appearance or
              change publish/pricing unless granted below.
            </li>
            <li>
              <b>Student</b> — enrolls in and views courses.
            </li>
          </ul>
        </section>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {rows.map((u) => {
            const isSelf = u.id === session.user.id;
            const g = grants(u.trainerGrants);
            return (
              <div key={u.id} style={CARD_STYLE}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "baseline",
                    gap: 16,
                    marginBottom: 12,
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontSize: 14,
                        fontWeight: 600,
                        color: "var(--ink)",
                      }}
                    >
                      {u.name}
                      {isSelf ? (
                        <span
                          className="mono-label"
                          style={{ marginLeft: 8, fontSize: 10 }}
                        >
                          — YOU
                        </span>
                      ) : null}
                    </div>
                    <div
                      className="mono-label"
                      style={{ fontSize: 11, marginTop: 2 }}
                    >
                      {u.email}
                    </div>
                  </div>
                  <span
                    className={`status ${
                      u.role === "admin"
                        ? "status-published"
                        : u.role === "trainer"
                          ? "status-draft"
                          : ""
                    }`}
                  >
                    {u.role}
                  </span>
                </div>

                <form
                  action={setUserRoleAction}
                  style={{
                    display: "flex",
                    gap: 8,
                    alignItems: "end",
                    marginBottom: u.role === "trainer" ? 14 : 0,
                  }}
                >
                  <input type="hidden" name="id" value={u.id} />
                  <div className="field" style={{ margin: 0, flex: 1 }}>
                    <label>ROLE</label>
                    <select name="role" defaultValue={u.role}>
                      {ROLE_OPTIONS.map((r) => (
                        <option key={r.value} value={r.value}>
                          {r.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <button type="submit" className="btn btn-ink">
                    Update role
                  </button>
                </form>

                {u.role === "trainer" ? (
                  <form
                    action={setTrainerGrantsAction}
                    style={{
                      borderTop: "1px dotted var(--hair-2)",
                      paddingTop: 12,
                      display: "flex",
                      flexDirection: "column",
                      gap: 8,
                    }}
                  >
                    <input type="hidden" name="id" value={u.id} />
                    <div className="mono-label" style={{ fontSize: 10 }}>
                      — Trainer grants
                    </div>
                    <label
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        fontSize: 13,
                        color: "var(--ink)",
                      }}
                    >
                      <input
                        type="checkbox"
                        name="publish"
                        defaultChecked={!!g.publish}
                      />
                      <span>
                        Allow toggling course <b>visibility</b> (publish /
                        unpublish)
                      </span>
                    </label>
                    <label
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        fontSize: 13,
                        color: "var(--ink)",
                      }}
                    >
                      <input
                        type="checkbox"
                        name="pricing"
                        defaultChecked={!!g.pricing}
                      />
                      <span>
                        Allow changing <b>pricing</b> (price, currency, free
                        flag)
                      </span>
                    </label>
                    <div>
                      <button type="submit" className="btn btn-ghost">
                        Save grants
                      </button>
                    </div>
                  </form>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
