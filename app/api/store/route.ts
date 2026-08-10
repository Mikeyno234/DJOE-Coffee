import { NextResponse } from "next/server";
import { initialStoreConfig, StoreConfig } from "@/lib/models/store";

let currentStoreConfig: StoreConfig = { ...initialStoreConfig };

export async function GET() {
  return NextResponse.json({ success: true, data: currentStoreConfig });
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    currentStoreConfig = {
      ...currentStoreConfig,
      ...body,
    };
    return NextResponse.json({ success: true, data: currentStoreConfig });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
