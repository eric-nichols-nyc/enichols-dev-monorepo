"use client";

import { useEffect, useState } from "react";
import {
  GREETING_VARIANTS,
  type GreetingVariant,
  pickRandomGreetingVariant,
} from "@/features/chat-ui/data/greeting-variants";

export function Greeting() {
  const [variant, setVariant] = useState<GreetingVariant>(GREETING_VARIANTS[0]!);

  useEffect(() => {
    setVariant(pickRandomGreetingVariant());
  }, []);

  return (
    <section
      aria-labelledby="greeting-heading"
      className="mx-auto w-full py-6 text-left sm:py-10"
    >
      <p className="mb-4 font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-primary">
        Eric Nichols / Frontend engineer
      </p>
      <h1
        id="greeting-heading"
        className="text-balance text-3xl font-semibold leading-[1.15] tracking-tight text-foreground sm:text-4xl"
      >
        <span className="block">{variant.heading}</span>
        {variant.accent && (
          <span className="block text-primary">{variant.accent}</span>
        )}
      </h1>
      <p className="mt-4 max-w-lg text-[15px] leading-7 text-muted-foreground">{variant.body}</p>
    </section>
  );
}
