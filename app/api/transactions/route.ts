import { NextResponse } from "next/server";
import { supabase } from "@/lib/db/supabaseClient";
import { PosService } from "@/lib/services/pos.service";
import { db } from "@/lib/db/client";

export async function GET() {
  try {
    const { data: orders, error } = await supabase
      .from("t_transactions")
      .select("*, items:t_transaction_items(*)")
      .order("created_at", { ascending: false });

    if (!error && orders && orders.length > 0) {
      return NextResponse.json({ success: true, data: orders });
    }
  } catch {
    // fallback
  }

  return NextResponse.json({ success: true, data: db.transactions.orders });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = PosService.checkout(body);

    if (!result.success || !result.transaction) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    }

    const tx = result.transaction;

    // Insert order header into Supabase t_transactions
    const { data: insertedTx, error: txErr } = await supabase
      .from("t_transactions")
      .insert([
        {
          transaction_no: tx.transaction_no,
          total_amount: tx.total_amount,
          cash_received: tx.cash_received,
          change_amount: tx.change_amount,
          payment_method: tx.payment_method || "CASH",
          user_id: 1,
          cashier_name: tx.cashier_name || "Kasir Kedai",
          created_by: 1,
        },
      ])
      .select()
      .single();

    if (!txErr && insertedTx && tx.items && tx.items.length > 0) {
      // Insert order items into Supabase t_transaction_items
      const itemsToInsert = tx.items.map((item: any) => ({
        transaction_id: insertedTx.id,
        menu_name: item.menu_name,
        unit_hpp: item.unit_hpp,
        unit_price: item.unit_price,
        quantity: item.quantity,
        subtotal: item.subtotal,
      }));

      await supabase.from("t_transaction_items").insert(itemsToInsert);
    }

    return NextResponse.json({ success: true, data: result.transaction });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
