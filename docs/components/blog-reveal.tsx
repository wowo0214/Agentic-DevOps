'use client';

import { motion, useReducedMotion } from 'motion/react';
import type { ReactNode } from 'react';

export function BlogReveal({ children, delay = 0, duration = 0.8 }: { children: ReactNode; delay?: number; duration?: number }) {
  const reduceMotion = useReducedMotion();
  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.1, margin: '0px 0px -80px 0px' }}
      transition={{
        opacity: { duration: reduceMotion ? 0 : duration, delay: reduceMotion ? 0 : delay * 2, ease: [0.42, 0, 0.58, 1] },
        y: { duration: reduceMotion ? 0 : duration, delay: reduceMotion ? 0 : delay * 2, ease: [0.25, 0.1, 0.25, 1] },
      }}
    >
      {children}
    </motion.div>
  );
}
