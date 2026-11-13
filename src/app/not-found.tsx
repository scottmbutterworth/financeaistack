import Link from "next/link";

export default function NotFound() {
  return (
    <div className="wrap page prose">
      <h1>That page is not in the directory</h1>
      <p>
        <Link href="/">Back to the tools</Link> or <Link href="/search">search</Link>.
      </p>
    </div>
  );
}
