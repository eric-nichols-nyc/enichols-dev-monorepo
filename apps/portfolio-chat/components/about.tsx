"use client";

type AboutProps = {
  title: string;
  paragraphs: string[];
};

export function About({ title, paragraphs }: AboutProps) {
  return (
    <div className="space-y-4">
      <h2 className="font-semibold text-lg text-foreground">{title}</h2>
      <div className="space-y-3 text-muted-foreground text-sm leading-relaxed">
        {paragraphs.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>
    </div>
  );
}
