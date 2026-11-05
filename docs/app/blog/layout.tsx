import './blog.css';

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return <div className="m2p-blog-shell">{children}</div>;
}
