import { NextRequest, NextResponse } from "next/server";

// Server-side order creation: the secret key never reaches the browser.
export async function POST(request: NextRequest) {
  const cart = (await request.json()) as {
    idempotencyKey: string;
    lines: { variantId: number; quantity: number }[];
    customer: { name: string; phone?: string; email?: string };
  };

  const res = await fetch(
    `${process.env.EZPOS_API_URL}/api/v1/storefront/orders`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.EZPOS_SECRET_KEY}`,
        "Idempotency-Key": cart.idempotencyKey,
      },
      body: JSON.stringify({
        lines: cart.lines,
        customer: cart.customer,
      }),
    },
  );

  if (res.status === 409) {
    const { message } = (await res.json()) as { message: string };
    return NextResponse.json({ error: message }, { status: 409 });
  }
  const order = await res.json();
  return NextResponse.json(order, { status: res.status });
}
