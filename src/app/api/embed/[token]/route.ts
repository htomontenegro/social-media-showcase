import { NextResponse } from "next/server";
import { getEmbedPayload } from "@/lib/widget-embed";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const payload = await getEmbedPayload(token);

  if (!payload) {
    return NextResponse.json(
      { error: "Widget not found" },
      { status: 404, headers: corsHeaders }
    );
  }

  return NextResponse.json(payload, { headers: corsHeaders });
}
