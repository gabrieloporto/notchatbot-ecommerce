import { db } from "@/server/db";
import { products, shippingCosts } from "@/server/db/schema";
import { eq, inArray } from "drizzle-orm";
import { NextResponse, type NextRequest } from "next/server";

type CheckoutItem = {
  productId: number;
  quantity: number;
};

type CheckoutRequest = {
  items: CheckoutItem[];
  postalCode: string;
};

export async function POST(req: NextRequest) {
  const body = (await req.json()) as CheckoutRequest;

  const { items, postalCode } = body;

  if (!items || !postalCode) {
    return NextResponse.json(
      { error: "Missing items or postal code" },
      { status: 400 },
    );
  }

  const productIds = items.map((item) => item.productId);

  const dbProducts = await db
    .select()
    .from(products)
    .where(inArray(products.id, productIds));

  const shippingResult = await db
    .select()
    .from(shippingCosts)
    .where(eq(shippingCosts.postalCode, postalCode))
    .limit(1);

  const shippingPrice = shippingResult[0]?.price ?? null;

  if (!shippingPrice) {
    return NextResponse.json({ error: "Invalid postal code" }, { status: 404 });
  }

  const orderItems = dbProducts.map((product) => {
    const item = items.find((i) => i.productId === product.id)!;
    return {
      productId: product.id,
      name: product.name,
      unitPrice: product.price,
      quantity: item.quantity,
      total: Number(product.price) * item.quantity, // for strict number ops
    };
  });

  const subtotal = orderItems.reduce((sum, item) => sum + item.total, 0);
  const total = subtotal + shippingPrice;

  return NextResponse.json({
    items: orderItems,
    subtotal,
    shipping: shippingPrice,
    total,
  });
}
