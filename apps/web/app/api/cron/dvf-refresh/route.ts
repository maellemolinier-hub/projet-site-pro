export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";

// Called daily by Vercel Cron (vercel.json) at 3:00 AM
// Triggers the Celery task via the FastAPI endpoint
export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "https://api.immoexpert.fr";

  try {
    const res = await fetch(`${apiUrl}/admin/refresh-dvf`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Admin-Secret": process.env.ADMIN_SECRET ?? "",
      },
      body: JSON.stringify({ departments: ["75", "69", "13", "33", "59", "67", "31", "06"] }),
    });

    const data = await res.json();
    return NextResponse.json({ triggered: true, response: data });
  } catch (err) {
    console.error("DVF cron trigger failed:", err);
    return NextResponse.json({ triggered: false, error: String(err) }, { status: 500 });
  }
}
