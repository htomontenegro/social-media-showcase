import { getEmbedPayload } from "@/lib/widget-embed";
import { EmbedHost } from "@/components/embed/EmbedHost";
import { notFound } from "next/navigation";

export default async function EmbedPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const payload = await getEmbedPayload(token);
  if (!payload) notFound();

  return <EmbedHost payload={payload} />;
}
