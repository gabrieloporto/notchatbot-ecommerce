import { db } from "@/server/db";
import { shippingCosts } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ cp: string }> },
) {
  const { cp } = await context.params;

  const result = await db
    .select()
    .from(shippingCosts)
    .where(eq(shippingCosts.postalCode, cp))
    .limit(1);

  const price = result[0]?.price;

  if (price == null) {
    return NextResponse.json(
      { error: "Postal code not found" },
      { status: 404 },
    );
  }

  return NextResponse.json({ price });
}
