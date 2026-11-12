import type { Instrumentation } from "next";

export const onRequestError: Instrumentation.onRequestError = async (error, request, context) => {
  const { logError } = await import("@/lib/db");
  const digest = typeof error === "object" && error && "digest" in error ? String(error.digest) : undefined;
  await logError(error, `${request.method} ${request.path}`, digest ?? context.routePath);
};
