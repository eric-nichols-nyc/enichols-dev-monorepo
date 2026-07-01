"use client";

import type { GeneratePipelineResult } from "@/features/project-publisher/lib/schema";

type DraftPreviewProps = {
  draft: GeneratePipelineResult | null;
};

export function DraftPreview({ draft }: DraftPreviewProps) {
  if (!draft) {
    return (
      <section className="border-border bg-muted/20 flex min-h-64 flex-col gap-2 rounded-lg border p-4">
        <h2 className="text-sm font-medium">Draft preview</h2>
        <p className="text-muted-foreground text-sm">
          Generated markdown and project data will appear here.
        </p>
      </section>
    );
  }

  return (
    <section className="border-border flex min-h-64 flex-col gap-4 rounded-lg border p-4">
      <h2 className="text-sm font-medium">Draft preview</h2>
      {draft.errors.length > 0 ? (
        <ul className="text-destructive list-disc pl-5 text-sm">
          {draft.errors.map((message) => (
            <li key={message}>{message}</li>
          ))}
        </ul>
      ) : null}
      {draft.markdown ? (
        <pre className="bg-muted max-h-64 overflow-auto rounded-md p-3 text-xs whitespace-pre-wrap">
          {draft.markdown}
        </pre>
      ) : null}
      {draft.project ? (
        <pre className="bg-muted max-h-64 overflow-auto rounded-md p-3 text-xs whitespace-pre-wrap">
          {JSON.stringify(draft.project, null, 2)}
        </pre>
      ) : null}
    </section>
  );
}
