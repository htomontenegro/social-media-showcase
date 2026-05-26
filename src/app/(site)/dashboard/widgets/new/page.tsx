import { WidgetForm } from "@/components/dashboard/WidgetForm";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";

export default async function NewWidgetPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const entries = await prisma.entry.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      description: true,
      imageUrl: true,
      sourceUrl: true,
      authorHandle: true,
      authorName: true,
      platform: true,
    },
  });

  const baseUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
  return (
    <div>
      <h1 className="text-2xl font-bold text-zinc-50">Create widget</h1>
      <div className="mt-6">
        <WidgetForm baseUrl={baseUrl} initialEntries={entries} />
      </div>
    </div>
  );
}
