/**
 * Browser-side client for public support endpoints. No auth required —
 * the backend rate-limits these per IP.
 */
import { SERVER_UNREACHABLE_MESSAGE } from "@/lib/api/auth";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3000";

export async function submitContactMessage(input: {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}): Promise<{ ok: boolean; status: number; message: string }> {
  let res: Response;
  try {
    res = await fetch(`${API_BASE}/api/support/contact`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
  } catch {
    return { ok: false, status: 0, message: SERVER_UNREACHABLE_MESSAGE };
  }
  const body = (await res.json().catch(() => null)) as {
    success?: boolean;
    message?: string;
  } | null;
  const message =
    res.status === 0
      ? SERVER_UNREACHABLE_MESSAGE
      : (body?.message ??
        (res.status === 201
          ? "Message received."
          : "Unable to send your message right now."));
  return { ok: res.status === 201, status: res.status, message };
}
