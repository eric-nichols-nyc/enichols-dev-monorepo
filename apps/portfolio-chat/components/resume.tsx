"use client";

import { useEffect, useState } from "react";

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

const SECTION_DELAY_MS = 150;

export function Resume({
  name,
  title,
  location,
  contact,
  summary,
  skills,
  experience,
}: ResumeProps) {
  const [visibleSections, setVisibleSections] = useState({
    header: false,
    summary: false,
    skills: false,
    experienceCount: 0,
  });

  useEffect(() => {
    setVisibleSections({
      header: false,
      summary: false,
      skills: false,
      experienceCount: 0,
    });

    const t1 = setTimeout(
      () => setVisibleSections((s) => ({ ...s, header: true })),
      0
    );
    const t2 = setTimeout(
      () => setVisibleSections((s) => ({ ...s, summary: true })),
      SECTION_DELAY_MS
    );
    const t3 = setTimeout(
      () => setVisibleSections((s) => ({ ...s, skills: true })),
      SECTION_DELAY_MS * 2
    );

    const experienceTimeouts: ReturnType<typeof setTimeout>[] = [];
    for (let i = 0; i < experience.length; i++) {
      experienceTimeouts.push(
        setTimeout(
          () =>
            setVisibleSections((s) => ({
              ...s,
              experienceCount: i + 1,
            })),
          SECTION_DELAY_MS * (3 + i)
        )
      );
    }

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      for (const t of experienceTimeouts) {
        clearTimeout(t);
      }
    };
  }, [experience.length]);

  return (
    <section className="space-y-6 rounded-xl border border-border bg-card p-6 text-card-foreground shadow-sm">
      {visibleSections.header ? (
        <header className="space-y-1">
          <h2 className="font-semibold text-xl">{name}</h2>
          <p className="text-base text-muted-foreground">{title}</p>
          <p className="text-muted-foreground text-sm">
            {location} | {contact}
          </p>
        </header>
      ) : null}

      {visibleSections.summary ? (
        <p className="text-base leading-relaxed">{summary}</p>
      ) : null}

      {visibleSections.skills ? (
        <div className="space-y-2">
          <h3 className="font-semibold text-base">Skills</h3>
          <ul className="space-y-2 text-muted-foreground text-sm">
            {skills.map((skill) => (
              <li key={skill}>{skill}</li>
            ))}
          </ul>
        </div>
      ) : null}

      {visibleSections.experienceCount > 0 ? (
        <div className="space-y-4">
          <h3 className="font-semibold text-base">Experience</h3>
          <div className="space-y-4">
            {experience
              .slice(0, visibleSections.experienceCount)
              .map((role) => (
                <article
                  className="space-y-2"
                  key={`${role.company}-${role.dates}`}
                >
                  <div>
                    <h4 className="font-semibold text-sm">
                      {role.title} · {role.company}
                    </h4>
                    <p className="text-muted-foreground text-sm">
                      {role.location} | {role.dates}
                    </p>
                  </div>
                  <ul className="list-disc space-y-1 pl-5 text-muted-foreground text-sm">
                    {role.highlights.map((highlight) => (
                      <li key={highlight}>{highlight}</li>
                    ))}
                  </ul>
                  <p className="text-muted-foreground text-xs">
                    Tech: {role.tech}
                  </p>
                </article>
              ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}
