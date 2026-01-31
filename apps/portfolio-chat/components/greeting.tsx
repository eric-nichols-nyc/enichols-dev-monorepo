"use client";

import { motion } from "motion/react";

const fadeUpIn = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: {
    duration: 0.5,
    ease: [0.22, 1, 0.36, 1] as const,
  },
};

export function Greeting() {
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
        <strong>Hello there!</strong>
        <motion.div
          animate={fadeUpIn.animate}
          className="max-w-xl"
          initial={fadeUpIn.initial}
          transition={{ ...fadeUpIn.transition, delay: 0.2 }}
        >
          I'm Eric — a senior frontend engineer in New York City. <br />I focus
          on accessibility, React, and building AI-driven experiences. Ask about
          my projects, experience, or anything else you'd like to know.
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
