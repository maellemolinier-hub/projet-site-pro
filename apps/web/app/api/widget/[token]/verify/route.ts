import { NextResponse } from "next/server";
import { db } from "@immoexpert/db";

export async function GET(
  _req: Request,
  { params }: { params: { token: string } }
) {
  const expert = await db.expertProfile.findFirst({
    where: { widgetToken: params.token },
    include: {
      certification: true,
      user: { select: { firstName: true, lastName: true } },
    },
  });

  if (!expert?.certification) {
    return NextResponse.redirect(
      new URL(`/verifier/invalid`, process.env.NEXTAUTH_URL!)
    );
  }

  return NextResponse.redirect(
    new URL(`/verifier/${expert.certification.certificateId}`, process.env.NEXTAUTH_URL!)
  );
}
