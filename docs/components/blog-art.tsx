import { Blocks, Database, FlaskConical, Workflow } from 'lucide-react';

export function BlogArt({ slug, accent }: { slug: string; accent: string }) {
  const Icon = slug.includes('prisma') ? Database : slug.includes('workflow') ? Workflow : FlaskConical;
  return (
    <div className={`blog-art ${accent}`} aria-hidden="true">
      <div className="blog-art-grid" />
      <div className="blog-art-orbit" />
      <div className="blog-art-center"><Icon /></div>
      <div className="blog-art-node node-left"><Blocks /><span>Build</span></div>
      <div className="blog-art-node node-right"><Workflow /><span>Connect</span></div>
      <div className="blog-art-node node-bottom"><Database /><span>Explore</span></div>
      <span className="blog-art-brand">M2PDocs</span>
    </div>
  );
}
