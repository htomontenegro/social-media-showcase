import "@/styles/embed/embed-shell.css";

export default function EmbedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="smp-embed-root">{children}</div>;
}
