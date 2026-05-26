import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { importSingleSchema } from "@/lib/validations/import";
import { importInstagramUrl } from "@/lib/import-service";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { url } = importSingleSchema.parse(body);
    const result = await importInstagramUrl(session.user.id, url);
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
