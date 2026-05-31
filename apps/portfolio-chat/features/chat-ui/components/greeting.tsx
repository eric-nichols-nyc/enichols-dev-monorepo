"use client";

import { ShineBorder } from "@repo/design-system/components/ui/shine-border";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import {
  GREETING_VARIANTS,
  type GreetingVariant,
  pickRandomGreetingVariant,
} from "@/features/chat-ui/data/greeting-variants";

const GREETING_SHINE_COLORS = ["#6366f1", "#a21caf", "#f472b6"];

const fadeUpIn = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: {
    duration: 0.5,
    ease: [0.22, 1, 0.36, 1] as const,
  },
};

export function Greeting() {
  const [variant, setVariant] = useState<GreetingVariant>(GREETING_VARIANTS[0]!);

  useEffect(() => {
    setVariant(pickRandomGreetingVariant());
  }, []);

  return (
    <motion.div
      animate={fadeUpIn.animate}
      className="flex flex-col items-center justify-center text-center"
      initial={fadeUpIn.initial}
      transition={fadeUpIn.transition}
    >
      <motion.div
        animate={fadeUpIn.animate}
        className="flex flex-col items-center gap-4"
        initial={fadeUpIn.initial}
        transition={{ ...fadeUpIn.transition, delay: 0.1 }}
      >
        <motion.div
          animate={fadeUpIn.animate}
          className="relative max-w-xl overflow-hidden rounded-xl bg-card/80 p-6 text-center shadow-sm"
          initial={fadeUpIn.initial}
          transition={{ ...fadeUpIn.transition, delay: 0.2 }}
        >
          <ShineBorder
            borderWidth={2}
            className="rounded-xl"
            duration={8}
            shineColor={GREETING_SHINE_COLORS}
          />
          <div className="relative z-10 text-white">
            <strong className="text-lg">{variant.heading}</strong>
            <p className="mt-3 text-sm leading-relaxed">{variant.body}</p>
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
