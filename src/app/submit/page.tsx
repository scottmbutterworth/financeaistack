import { SubmitForm } from "@/components/submit-form";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Submit a tool or workflow",
  description: "Suggest an AI tool or a finance workflow. Submissions sit in a review queue before they are published.",
};

export default function SubmitPage() {
  return (
    <div className="wrap page">
      <h1>Submit a tool or workflow</h1>
      <p className="lede">
        A person reviews this before it is published. Include the vendor&apos;s own page. Do not send a price you cannot
        point at.
      </p>
      <SubmitForm />
    </div>
  );
}
