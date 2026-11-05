export type BlogPost = {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  date: string;
  author: string;
  readTime: string;
  accent: string;
  sections: { heading: string; paragraphs: string[] }[];
};

export const blogPosts: BlogPost[] = [
  {
    slug: 'why-real-equipment-changes-the-lesson',
    title: 'Why real equipment changes the lesson',
    excerpt: 'A controller can be correct in a model and still surprise you on a physical system. That gap is where the most useful experiments begin.',
    category: 'LAB NOTES', date: 'October 8, 2026', author: 'M2PLab team', readTime: '6 min read', accent: 'cyan',
    sections: [
      { heading: 'The model is a map', paragraphs: ['A simulation gives a control idea a clean place to start. It makes assumptions visible, parameters easy to change, and the first iteration quick to repeat.', 'That clarity is valuable. It also leaves some details outside the frame: friction, sensor noise, actuator limits, delay, and the small imperfections that accumulate in a real mechanism.'] },
      { heading: 'The physical system answers back', paragraphs: ['On equipment, the same algorithm meets those details at once. A response can overshoot a little more, settle later, or expose a limit that was invisible in the ideal model.', 'That difference is not a failure of simulation. It is the next piece of evidence. Students can compare the expected curve with the measured one and ask which assumption needs to change.'] },
      { heading: 'A better loop for learning', paragraphs: ['M2PLink connects the control blocks students already understand with remote laboratory equipment. Design in blocks, inspect the model, run the experiment, then bring the measurement back into the next iteration.', 'The goal is a practical habit: treat simulation as a hypothesis and the physical experiment as a careful test.'] },
    ],
  },
  {
    slug: 'a-control-workflow-for-shared-labs',
    title: 'A control workflow for shared laboratories',
    excerpt: 'How we are shaping a remote experiment around readable blocks, explicit parameters, and a result that students can inspect later.',
    category: 'BUILDING M2PLINK', date: 'September 24, 2026', author: 'M2PLab team', readTime: '5 min read', accent: 'indigo',
    sections: [
      { heading: 'Start with a visible system', paragraphs: ['A shared laboratory needs more than a remote button. Every experiment should make the reference, controller, system, and measured feedback understandable before a student presses run.', 'This is why the workflow begins with blocks and parameters rather than a hidden implementation.'] },
      { heading: 'Make the important values explicit', paragraphs: ['Sampling time, gains, bounds, and experiment duration are part of the lesson. The interface keeps them close to the model so students can connect a change in a value with a change in the response.', 'The same structure also gives instructors a common language when they review a result across different universities.'] },
      { heading: 'Leave a trail', paragraphs: ['A remote experiment should produce a useful record: the configuration, the signals, and the exported data. A student can return to the result, compare runs, and explain what changed.', 'That trail turns expensive equipment into a repeatable learning environment rather than a one-time demonstration.'] },
    ],
  },
  {
    slug: 'designing-for-the-gap-between-simulation-and-reality',
    title: 'Designing for the gap between simulation and reality',
    excerpt: 'The interface should make the difference between an ideal response and a measured response easy to see, discuss, and investigate.',
    category: 'TEACHING WITH SYSTEMS', date: 'September 10, 2026', author: 'M2PLab team', readTime: '4 min read', accent: 'peach',
    sections: [
      { heading: 'Comparison is part of the interface', paragraphs: ['The interesting moment is often not the first run. It is the comparison between what the model predicted and what the hardware measured.', 'We are designing the platform so that curves, parameters, and experiment notes remain close enough to support that comparison without turning the page into an instrument panel.'] },
      { heading: 'Calm surfaces, precise signals', paragraphs: ['M2PLink uses a quiet base so the response curve and physical constraints can carry the attention. Color is reserved for state, emphasis, and the places where a student should look next.', 'The result should feel approachable to a new learner while remaining precise enough for an advanced control exercise.'] },
    ],
  },
  {
    slug: 'prisma-orm-manifesto-format-example',
    title: 'Prisma ORM Manifesto 2026: Open, Extensible, Collaborative',
    excerpt: "A format study based on Prisma's public article structure, rewritten as an original summary for local MDX rendering.",
    category: 'FORMAT STUDY', date: 'October 2, 2026', author: 'M2PLab editorial', readTime: '4 min read', accent: 'indigo',
    sections: [
      { heading: 'A framework should leave room for an ecosystem', paragraphs: ['The public Prisma article presents an ORM as more than a single library. Its long-term value comes from giving other tools a stable place to connect, extend, and serve different teams.'] },
      { heading: 'Good defaults should remain understandable', paragraphs: ['The article treats developer experience as part of the product contract. Safe defaults reduce friction, while clear escape hatches keep advanced work possible.'] },
      { heading: 'Open systems need stewardship', paragraphs: ['An open ecosystem still needs careful maintenance. Compatibility, documentation, and a clear direction help contributors understand how their work fits into the larger system.'] },
    ],
  },
];

export const categories = ['ALL STORIES', 'ANNOUNCEMENT', 'PLATFORM', 'CONTROL', 'M2PLAB', 'EDUCATION', 'LAB NOTES'];

export function getPost(slug: string) {
  return blogPosts.find((post) => post.slug === slug);
}
