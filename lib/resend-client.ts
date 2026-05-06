import { Resend } from "resend";
import type { WaitlistSubmission } from "@/lib/waitlist-schema";

const NOTIFY_TO = "jeff.cline@me.com";
const NOTIFY_FROM = "Spurrt Waitlist <waitlist@spurrt.com>";

export async function sendWaitlistNotification(
  submission: WaitlistSubmission,
): Promise<{ ok: boolean; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    console.log("[waitlist] RESEND_API_KEY not set; submission logged only:", submission);
    return { ok: true };
  }

  const resend = new Resend(apiKey);
  const subject = `Spurrt waitlist: new ${submission.role} — ${submission.name}`;
  const lines = Object.entries(submission)
    .map(([k, v]) => `${k}: ${v}`)
    .join("\n");

  try {
    const { error } = await resend.emails.send({
      from: NOTIFY_FROM,
      to: [NOTIFY_TO],
      subject,
      text: lines,
    });
    if (error) {
      console.error("[waitlist] resend error:", error);
      return { ok: false, error: error.message };
    }
    return { ok: true };
  } catch (err) {
    console.error("[waitlist] unexpected resend exception:", err);
    return { ok: false, error: err instanceof Error ? err.message : "unknown" };
  }
}
