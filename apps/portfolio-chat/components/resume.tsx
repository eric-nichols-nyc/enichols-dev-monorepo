"use client";

import { Skeleton } from "@repo/design-system/components/ui/skeleton";

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

export function ResumeSkeleton() {
  return (
    <section className="mx-auto max-w-xl space-y-6 rounded-xl border border-border bg-card p-6 shadow-sm">
      <header className="space-y-2">
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-5 w-64" />
        <Skeleton className="h-4 w-56" />
      </header>

      <div className="space-y-2">
        <Skeleton className="h-4 max-w-md" />
        <Skeleton className="h-4 max-w-sm" />
        <Skeleton className="h-4 max-w-xs" />
      </div>

      <div className="space-y-2">
        <Skeleton className="h-5 w-16" />
        <ul className="space-y-2">
          <li>
            <Skeleton className="h-4 w-32" />
          </li>
          <li>
            <Skeleton className="h-4 w-40" />
          </li>
          <li>
            <Skeleton className="h-4 w-28" />
          </li>
        </ul>
      </div>

      <div className="space-y-4">
        <Skeleton className="h-5 w-24" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <article className="space-y-2" key={i}>
              <div>
                <Skeleton className="mb-1 h-4 w-44" />
                <Skeleton className="h-3 w-36" />
              </div>
              <ul className="space-y-1 pl-5">
                <li>
                  <Skeleton className="h-3 max-w-sm" />
                </li>
                <li>
                  <Skeleton className="h-3 max-w-xs" />
                </li>
                <li>
                  <Skeleton className="h-3 max-w-[12rem]" />
                </li>
              </ul>
              <Skeleton className="h-3 w-24" />
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

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
          {experience.map((role) => (
            <article
              className="space-y-2"
              key={`${role.company}-${role.dates}`}
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
