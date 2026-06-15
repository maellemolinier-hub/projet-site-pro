import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@immoexpert/db";
import { z } from "zod";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8, "Minimum 8 caractères"),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
});

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0].message },
      { status: 400 }
    );
  }

  const { email, password, firstName, lastName } = parsed.data;

  const existing = await db.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json(
      { error: "Un compte existe déjà avec cet email" },
      { status: 409 }
    );
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await db.user.create({
    data: { email, passwordHash, firstName, lastName },
    select: { id: true, email: true },
  });

  return NextResponse.json({ userId: user.id }, { status: 201 });
}
