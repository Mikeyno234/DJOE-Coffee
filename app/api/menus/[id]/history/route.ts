import { NextResponse } from "next/server";
import { db } from "@/lib/db/client";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: menuId } = await params;
  const history = db.transactions.priceHistory.filter((h: any) => h.menu_id === menuId);

  return NextResponse.json({
    success: true,
    count: history.length,
    data: history,
  });
}
