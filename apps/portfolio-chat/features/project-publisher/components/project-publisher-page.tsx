"use client";

import { Button } from "@repo/design-system/components/ui/button";
import { DraftPreview } from "@/features/project-publisher/components/draft-preview";
import { ProjectPublishForm } from "@/features/project-publisher/components/project-publish-form";
import { PublishSuccess } from "@/features/project-publisher/components/publish-success";
import { useGenerateDraft } from "@/features/project-publisher/hooks/use-generate-draft";
import { usePublishProject } from "@/features/project-publisher/hooks/use-publish-project";

export function ProjectPublisherPage() {
  const { generate, isLoading, error, result } = useGenerateDraft();
  const { publish, isLoading: isPublishing, publishedProject } =
    usePublishProject();

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-8 px-6 py-12">
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold">New project</h1>
        <p className="text-muted-foreground text-sm">
          Generate knowledge markdown and portfolio data from a GitHub repository.
        </p>
      </header>

      <div className="grid gap-8 lg:grid-cols-2">
        <ProjectPublishForm
          error={error}
          isLoading={isLoading}
          onSubmit={(values) => {
            void generate(values);
          }}
        />
        <DraftPreview draft={result} />
      </div>

      {result && result.errors.length === 0 ? (
        <div className="flex flex-col gap-4">
          <Button
            disabled={isPublishing}
            onClick={() => {
              if (result.markdown && result.project) {
                void publish({ markdown: result.markdown, project: result.project });
              }
            }}
            type="button"
          >
            {isPublishing ? "Publishing…" : "Approve & publish"}
          </Button>
        </div>
      ) : null}

      {publishedProject ? (
        <PublishSuccess
          projectId={publishedProject.id}
          projectTitle={publishedProject.title}
        />
      ) : null}
    </main>
  );
}
