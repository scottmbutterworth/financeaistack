import postgres from "postgres";

type Sql = ReturnType<typeof postgres>;

export function isPrerenderInterrupt(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  return message.includes("During prerendering") || message.includes("prerender is complete");
}

let client: Sql | null = null;
let clientUrl: string | null = null;

function needsSsl(url: string) {
  try {
    const host = new URL(url).hostname;
    return host !== "localhost" && host !== "127.0.0.1";
  } catch {
    return true;
  }
}

export async function getSql(): Promise<Sql | null> {
  if (process.env.NEXT_RUNTIME) {
    const { connection } = await import("next/server");
    await connection();
  }

  const url = process.env.DATABASE_URL;
  if (!url) return null;

  if (!client || clientUrl !== url) {
    if (client) {
      await client.end({ timeout: 1 }).catch(() => undefined);
    }
    client = postgres(url, {
      max: 1,
      idle_timeout: 20,
      connect_timeout: 10,
      prepare: false,
      ssl: needsSsl(url) ? "require" : false,
    });
    clientUrl = url;
  }

  return client;
}

export async function logError(error: unknown, path?: string, digest?: string) {
  if (isPrerenderInterrupt(error)) return;
  const message = error instanceof Error ? error.message : String(error);
  const stack = error instanceof Error ? error.stack ?? null : null;
  try {
    const sql = await getSql();
    if (!sql) return;
    await sql`
      INSERT INTO errors (message, stack, path, digest)
      VALUES (${message.slice(0, 4000)}, ${stack?.slice(0, 8000) ?? null}, ${path ?? null}, ${digest ?? null})
    `;
  } catch {
    console.error("Failed to persist error", message);
  }
}
