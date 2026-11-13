import { zipSkillFolder } from "@/lib/skill-files";

type Params = { slug: string };

export async function GET(_request: Request, context: { params: Promise<Params> }) {
  const { slug } = await context.params;
  const zip = await zipSkillFolder(slug);
  if (!zip) return new Response("Not found", { status: 404 });
  return new Response(new Uint8Array(zip), {
    headers: {
      "content-type": "application/zip",
      "content-disposition": `attachment; filename="${slug}.zip"`,
      "cache-control": "public, max-age=300",
    },
  });
}
