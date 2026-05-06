import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/resend-client", () => ({
  sendWaitlistNotification: vi.fn().mockResolvedValue({ ok: true }),
}));

import { POST } from "@/app/api/waitlist/route";
import { sendWaitlistNotification } from "@/lib/resend-client";

function makeRequest(body: unknown) {
  return new Request("http://localhost/api/waitlist", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/waitlist", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rejects requests with no role", async () => {
    const res = await POST(makeRequest({ name: "Alice", email: "a@b.com" }));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBeDefined();
  });

  it("rejects an invalid email", async () => {
    const res = await POST(
      makeRequest({ role: "talent", name: "Alice", email: "not-an-email", primarySkill: "ops" }),
    );
    expect(res.status).toBe(400);
  });

  it("accepts a valid talent submission and triggers a notification", async () => {
    const res = await POST(
      makeRequest({
        role: "talent",
        name: "Alice",
        email: "alice@example.com",
        primarySkill: "fractional CFO",
        availability: "10 hrs/week",
      }),
    );
    expect(res.status).toBe(200);
    expect(sendWaitlistNotification).toHaveBeenCalledOnce();
    expect(sendWaitlistNotification).toHaveBeenCalledWith(
      expect.objectContaining({ role: "talent", email: "alice@example.com" }),
    );
  });

  it("accepts a valid benefactor submission", async () => {
    const res = await POST(
      makeRequest({
        role: "benefactor",
        name: "Acme Co",
        email: "founder@acme.com",
        organization: "Acme",
        contribution: "early-stage equity",
      }),
    );
    expect(res.status).toBe(200);
  });

  it("accepts a valid supplier submission", async () => {
    const res = await POST(
      makeRequest({
        role: "supplier",
        name: "Tess",
        email: "tess@boats.com",
        product: "yacht charters",
        feeModel: "success",
      }),
    );
    expect(res.status).toBe(200);
  });

  it("rejects malformed JSON", async () => {
    const req = new Request("http://localhost/api/waitlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "not-json",
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });
});
