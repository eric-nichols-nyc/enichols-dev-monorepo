"use client";

import { DraftPreview } from "@/features/project-publisher/components/draft-preview";
import { DraftReviewActions } from "@/features/project-publisher/components/draft-review-actions";
import { ProjectPublishForm } from "@/features/project-publisher/components/project-publish-form";
import { PublishSuccess } from "@/features/project-publisher/components/publish-success";
import { useGenerateDraft } from "@/features/project-publisher/hooks/use-generate-draft";
import { usePublishProject } from "@/features/project-publisher/hooks/use-publish-project";
import { isValidDraft } from "@/features/project-publisher/lib/validate-project";

function ignoreUnhandledRejection(): void {
  // Errors are stored in hook state.
}

export function ProjectPublisherPage() {
  const {
    generate,
    reset: resetDraft,
    isLoading,
    error,
    result,
  } = useGenerateDraft();
  const {
    publish,
    reset: resetPublish,
    isLoading: isPublishing,
    error: publishError,
    publishedProject,
  } = usePublishProject();

  function handleReset() {
    resetDraft();
    resetPublish();
  }

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-6 py-12">
      <header className="flex flex-col gap-2">
        <h1 className="font-semibold text-2xl">New project</h1>
        <p className="text-muted-foreground text-sm">
          Generate knowledge markdown and portfolio data from a GitHub
          repository.
        </p>
      </header>

      <div className="grid gap-8 lg:grid-cols-2">
        <ProjectPublishForm
          error={error}
          isLoading={isLoading}
          onSubmit={(values) => {
            resetPublish();
            generate(values).catch(ignoreUnhandledRejection);
          }}
        />
        <DraftPreview draft={result} />
      </div>

      <DraftReviewActions
        canPublish={result !== null ? isValidDraft(result) : false}
        hasDraft={result !== null}
        isPublishing={isPublishing}
        onPublish={() => {
          if (result === null || !isValidDraft(result)) {
            return;
          }

          publish({
            markdown: result.markdown,
            project: result.project,
          }).catch(ignoreUnhandledRejection);
        }}
        onReset={handleReset}
      />

      {publishError ? (
        <p className="text-destructive text-sm">{publishError}</p>
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
