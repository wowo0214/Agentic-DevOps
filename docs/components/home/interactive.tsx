'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, ArrowRight, X } from 'lucide-react';

export function PlatformButton() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  return <><button className="m2p-button" onClick={() => dialogRef.current?.showModal()}>Enter Platform <ArrowUpRight size={17} /></button><dialog ref={dialogRef} className="m2p-dialog"><button className="m2p-dialog-close" aria-label="Close" onClick={() => dialogRef.current?.close()}><X size={20} /></button><p className="m2p-eyebrow">M2PLINK</p><h2>Your laboratory connection.</h2><p>This homepage is a preview. Platform navigation will be connected later. Explore the documentation to get started.</p><Link href="/docs" className="m2p-button">Read Docs <ArrowRight size={17} /></Link></dialog></>;
}

export function ResponseExperiment() {
  const [damping, setDamping] = useState(0.45);
  const canvas = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const el = canvas.current;
    if (!el) return;
    const draw = () => {
      const rect = el.getBoundingClientRect();
      const ratio = window.devicePixelRatio || 1;
      el.width = rect.width * ratio; el.height = rect.height * ratio;
      const context = el.getContext('2d');
      if (!context) return;
      context.scale(ratio, ratio);
      const w = rect.width, h = rect.height, left = 38, right = w - 16, top = 22, bottom = h - 30;
      const y = (value: number) => bottom - value / 1.6 * (bottom - top);
      context.font = '11px monospace'; context.lineWidth = 1;
      for (let i = 0; i <= 4; i++) {
        const value = i * 0.4, py = y(value);
        context.strokeStyle = '#dce9f7'; context.beginPath(); context.moveTo(left, py); context.lineTo(right, py); context.stroke();
        context.fillStyle = '#55708d'; context.fillText(value.toFixed(1), 4, py + 4);
      }
      context.setLineDash([5, 5]); context.strokeStyle = '#89a1bc'; context.beginPath(); context.moveTo(left, y(1)); context.lineTo(right, y(1)); context.stroke(); context.setLineDash([]);
      context.strokeStyle = '#1767df'; context.lineWidth = 2.5; context.beginPath();
      const wd = 3 * Math.sqrt(1 - damping * damping);
      for (let i = 0; i <= 400; i++) {
        const t = i / 400 * 6;
        const response = 1 - Math.exp(-damping * 3 * t) * (Math.cos(wd * t) + damping / Math.sqrt(1 - damping * damping) * Math.sin(wd * t));
        const px = left + i / 400 * (right - left), py = y(response);
        if (i === 0) context.moveTo(px, py); else context.lineTo(px, py);
      }
      context.stroke(); context.fillStyle = '#55708d';
      for (let i = 0; i <= 6; i++) context.fillText(`${i}s`, left + i / 6 * (right - left) - 5, h - 7);
    };
    const observer = new ResizeObserver(draw); observer.observe(el); draw();
    return () => observer.disconnect();
  }, [damping]);
  return <div className="m2p-response"><div className="m2p-response-chart"><div className="m2p-chart-title"><span>Unit step response</span><span><i /> Calculated response</span></div><canvas ref={canvas} role="img" aria-label={`Calculated unit step response of an ideal second-order system with damping ratio ${damping.toFixed(2)} and natural frequency 3 radians per second.`} /><p>Illustrative mathematical model. Not measured equipment data.</p></div><div className="m2p-response-controls"><span className="m2p-small-label">TRY THE MODEL</span><h3>Find the balance.</h3><p>Less damping creates more overshoot. More damping settles the response more gradually.</p><label htmlFor="damping">Damping ratio <output htmlFor="damping">{damping.toFixed(2)}</output></label><input id="damping" type="range" min="0.15" max="0.95" step="0.01" value={damping} onChange={event => setDamping(Number(event.target.value))} /><div className="m2p-range-labels"><span>More oscillation</span><span>More damping</span></div><button className="m2p-link" onClick={() => setDamping(0.45)}>Reset experiment <ArrowRight size={15} /></button></div></div>;
}
