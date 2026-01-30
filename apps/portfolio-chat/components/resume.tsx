"use client";

import { Skeleton } from "@repo/design-system/components/ui/skeleton";

export function ResumeSkeleton() {
  return (
    <section className="min-w-0 max-w-full space-y-6 rounded-xl border border-border bg-card p-6 shadow-sm">
      <div className="space-y-2">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-64" />
        <Skeleton className="h-4 w-full max-w-md" />
      </div>
      <Skeleton className="h-16 w-full" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-16" />
        <div className="flex flex-wrap gap-2">
          <Skeleton className="h-5 w-24 rounded-full" />
          <Skeleton className="h-5 w-32 rounded-full" />
          <Skeleton className="h-5 w-20 rounded-full" />
        </div>
      </div>
      <div className="space-y-4">
        <Skeleton className="h-4 w-24" />
        <div className="space-y-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      </div>
    </section>
  );
}

type ResumeProps = {
  name: string;
  title: string;
  location: string;
  contact: string;
  summary: string;
  skills: string[];
  experience: Array<{
    title: string;
    company: string;
    location: string;
    dates: string;
    highlights: string[];
    tech: string;
  }>;
};

export function Resume({
  name,
  title,
  location,
  contact,
  summary,
  skills,
  experience,
}: ResumeProps) {
  return (
    <section className="min-w-0 max-w-full space-y-6 break-words rounded-xl border border-border bg-card p-6 text-card-foreground shadow-sm">
      <header className="space-y-1">
        <h2 className="font-semibold text-xl">{name}</h2>
        <p className="text-base text-muted-foreground">{title}</p>
        <p className="break-words text-muted-foreground text-sm">
          {location} | {contact}
        </p>
      </header>

      <p className="break-words text-base leading-relaxed">{summary}</p>

      <div className="space-y-2">
        <h3 className="font-semibold text-base">Skills</h3>
        <ul className="space-y-2 break-words text-muted-foreground text-sm">
          {skills.map((skill) => (
            <li key={skill}>{skill}</li>
          ))}
        </ul>
      </div>

      <div className="space-y-4">
        <h3 className="font-semibold text-base">Experience</h3>
        <div className="space-y-4">
          {experience.map((role, idx) => (
            <article
              className="fade-in animate-in space-y-2 duration-300"
              key={`${role.company}-${idx}`}
            >
              <div>
                <h4 className="break-words font-semibold text-sm">
                  {role.title} · {role.company}
                </h4>
                <p className="break-words text-muted-foreground text-sm">
                  {role.location} | {role.dates}
                </p>
              </div>
              <ul className="list-disc space-y-1 break-words pl-5 text-muted-foreground text-sm">
                {role.highlights.map((highlight) => (
                  <li key={highlight}>{highlight}</li>
                ))}
              </ul>
              <p className="break-words text-muted-foreground text-xs">
                Tech: {role.tech}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
