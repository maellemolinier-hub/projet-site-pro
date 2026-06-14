import { NextResponse } from "next/server";
import { db } from "@immoexpert/db";

export async function GET(
  _req: Request,
  { params }: { params: { token: string } }
) {
  const { token } = params;

  const expert = await db.expertProfile.findFirst({
    where: { widgetToken: token },
    include: {
      user: { select: { firstName: true, lastName: true, email: true } },
      certification: { select: { status: true, issuedAt: true, expiresAt: true, certificateId: true } },
    },
  });

  if (!expert) {
    return NextResponse.json({ error: "Token invalide" }, { status: 404 });
  }

  const cert = expert.certification;
  const isValid = cert?.status === "ACTIVE" && (!cert.expiresAt || cert.expiresAt > new Date());

  return NextResponse.json({
    name: [expert.user.firstName, expert.user.lastName].filter(Boolean).join(" "),
    specialties: expert.specialties,
    city: expert.city,
    certified: isValid,
    certifiedSince: cert?.issuedAt ?? null,
    certExpires: cert?.expiresAt ?? null,
    certificateId: cert?.certificateId ?? null,
    verifyUrl: `${process.env.NEXTAUTH_URL}/verifier/${cert?.certificateId}`,
    rating: expert.averageRating,
    reviewCount: expert.reviewCount,
  });
}
