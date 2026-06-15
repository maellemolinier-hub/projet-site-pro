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
    include: {
      user: { select: { firstName: true, lastName: true, email: true } },
    },
  });

  if (!expert) {
    return NextResponse.json({ error: "Token invalide" }, { status: 404 });
  }

  const certification = await db.certification.findUnique({
    where: { userId: expert.userId },
    select: { status: true, issuedAt: true, expiresAt: true, certificateId: true },
  });

  const isValid =
    certification?.status === "CERTIFIED" &&
    (!certification.expiresAt || certification.expiresAt > new Date());

  return NextResponse.json({
    name: [expert.user.firstName, expert.user.lastName].filter(Boolean).join(" "),
    specialties: expert.specialties,
    city: expert.city,
    certified: isValid,
    certifiedSince: certification?.issuedAt ?? null,
    certExpires: certification?.expiresAt ?? null,
    certificateId: certification?.certificateId ?? null,
    verifyUrl: certification?.certificateId
      ? `${process.env.NEXTAUTH_URL}/verifier/${certification.certificateId}`
      : null,
    averageRating: expert.averageRating,
    reviewCount: expert.reviewCount,
  });
}
