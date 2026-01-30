"use client";

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
    <section className="space-y-6 rounded-xl border border-border bg-card p-6 text-card-foreground shadow-sm">
      <header className="space-y-1">
        <h2 className="font-semibold text-xl">{name}</h2>
        <p className="text-base text-muted-foreground">{title}</p>
        <p className="text-sm text-muted-foreground">
          {location} | {contact}
        </p>
      </header>

      <p className="text-base leading-relaxed">{summary}</p>

      <div className="space-y-2">
        <h3 className="font-semibold text-base">Skills</h3>
        <ul className="space-y-2 text-sm text-muted-foreground">
          {skills.map((skill) => (
            <li key={skill}>{skill}</li>
          ))}
        </ul>
      </div>

      <div className="space-y-4">
        <h3 className="font-semibold text-base">Experience</h3>
        <div className="space-y-4">
          {experience.map((role) => (
            <article key={`${role.company}-${role.dates}`} className="space-y-2">
              <div>
                <h4 className="font-semibold text-sm">
                  {role.title} · {role.company}
                </h4>
                <p className="text-sm text-muted-foreground">
                  {role.location} | {role.dates}
                </p>
              </div>
              <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                {role.highlights.map((highlight) => (
                  <li key={highlight}>{highlight}</li>
                ))}
              </ul>
              <p className="text-xs text-muted-foreground">
                Tech: {role.tech}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
