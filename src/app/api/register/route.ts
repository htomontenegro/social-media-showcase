import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { REGISTRATION_ENABLED } from "@/lib/app-config";
import { prisma } from "@/lib/db";
import { registerSchema } from "@/lib/validations/auth";

export async function POST(req: Request) {
  if (!REGISTRATION_ENABLED) {
    return NextResponse.json({ error: "Registration is disabled" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const data = registerSchema.parse(body);
    const email = data.email.toLowerCase();

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "Email already registered" }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(data.password, 12);
    await prisma.user.create({
      data: {
        email,
        passwordHash,
        name: data.name ?? null,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }
    return NextResponse.json({ error: "Registration failed" }, { status: 500 });
  }
}
