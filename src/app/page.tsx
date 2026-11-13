import { EntryList, SkillList } from "@/components/directory";
import { SignupForm } from "@/components/signup-form";
import { getCurrentSponsor, recentEntries, searchEntries } from "@/lib/queries";
import { isAustralianSource } from "@/lib/feeds";
import { listNews } from "@/lib/news";
import { STAGES } from "@/lib/skills";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Finance AI Stack — the stack a CFO can defend",
  description:
    "Sourced AI tools, vetted connectors, and a daily finance AI news note for CFOs and finance teams. Prices only where vendors publish them.",
  alternates: { canonical: "/" },
};

export default function HomePage() {
  return (
    <div className="wrap page">
      <Suspense fallback={<p className="status">Loading the directory…</p>}>
        <HomeBody />
      </Suspense>
    </div>
  );
}

async function HomeBody() {
  const [news, recent, workflows, skills, sponsor] = await Promise.all([
    listNews({ status: "published", limit: 5 }),
    recentEntries(7, 8),
    searchEntries({ kind: "workflow", limit: 4 }),
    searchEntries({ kind: "skill", limit: 4 }),
    getCurrentSponsor(),
  ]);

  return (
    <>
      <section className="hero">
        <p className="kicker-label">For CFOs and finance teams</p>
        <div className="hero-grid">
          <div>
            <h1>The finance AI stack a CFO can defend.</h1>
            <p className="lede">
              Sourced tools, vetted connectors, and a daily news note. Prices only where a vendor publishes them.
            </p>
            <form className="search hero-search" action="/search" method="get">
              <label className="sr" htmlFor="home-q">
                Search
              </label>
              <input id="home-q" name="q" placeholder="Close, variance, Xero, payroll…" />
              <button type="submit">Search</button>
            </form>
          </div>
          <div className="panel">
            <h2>The weekly note</h2>
            <p>Five tools, one story, and the week&apos;s finance AI news.</p>
            <SignupForm idPrefix="hero" compact />
          </div>
        </div>
      </section>

      <section>
        <div className="section-head">
          <h2>Today in finance AI</h2>
          <Link href="/news">All news</Link>
        </div>
        {!news.ok ? <p className="notice">The news list is temporarily unavailable.</p> : null}
        {news.ok && news.data.length === 0 ? (
          <p className="notice">Nothing is published yet. Items stay in review until a note is written.</p>
        ) : null}
        {news.data.length > 0 ? (
          <ol className="news-list">
            {news.data.map((item) => (
              <li key={item.id}>
                <a href={item.url}>{item.title}</a>
                <p className="meta">
                  {isAustralianSource(item.source) ? <span className="badge badge-au">AU</span> : null} {item.source}
                  {item.published_at ? ` · ${item.published_at.slice(0, 10)}` : ""}
                </p>
                {item.why_it_matters ? <p>{item.why_it_matters}</p> : null}
              </li>
            ))}
          </ol>
        ) : null}
      </section>

      {recent.ok && recent.data.length > 0 ? (
        <section>
          <div className="section-head">
            <h2>New this week</h2>
            <Link href="/search">Search the directory</Link>
          </div>
          <EntryList entries={recent.data} />
        </section>
      ) : null}

      <section>
        <div className="section-head">
          <h2>Browse by workflow</h2>
          <Link href="/skills">Filter skills</Link>
        </div>
        <div className="stage-grid">
          {STAGES.map((stage) => (
            <Link key={stage.slug} href={`/compare/${stage.slug}`}>
              {stage.name}
            </Link>
          ))}
        </div>
      </section>

      <section>
        <div className="section-head">
          <h2>Featured workflows</h2>
          <Link href="/workflows">All workflows</Link>
        </div>
        {workflows.ok && workflows.data.length === 0 ? <p className="meta">No workflows are published yet.</p> : null}
        <EntryList entries={workflows.data} />
      </section>

      <section>
        <div className="section-head">
          <h2>Skills and connectors</h2>
          <Link href="/skills">All skills</Link>
        </div>
        <p className="lede">Vetted for quality and security. Each card shows access and whether it is flagged for Australia.</p>
        {skills.ok && skills.data.length === 0 ? <p className="meta">No skills are published yet.</p> : null}
        <SkillList entries={skills.data} />
      </section>

      <section className="panel sponsor-slot">
        <h2>{sponsor.data ? `Sponsored by ${sponsor.data.sponsor_name}` : "Sponsor this spot"}</h2>
        <p>
          {sponsor.data?.tagline ||
            "A$150 a week for the bar and a newsletter mention, or A$99 a month for a featured listing."}
        </p>
        <Link className="button" href={sponsor.data ? `/go/${sponsor.data.sponsor_slug}` : "/sponsor"}>
          {sponsor.data ? "Visit sponsor" : "Get in touch"}
        </Link>
      </section>

      <section className="panel">
        <h2>Get the Monday note</h2>
        <p>One email. The week&apos;s tools and the finance AI stories that made the cut.</p>
        <SignupForm idPrefix="cta" />
      </section>
    </>
  );
}
