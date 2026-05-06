import { NextResponse } from "next/server";
import { WaitlistSchema } from "@/lib/waitlist-schema";
import { sendWaitlistNotification } from "@/lib/resend-client";

export async function POST(req: Request) {
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = WaitlistSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const result = await sendWaitlistNotification(parsed.data);
  if (!result.ok) {
    return NextResponse.json({ error: result.error || "Notification failed" }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
