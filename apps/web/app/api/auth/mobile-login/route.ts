export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { db } from "@immoexpert/db";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { SignJWT } from "jose";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const secret = new TextEncoder().encode(
  process.env.NEXTAUTH_SECRET ?? "fallback-dev-secret"
);

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Données invalides" }, { status: 400 });
  }

  const { email, password } = parsed.data;

  const user = await db.user.findUnique({
    where: { email },
    include: { subscription: true },
  });

  if (!user?.passwordHash) {
    return NextResponse.json({ error: "Identifiants incorrects" }, { status: 401 });
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    return NextResponse.json({ error: "Identifiants incorrects" }, { status: 401 });
  }

  // Issue a JWT for the mobile app (7 days)
  const token = await new SignJWT({
    sub: user.id,
    email: user.email,
    plan: user.subscription?.plan ?? "STARTER",
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);

  return NextResponse.json({
    token,
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      plan: user.subscription?.plan ?? "STARTER",
    },
  });
}
