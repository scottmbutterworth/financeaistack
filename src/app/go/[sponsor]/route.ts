import { getSponsorDestination, logSponsorClick } from "@/lib/queries";

type Params = { sponsor: string };

export async function GET(request: Request, context: { params: Promise<Params> }) {
  const { sponsor } = await context.params;
  const destination = await getSponsorDestination(sponsor);
  if (!destination || !/^https?:\/\//i.test(destination)) {
    return new Response("This sponsor link is not active.", {
      status: 404,
      headers: { "content-type": "text/plain; charset=utf-8" },
    });
  }

  const referer = request.headers.get("referer");
  await logSponsorClick(sponsor, referer);
  return Response.redirect(destination, 302);
}
