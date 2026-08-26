"use client";

import type { GenerateRequestBody } from "@/features/project-publisher/lib/schema";
import { Button } from "@repo/design-system/components/ui/button";
import { Input } from "@repo/design-system/components/ui/input";
import { Label } from "@repo/design-system/components/ui/label";
import { Textarea } from "@repo/design-system/components/ui/textarea";
import { useState } from "react";

type ProjectPublishFormProps = {
  onSubmit: (values: GenerateRequestBody) => void;
  isLoading?: boolean;
  error?: string | null;
};

function parseGalleryInput(value: string): string[] {
  return value
    .split(/[\n,]/)
    .map((entry) => entry.trim())
    .filter(Boolean);
}

export function ProjectPublishForm({
  onSubmit,
  isLoading = false,
  error = null,
}: ProjectPublishFormProps) {
  const [repoUrl, setRepoUrl] = useState("");
  const [image, setImage] = useState("");
  const [gallery, setGallery] = useState("");
  const [liveUrl, setLiveUrl] = useState("");
  const [position, setPosition] = useState("");
  const [published, setPublished] = useState(true);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    void onSubmit({
      repoUrl,
      image,
      gallery: parseGalleryInput(gallery),
      liveUrl: liveUrl || undefined,
      position: position ? Number(position) : undefined,
      published,
    });
  }

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
      <div className="flex flex-col gap-2">
        <Label htmlFor="repo-url">GitHub repository URL</Label>
        <Input
          disabled={isLoading}
          id="repo-url"
          onChange={(event) => setRepoUrl(event.target.value)}
          placeholder="https://github.com/owner/repo"
          required
          value={repoUrl}
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="image-path">Image path</Label>
        <Input
          disabled={isLoading}
          id="image-path"
          onChange={(event) => setImage(event.target.value)}
          placeholder="/images/my-project.png"
          required
          value={image}
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="gallery-paths">Gallery paths (optional)</Label>
        <Textarea
          disabled={isLoading}
          id="gallery-paths"
          onChange={(event) => setGallery(event.target.value)}
          placeholder={"/images/project-1.png\n/images/project-2.png"}
          rows={3}
          value={gallery}
        />
        <p className="text-muted-foreground text-xs">
          One image path per line, or comma-separated.
        </p>
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="live-url">Live URL (optional)</Label>
        <Input
          disabled={isLoading}
          id="live-url"
          onChange={(event) => setLiveUrl(event.target.value)}
          placeholder="https://example.com"
          value={liveUrl}
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="position">Position (optional)</Label>
        <Input
          disabled={isLoading}
          id="position"
          inputMode="numeric"
          onChange={(event) => setPosition(event.target.value)}
          placeholder="1"
          value={position}
        />
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input
          checked={published}
          disabled={isLoading}
          onChange={(event) => setPublished(event.target.checked)}
          type="checkbox"
        />
        Published
      </label>
      {error ? <p className="text-destructive text-sm">{error}</p> : null}
      <Button disabled={isLoading} type="submit">
        {isLoading ? "Generating…" : "Generate draft"}
      </Button>
    </form>
  );
}
