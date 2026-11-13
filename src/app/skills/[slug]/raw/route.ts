import { readSkillFile } from "@/lib/skill-files";

type Params = { slug: string };

export async function GET(_request: Request, context: { params: Promise<Params> }) {
  const { slug } = await context.params;
  const body = readSkillFile(slug, "SKILL.md");
  if (body == null) return new Response("Not found", { status: 404 });
  return new Response(body, {
    headers: {
      "content-type": "text/markdown; charset=utf-8",
      "content-disposition": `inline; filename="${slug}-SKILL.md"`,
      "cache-control": "public, max-age=300",
    },
  });
}
