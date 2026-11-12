import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import postgres from "postgres";
import "./load-env";

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error("DATABASE_URL is not set. Add it to .env.local and run again.");
    process.exit(1);
  }

  const sql = postgres(url, { max: 1, prepare: false, ssl: hostNeedsSsl(url) ? "require" : false });
  const schema = readFileSync(resolve("scripts/schema.sql"), "utf8");
  const statements = schema
    .split(/;\s*(?:\n|$)/)
    .map((statement) => statement.trim())
    .filter((statement) => statement.replace(/--.*$/gm, "").trim().length > 0);

  try {
    for (const statement of statements) {
      await sql.unsafe(statement);
    }
    console.log(`Applied ${statements.length} statements. Safe to run again.`);
  } finally {
    await sql.end();
  }
}

function hostNeedsSsl(url: string) {
  try {
    const host = new URL(url).hostname;
    return host !== "localhost" && host !== "127.0.0.1";
  } catch {
    return true;
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
