import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight, ArrowRight, SlidersHorizontal, Cable, Activity, Download, MoveUpRight } from 'lucide-react';
import { HomeNav, PlatformButton, ResponseExperiment } from '@/components/home/interactive';
import type { Metadata } from 'next';
import { ElectricTide, PixelGraphic, PixelLab, Reveal } from '@/components/home/effects';

export const metadata: Metadata = {
  title: 'M2PLink | Control meets the physical world',
  description: 'Build control algorithms and explore their behavior on real laboratory equipment through M2PLab.',
};

export default function HomePage() {
  return (
    <div className="m2p-home">
      <HomeNav />
      <main>
        <section className="m2p-hero m2p-container">
          <Reveal className="m2p-hero-copy">
            <p className="m2p-eyebrow">LINK FOR M2PLAB</p>
            <h1>Control meets<br /><span>the physical world.</span></h1>
            <p className="m2p-lead">Build control algorithms. Run remote experiments. Discover what happens beyond an ideal model.</p>
            <div className="m2p-actions"><PlatformButton /><Link className="m2p-link" href="/docs">Read Docs <ArrowUpRight size={17} /></Link></div>
          </Reveal>
          <Reveal as="figure" className="m2p-hero-visual" delay={0.1}>
            <div className="m2p-hero-image">
            <Image src="/images/m2p-lab-concept.png" alt="Concept illustration of robotic and servo equipment for a remote control laboratory" width={1536} height={1024} priority />
            </div>
            <figcaption>Physical control laboratory <span>Concept illustration</span></figcaption>
          </Reveal>
          <div className="m2p-hero-bottom"><span>Built for learning. Connected to reality.</span><span>Model <ArrowRight size={13} /> Experiment <ArrowRight size={13} /> Understand</span></div>
        </section>
        <section className="m2p-section m2p-container" id="why">
          <div className="m2p-section-intro"><p className="m2p-eyebrow">BEYOND THE MODEL</p><h2>A simulation is a beginning.<br />Reality is the next lesson.</h2><p>The same controller can behave differently on real equipment. Friction, disturbances and physical limits make that difference worth exploring.</p></div>
          <div className="m2p-comparison"><div><span className="m2p-small-label">IN A MODEL</span><h3>Defined assumptions.</h3><p>Explore a system through its equations, parameters and selected conditions.</p><div className="m2p-tags"><span>Idealized dynamics</span><span>Controlled conditions</span></div></div><div><span className="m2p-small-label">ON REAL EQUIPMENT</span><h3>Physical consequences.</h3><p>Observe how your control strategy responds when the physical system has a say.</p><div className="m2p-tags"><span>Friction &amp; noise</span><span>Real constraints</span></div></div></div>
        </section>
        <section className="m2p-model-section" id="workflow"><div className="m2p-container m2p-model-grid"><div className="m2p-section-intro"><h2>Think in systems.<br /><span>Build in blocks.</span></h2><p>Connect blocks, set parameters and simulate your control logic before taking it to a physical experiment.</p><Link href="/docs" className="m2p-link">Read Docs <ArrowUpRight size={17} /></Link></div><div className="m2p-process" aria-label="Control workflow: reference, controller, physical system, measured feedback"><div className="m2p-process-top"><span>CONTROL WORKFLOW</span><span>Closed loop</span></div><div className="m2p-blocks"><div><span>01</span><strong>Reference</strong><small>Desired response</small></div><ArrowRight /><div><span>02</span><strong>Controller</strong><small>Your control logic</small></div><ArrowRight /><div><span>03</span><strong>System</strong><small>Model or equipment</small></div></div><div className="m2p-feedback"><span>Measured feedback</span><span>↩</span></div><p>A conceptual workflow, from setpoint to response.</p></div></div></section>
        <section className="m2p-section m2p-container m2p-capabilities" id="capabilities"><div className="m2p-section-intro"><h2>One place to work<br />through an experiment.</h2><p>Move from control design to physical observation, with the tools to inspect what your algorithm actually does.</p></div><div className="m2p-feature-grid">{[
          { icon: SlidersHorizontal, name: 'Set the parameters', body: 'Tune your model and controller to explore different system behaviors.', label: 'DESIGN' },
          { icon: Cable, name: 'Connect to equipment', body: 'Run remote experiments with physical laboratory systems through M2PLab.', label: 'EXPERIMENT' },
          { icon: Activity, name: 'Follow the response', body: 'Observe signal curves and compare the outcome with your expectations.', label: 'OBSERVE' },
          { icon: Download, name: 'Keep your results', body: 'Export experimental data for analysis, reports and your next iteration.', label: 'ANALYZE' },
        ].map(({ icon: Icon, name, body, label }, index) => <Reveal as="article" key={name} delay={index * 0.05}><PixelGraphic index={index} /><div className="m2p-feature-top"><Icon size={26} strokeWidth={1.5} /><span>{label}</span></div><h3>{name}</h3><p>{body}</p></Reveal>)}</div></section>
        <section className="m2p-experiment-section" id="experiment"><ElectricTide /><div className="m2p-container"><div className="m2p-experiment-heading"><h2>A small change.<br /><span>A different response.</span></h2><p>Try a simple mathematical example. Adjust damping and see how an ideal second-order system settles.</p></div><ResponseExperiment /></div></section>
        <section className="m2p-section m2p-container m2p-access"><Reveal className="m2p-access-art"><div className="m2p-access-tide" aria-hidden="true" /><PixelLab /><span>M2P<span>Lab</span></span></Reveal><div className="m2p-section-intro"><p className="m2p-eyebrow">A SHARED LABORATORY</p><h2>Exceptional equipment.<br />More opportunities to learn.</h2><p>Advanced equipment is expensive. M2PLab brings shared laboratory resources to students across participating universities, creating access to real physical experiments.</p><p className="m2p-access-note">Currently used for university teaching and learning.</p></div></section>
        <section className="m2p-closing m2p-container"><div><h2>Your next lesson<br />is an experiment.</h2><p>Get to know the workflow, then bring your control ideas to M2PLab.</p></div><div className="m2p-closing-actions"><PlatformButton /><Link href="/docs" className="m2p-link">Read Docs <ArrowUpRight size={17} /></Link></div></section>
      </main>
      <footer className="m2p-footer m2p-container"><Link href="/" className="m2p-wordmark">M2P<span>Link</span><MoveUpRight size={17} /></Link><span>Link for M2PLab.</span><Link href="/docs">Documentation <ArrowUpRight size={14} /></Link></footer>
    </div>
  );
}
