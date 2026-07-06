"use client";

import type { ReactNode } from "react";
import { ProjectDraftSummary } from "@/features/project-publisher/components/project-draft-summary";
import type { GeneratePipelineResult } from "@/features/project-publisher/lib/schema";
import { isValidDraft } from "@/features/project-publisher/lib/validate-project";

type DraftPreviewProps = {
  draft: GeneratePipelineResult | null;
};

function PreviewSection({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-1">
        <h3 className="font-medium text-sm">{title}</h3>
        {description ? (
          <p className="text-muted-foreground text-xs">{description}</p>
        ) : null}
      </div>
      {children}
    </div>
  );
}

export function DraftPreview({ draft }: DraftPreviewProps) {
  if (!draft) {
    return (
      <section className="flex min-h-64 flex-col gap-2 rounded-lg border border-border bg-muted/20 p-4">
        <h2 className="font-medium text-sm">Draft preview</h2>
        <p className="text-muted-foreground text-sm">
          Generated markdown and project data will appear here after a valid
          draft is generated.
        </p>
      </section>
    );
  }

  if (draft.errors.length > 0) {
    return (
      <section className="flex min-h-64 flex-col gap-3 rounded-lg border border-destructive/40 bg-destructive/5 p-4">
        <div className="flex flex-col gap-1">
          <h2 className="font-medium text-destructive text-sm">
            Draft validation failed
          </h2>
          <p className="text-muted-foreground text-sm">
            Fix the issues below and generate again. Preview and publish are
            blocked until the project object is valid.
          </p>
        </div>
        <ul className="list-disc space-y-1 pl-5 text-destructive text-sm">
          {draft.errors.map((message) => (
            <li key={message}>{message}</li>
          ))}
        </ul>
      </section>
    );
  }

  if (!isValidDraft(draft)) {
    return (
      <section className="flex min-h-64 flex-col gap-2 rounded-lg border border-border bg-muted/20 p-4">
        <h2 className="font-medium text-sm">Draft preview</h2>
        <p className="text-muted-foreground text-sm">
          Generated output is incomplete. Try generating again.
        </p>
      </section>
    );
  }

  return (
    <section className="flex min-h-64 flex-col gap-6 rounded-lg border border-border p-4">
      <div className="flex flex-col gap-1">
        <h2 className="font-medium text-sm">Draft preview</h2>
        <p className="text-muted-foreground text-sm">
          Review the generated knowledge file and project data before approving.
        </p>
      </div>

      <PreviewSection
        description={`Will be written to knowledge/projects/${draft.project.id}.md`}
        title="Knowledge markdown"
      >
        <pre className="max-h-72 overflow-auto whitespace-pre-wrap rounded-md border border-border bg-muted p-3 font-mono text-xs">
          {draft.markdown}
        </pre>
      </PreviewSection>

      <PreviewSection title="Project data">
        <div className="rounded-md border border-border bg-muted/20 p-4">
          <ProjectDraftSummary project={draft.project} />
        </div>
      </PreviewSection>
    </section>
  );
}
