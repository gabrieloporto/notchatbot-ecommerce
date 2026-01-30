import { db } from "@/server/db";
import { products } from "@/server/db/schema";
import { ilike, or } from "drizzle-orm";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");

    if (!query || query.length < 2) {
      return NextResponse.json([]);
    }

    const searchResults = await db
      .select()
      .from(products)
      .where(
        or(
          ilike(products.name, `%${query}%`),
          ilike(products.description, `%${query}%`),
        ),
      )
      .limit(20);

    return NextResponse.json(searchResults);
  } catch (error) {
    console.error("Error al buscar productos:", error);
    return new NextResponse("Error interno del servidor", { status: 500 });
  }
}
