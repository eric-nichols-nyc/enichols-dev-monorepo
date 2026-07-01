"use client";

type PublishSuccessProps = {
  projectId: string;
  projectTitle: string;
};

export function PublishSuccess({
  projectId,
  projectTitle,
}: PublishSuccessProps) {
  return (
    <section className="border-border bg-muted/20 flex flex-col gap-3 rounded-lg border p-4">
      <h2 className="text-lg font-semibold">Published locally</h2>
      <p className="text-muted-foreground text-sm">
        {projectTitle} was written to the workspace. Commit the changes to
        deploy.
      </p>
      <pre className="bg-muted overflow-x-auto rounded-md p-3 text-xs whitespace-pre-wrap">{`git add knowledge/projects/${projectId}.md data/projects.ts
git commit -m "Add project: ${projectTitle}"
git push`}</pre>
    </section>
  );
}
