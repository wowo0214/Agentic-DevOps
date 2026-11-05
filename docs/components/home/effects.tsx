'use client';

import { useRef, type ReactNode } from 'react';
import { motion, useInView, useReducedMotion } from 'motion/react';
import tide from './electric-tide.json';

export function Reveal({ children, className, as = 'div', delay = 0 }: {
  children: ReactNode; className?: string; as?: 'div' | 'figure' | 'article'; delay?: number;
}) {
  const reduced = useReducedMotion();
  const Tag = as === 'figure' ? motion.figure : as === 'article' ? motion.article : motion.div;
  return <Tag className={className} initial={false}
    whileInView={reduced ? undefined : { opacity: [0, 1], y: [18, 0] }}
    viewport={{ once: true, amount: 0.15 }}
    transition={{ duration: 0.65, delay, ease: [0.22, 1, 0.36, 1] }}>
    {children}
  </Tag>;
}

// Electric Tide palette exported from FeralUI; animated as a full section with Motion.
export function ElectricTide() {
  const ref = useRef<HTMLDivElement>(null);
  const visible = useInView(ref);
  const reduced = useReducedMotion();
  const moving = visible && !reduced;
  const [mist, lagoon, blue, indigo] = tide.stops.map(stop => stop.hex);
  return <div ref={ref} className="m2p-tide-field" aria-hidden="true"
    style={{ background: `linear-gradient(115deg, ${indigo}, ${blue} 48%, ${lagoon} 85%, ${mist})` }}>
    <motion.div className="m2p-tide-pool m2p-tide-pool-cyan"
      animate={moving ? { x: ['-12%', '18%', '-12%'], y: ['-8%', '12%', '-8%'], scale: [1, 1.2, 1] } : { x: 0, y: 0, scale: 1 }}
      transition={{ duration: reduced ? 0 : 9, repeat: moving ? Infinity : 0, ease: 'easeInOut' }} />
    <motion.div className="m2p-tide-pool m2p-tide-pool-blue"
      animate={moving ? { x: ['10%', '-15%', '10%'], y: ['15%', '-10%', '15%'], rotate: [-12, 12, -12] } : { x: 0, y: 0, rotate: 0 }}
      transition={{ duration: reduced ? 0 : 11, repeat: moving ? Infinity : 0, ease: 'easeInOut' }} />
    <div className="m2p-tide-shade" />
  </div>;
}

const pixelPatterns = [
  ['00010000','00010000','11111111','00010000','00010000','00000100','11111111','00000100'],
  ['00111100','01000010','10000001','10011001','10011001','10000001','01000010','00111100'],
  ['00000000','00011000','00100100','01000010','10000001','00000000','11111111','00000000'],
  ['00011000','00011000','00011000','01011010','00111100','00011000','00000000','11111111'],
];

export function PixelGraphic({ index }: { index: number }) {
  const reduced = useReducedMotion();
  return <motion.div className={`m2p-pixel-art m2p-pixel-art-${index}`} aria-hidden="true"
    initial="rest" whileHover={reduced ? undefined : 'hover'}>
    <div className="m2p-pixel-symbol">
      {pixelPatterns[index].flatMap((row, y) => [...row].map((pixel, x) => <motion.i key={`${y}-${x}`}
        className={pixel === '1' ? 'is-filled' : ''}
        variants={{ rest: { x: 0, y: 0, rotate: 0 }, hover: { x: (x - 3.5) * 3, y: (y - 3.5) * 3, rotate: (x + y) % 2 ? 12 : -12 } }}
        transition={{ type: 'spring', stiffness: 220, damping: 16, delay: (x + y) * 0.012 }} />))}
    </div>
  </motion.div>;
}

export function PixelLab() {
  const reduced = useReducedMotion();
  return <motion.div className="m2p-pixel-grid" aria-hidden="true" initial="rest" whileHover={reduced ? undefined : 'hover'}>
    {Array.from({ length: 64 }, (_, i) => {
      const x = i % 8, y = Math.floor(i / 8);
      const opacity = ((i * 17 + 7) % 11) / 13 + 0.12;
      return <motion.i key={i} style={{ opacity }}
        whileInView={reduced ? undefined : { x: [(x - 3.5) * 16, 0], y: [(y - 3.5) * 16, 0], opacity: [0, opacity] }}
        viewport={{ once: true, amount: 0.5 }}
        variants={{ rest: { scale: 1 }, hover: { scale: 1.35, backgroundColor: '#6fd8f2', opacity: 1 } }}
        transition={{ duration: 0.7, delay: (x + y) * 0.035, ease: [0.22, 1, 0.36, 1] }} />;
    })}
  </motion.div>;
}
