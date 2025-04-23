import { db } from "@/server/db";
import { products } from "@/server/db/schema";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const allProducts = await db.select().from(products);
    return NextResponse.json(allProducts);
  } catch (error) {
    console.error("Error al obtener productos:", error);
    return new NextResponse("Error interno del servidor", { status: 500 });
  }
}
