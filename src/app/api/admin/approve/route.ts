import { getSql, logError } from "@/lib/db";
import { requireAdmin, slugify, unauthorized } from "@/lib/http";

export async function POST(request: Request) {
  if (!requireAdmin(request)) return unauthorized();
  const body = await request.json().catch(() => null);
  const id = body && typeof body === "object" && "id" in body ? Number((body as { id: unknown }).id) : NaN;
  const action = body && typeof body === "object" && "action" in body ? (body as { action: unknown }).action : "";
  if (!Number.isInteger(id) || (action !== "approve" && action !== "reject")) {
    return Response.json({ error: "Send { id, action: 'approve' | 'reject' }." }, { status: 400 });
  }

  try {
    const sql = await getSql();
    if (!sql) return Response.json({ error: "Database unavailable." }, { status: 503 });
    const rows = await sql<
      {
        id: number;
        kind: string;
        name: string;
        website_url: string | null;
        summary: string;
        categories: string[];
        notes: string | null;
        status: string;
      }[]
    >`SELECT id, kind, name, website_url, summary, categories, notes, status FROM submissions WHERE id = ${id}`;
    const submission = rows[0];
    if (!submission) return Response.json({ error: "Submission not found." }, { status: 404 });
    if (submission.status !== "pending") {
      return Response.json({ error: "That submission is already reviewed." }, { status: 409 });
    }

    if (action === "reject") {
      await sql`UPDATE submissions SET status = 'rejected', reviewed_at = NOW() WHERE id = ${id}`;
      return Response.json({ ok: true, status: "rejected" });
    }

    let slug = slugify(submission.name) || `entry-${id}`;
    const taken = await sql<{ slug: string }[]>`SELECT slug FROM entries WHERE slug = ${slug} OR slug LIKE ${`${slug}-%`}`;
    if (taken.some((row) => row.slug === slug)) {
      slug = `${slug}-${id}`;
    }
    const description = [submission.summary, submission.notes ? `Submitter notes: ${submission.notes}` : ""]
      .filter(Boolean)
      .join("\n\n");
    const steps =
      submission.kind === "workflow"
        ? [{ title: "Submitted workflow", body: submission.notes || submission.summary }]
        : null;

    await sql.begin(async (tx) => {
      await tx`
        INSERT INTO entries (
          slug, kind, name, summary, description, website_url, pricing_summary,
          categories, steps, published, featured
        ) VALUES (
          ${slug},
          ${submission.kind},
          ${submission.name},
          ${submission.summary},
          ${description},
          ${submission.website_url},
          ${"Not stated in the submission. Check the vendor site."},
          ${submission.categories ?? []},
          ${steps ? tx.json(steps) : null},
          ${true},
          ${false}
        )
      `;
      await tx`
        UPDATE submissions
        SET status = 'approved', reviewed_at = NOW(), entry_slug = ${slug}
        WHERE id = ${id}
      `;
    });

    return Response.json({ ok: true, status: "approved", slug });
  } catch (error) {
    await logError(error, "POST /api/admin/approve");
    return Response.json({ error: "Could not review that submission." }, { status: 500 });
  }
}
