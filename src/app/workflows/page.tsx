import { DbNotice, EntryList } from "@/components/directory";
import { searchEntries } from "@/lib/queries";
import type { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Workflows",
  description: "Step-by-step AI workflows finance teams can run, each linked to the tools it uses.",
};

export default function WorkflowsPage() {
  return (
    <div className="wrap page">
      <Suspense fallback={<p className="status">Loading workflows…</p>}>
        <WorkflowsBody />
      </Suspense>
    </div>
  );
}

async function WorkflowsBody() {
  const workflows = await searchEntries({ kind: "workflow", limit: 50 });
  return (
    <>
      <h1>Workflows</h1>
      <p className="lede">Proven sequences. The tools are linked. The person who owns the number still signs it.</p>
      <DbNotice ok={workflows.ok} empty={workflows.ok && workflows.data.length === 0} />
      <EntryList entries={workflows.data} />
    </>
  );
}
