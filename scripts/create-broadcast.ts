import { createDraftBroadcast } from "../src/lib/newsletter";
import "./load-env";

async function main() {
  const result = await createDraftBroadcast();
  if (!result.ok) {
    console.error(result.error);
    process.exit(1);
  }
  console.log(`Draft broadcast created: ${result.id ?? "(no id returned)"}. It was not sent.`);
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
