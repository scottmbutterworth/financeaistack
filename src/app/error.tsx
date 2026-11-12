"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  void error;
  return (
    <div className="wrap page prose">
      <h1>Something broke while loading this page</h1>
      <p>The error was recorded if the database is reachable. You can try the page again.</p>
      <button type="button" onClick={() => reset()}>
        Try again
      </button>
    </div>
  );
}
