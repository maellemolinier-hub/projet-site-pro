export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { db } from "@immoexpert/db";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const expert = await db.expertProfile.findFirst({
    where: { widgetToken: token },
    include: { user: { select: { firstName: true, lastName: true } } },
  });

  if (!expert) {
    return NextResponse.redirect(
      new URL("/verifier/invalid", process.env.NEXTAUTH_URL!)
    );
  }

  const certification = await db.certification.findUnique({
    where: { userId: expert.userId },
    select: { certificateId: true },
  });

  if (!certification?.certificateId) {
    return NextResponse.redirect(
      new URL("/verifier/invalid", process.env.NEXTAUTH_URL!)
    );
  }

  return NextResponse.redirect(
    new URL(`/verifier/${certification.certificateId}`, process.env.NEXTAUTH_URL!)
  );
}
