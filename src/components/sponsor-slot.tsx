import { SponsorBar } from "@/components/sponsor-bar";
import { getCurrentSponsor } from "@/lib/queries";

export async function SponsorSlot() {
  const sponsor = await getCurrentSponsor();
  return <SponsorBar sponsor={sponsor.ok ? sponsor.data : null} />;
}
