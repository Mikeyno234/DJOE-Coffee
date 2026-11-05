"use client";

import React, { useState } from "react";
import { createPortal } from "react-dom";
import { formatIDR } from "@/lib/utils/currency";
import { PrinterIcon, XMarkIcon, SignalIcon } from "@heroicons/react/24/outline";
import { BluetoothThermalPrinter } from "@/lib/utils/bluetoothPrinter";
import { StoreConfig } from "@/lib/models/store";

interface ReceiptModalProps {
  receiptTx: any;
  storeConfig?: StoreConfig;
  printSize: "58" | "80" | "a4";
  setPrintSize: (size: "58" | "80" | "a4") => void;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  receiptTx,
  storeConfig,
  printSize,
  setPrintSize,
  onClose,
}) => {
  const [btStatus, setBtStatus] = useState<string>("");
  const [isBtPrinting, setIsBtPrinting] = useState<boolean>(false);

  if (!receiptTx) return null;

  const storeName = storeConfig?.store_name || "DJOE COFFEE";
  const storeAddress =
    storeConfig?.address ||
    "Jl. KH. Abu Bakar, Pateban Kauman, Kebonharjo, Kec. Patebon, Kabupaten Kendal, Jawa Tengah 51351";
  const storePhone = storeConfig?.phone || "Telp: 08950000000";
  const storeFooter = storeConfig?.receipt_footer || "Open: 9:00 AM - 10:00 PM @djoecoffee";

  const nowStr = new Date().toLocaleDateString("id-ID", {
    day: "numeric",
    month: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const handlePrint = () => {
    const originalTitle = document.title;
    document.title = receiptTx.transaction_no || `TRX-KOP_0001`;
    window.print();
    document.title = originalTitle;
  };

  const handleBluetoothPrint = async () => {
    setIsBtPrinting(true);
    setBtStatus("Menghubungkan ke Printer Bluetooth 58mm...");
    const res = await BluetoothThermalPrinter.printReceipt(receiptTx);
    if (res.success) {
      setBtStatus("Berhasil mencetak ke Bluetooth Printer");
    } else {
      setBtStatus(`Gagal: ${res.error}`);
    }
    setIsBtPrinting(false);
  };

  return (
    <>
      {/* 1. On-Screen Preview Modal (Hidden during browser print) */}
      <div className="no-print fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in overflow-y-auto">
        <div className="bg-white rounded-3xl max-w-sm w-full p-5 shadow-2xl space-y-4 border border-stone-200/80 animate-scale-in relative max-h-[90vh] overflow-y-auto my-auto">
          {/* Header Controls */}
          <div className="flex justify-between items-center border-b border-stone-100 pb-3">
            <div className="flex items-center gap-2">
              <PrinterIcon className="w-4 h-4 text-[#C89B3C]" />
              <h3 className="font-bold text-xs text-[#1A120B]">Preview Struk Kasir</h3>
            </div>
            <div className="flex gap-1 bg-stone-100 p-1 rounded-xl">
              {(["58", "80"] as const).map((sz) => (
                <button
                  key={sz}
                  onClick={() => setPrintSize(sz)}
                  className={`px-2.5 py-0.5 rounded-lg text-[10px] font-bold cursor-pointer transition-all ${
                    printSize === sz
                      ? "bg-[#1A120B] text-white shadow-xs"
                      : "text-stone-600 hover:text-stone-900"
                  }`}
                >
                  {sz}mm
                </button>
              ))}
            </div>
          </div>

          {btStatus && (
            <div className="p-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-[11px] font-semibold animate-slide-up">
              {btStatus}
            </div>
          )}

          {/* On-screen Preview Receipt */}
          <div className="font-mono text-xs p-4 bg-stone-50 text-black border border-stone-200 rounded-xl space-y-2 leading-tight select-none">
            <div className="text-center space-y-0.5">
              <div className="w-8 h-8 rounded-full bg-white p-0.5 border border-stone-300 mx-auto mb-1 flex items-center justify-center">
                <img
                  src="/images/Logo/logo.png"
                  alt="DJOE COFFEE"
                  className="w-full h-full object-contain rounded-full"
                />
              </div>
              <p className="font-bold text-xs uppercase tracking-wider">{storeName}</p>
              <p className="text-[9px] text-stone-500 leading-tight">{storeAddress}</p>
              <p className="text-[9px] text-stone-500">{storePhone}</p>
            </div>

            <div className="border-t border-dashed border-stone-300 my-2"></div>

            <div className="flex justify-between text-[10px] text-stone-600">
              <span>{nowStr}</span>
              <span className="font-bold text-stone-900">#{receiptTx.transaction_no || "TRX-0001"}</span>
            </div>

            <div className="flex justify-between text-[10px] text-stone-700 font-medium">
              <span>
                {receiptTx.order_type === "TAKE_AWAY" ? "Take Away (Bungkus)" : "Dine In"}
                {receiptTx.table_number ? ` • Meja ${receiptTx.table_number}` : ""}
              </span>
              {receiptTx.customer_name && (
                <span className="font-semibold text-stone-900 truncate max-w-[120px]">
                  {receiptTx.customer_name}
                </span>
              )}
            </div>

            <div className="border-t border-dashed border-stone-300 my-2"></div>

            <div className="space-y-1.5 text-[11px]">
              {receiptTx.items?.map((item: any, idx: number) => (
                <div key={idx} className="space-y-0.5">
                  <div className="font-bold text-stone-900 truncate">{item.menu_name}</div>
                  {item.notes && (
                    <div className="text-[9px] text-stone-500 italic pl-1">
                      * {item.notes}
                    </div>
                  )}
                  <div className="flex justify-between text-stone-600 pl-1 text-[10px]">
                    <span>
                      {item.quantity}x {formatIDR(item.unit_price || item.price || 0)}
                    </span>
                    <span className="font-bold text-stone-900">
                      {formatIDR(item.subtotal || (item.unit_price || item.price) * item.quantity)}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-dashed border-stone-300 my-2"></div>

            <div className="space-y-1 text-[11px]">
              {receiptTx.discount_amount > 0 && (
                <>
                  <div className="flex justify-between text-stone-600">
                    <span>Subtotal</span>
                    <span className="tabular-nums">
                      {formatIDR(receiptTx.subtotal_amount || receiptTx.total_amount + receiptTx.discount_amount)}
                    </span>
                  </div>
                  <div className="flex justify-between text-rose-600 font-medium">
                    <span>Diskon Promo</span>
                    <span className="tabular-nums">-{formatIDR(receiptTx.discount_amount)}</span>
                  </div>
                </>
              )}
              <div className="flex justify-between font-bold text-stone-900">
                <span>Total Tagihan</span>
                <span className="tabular-nums">{formatIDR(receiptTx.total_amount)}</span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>
                  {receiptTx.payment_method === "QRIS"
                    ? "QRIS Digital"
                    : receiptTx.payment_method === "DEBIT"
                    ? "Debit / EDC"
                    : "Tunai"}
                </span>
                <span className="tabular-nums">{formatIDR(receiptTx.cash_received)}</span>
              </div>
              {receiptTx.change_amount > 0 && (
                <div className="flex justify-between text-stone-600">
                  <span>Kembali</span>
                  <span className="tabular-nums">{formatIDR(receiptTx.change_amount)}</span>
                </div>
              )}
            </div>

            <div className="border-t border-dashed border-stone-300 my-2"></div>

            <div className="text-center text-[9px] text-stone-500 space-y-0.5 pt-1">
              <p>{storeFooter}</p>
              <p>Kasir: {receiptTx.cashier_name || "Kasir Kedai"}</p>
              <p className="font-bold text-stone-700 pt-0.5">Terima kasih atas kunjungan Anda</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2 pt-1">
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={onClose}
                className="w-full py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl font-bold text-xs cursor-pointer transition-all active:scale-95"
              >
                Tutup
              </button>
              <button
                onClick={handlePrint}
                className="w-full py-2.5 bg-[#1A120B] hover:bg-[#2A1D13] text-white rounded-xl font-bold text-xs shadow-xs cursor-pointer transition-all flex items-center justify-center gap-1.5 active:scale-95"
              >
                <PrinterIcon className="w-3.5 h-3.5 text-[#C89B3C]" />
                <span>Cetak Struk</span>
              </button>
            </div>

            <button
              onClick={handleBluetoothPrint}
              disabled={isBtPrinting}
              className="w-full py-2.5 bg-stone-800 hover:bg-stone-900 text-stone-100 rounded-xl font-bold text-xs shadow-xs cursor-pointer transition-all flex items-center justify-center gap-1.5 active:scale-95 disabled:opacity-50"
            >
              <SignalIcon className="w-3.5 h-3.5 text-[#C89B3C]" />
              <span>{isBtPrinting ? "Menghubungkan..." : "Cetak via Bluetooth Thermal"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Standalone Direct Body Portal Target (Active Element during Print) */}
      {typeof window !== "undefined" &&
        createPortal(
          <div id="printable-receipt-portal">
            <div id="printable-receipt" className="font-mono text-black">
              <div className="text-center space-y-0.5">
                <img
                  src="/images/Logo/logo.png"
                  alt="DJOE COFFEE Logo"
                  className="w-9 h-9 rounded-full mx-auto mb-1 border border-black object-cover"
                />
                <p className="font-black text-xs uppercase tracking-wider">{storeName}</p>
                <p className="text-[7.5pt] font-bold leading-tight">{storeAddress}</p>
                <p className="text-[7.5pt] font-bold">{storePhone}</p>
              </div>

              <div className="border-t border-dashed border-black my-1"></div>

              <div className="flex justify-between text-[7.5pt] font-bold">
                <span>{nowStr}</span>
                <span>#{receiptTx.transaction_no || "TRX-001"}</span>
              </div>

              <div className="flex justify-between text-[7.5pt] font-bold">
                <span>
                  {receiptTx.order_type === "TAKE_AWAY" ? "TAKE AWAY" : "DINE IN"}
                  {receiptTx.table_number ? ` (MEJA ${receiptTx.table_number})` : ""}
                </span>
                {receiptTx.customer_name && <span>{receiptTx.customer_name}</span>}
              </div>

              <div className="border-t border-dashed border-black my-1"></div>

              <div className="space-y-1 text-[8pt]">
                {receiptTx.items?.map((item: any, idx: number) => (
                  <div key={idx} className="space-y-0.5">
                    <div className="font-extrabold text-black truncate max-w-[42mm]">{item.menu_name}</div>
                    {item.notes && (
                      <div className="text-[7pt] pl-1 font-bold">
                        * {item.notes}
                      </div>
                    )}
                    <div className="flex justify-between font-bold pl-1">
                      <span>
                        {item.quantity}x {formatIDR(item.unit_price || item.price || 0).replace("Rp ", "")}
                      </span>
                      <span className="font-extrabold text-black">
                        {formatIDR(item.subtotal || (item.unit_price || item.price) * item.quantity).replace("Rp ", "")}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-dashed border-black my-1"></div>

              <div className="space-y-0.5 text-[8pt] font-mono">
                {receiptTx.discount_amount > 0 && (
                  <>
                    <div className="flex justify-between font-bold">
                      <span>Subtotal</span>
                      <span>{formatIDR(receiptTx.subtotal_amount || receiptTx.total_amount + receiptTx.discount_amount)}</span>
                    </div>
                    <div className="flex justify-between font-bold">
                      <span>Diskon</span>
                      <span>-{formatIDR(receiptTx.discount_amount)}</span>
                    </div>
                  </>
                )}
                <div className="flex justify-between font-extrabold text-black text-[8.5pt]">
                  <span>Total</span>
                  <span>{formatIDR(receiptTx.total_amount)}</span>
                </div>
                <div className="flex justify-between font-bold">
                  <span>
                    {receiptTx.payment_method === "QRIS"
                      ? "QRIS"
                      : receiptTx.payment_method === "DEBIT"
                      ? "Debit/EDC"
                      : "Tunai"}
                  </span>
                  <span>{formatIDR(receiptTx.cash_received)}</span>
                </div>
                {receiptTx.change_amount > 0 && (
                  <div className="flex justify-between font-bold">
                    <span>Kembali</span>
                    <span>{formatIDR(receiptTx.change_amount)}</span>
                  </div>
                )}
                <div className="text-right font-extrabold pt-0.5">Lunas</div>
              </div>

              <div className="border-t border-dashed border-black my-1"></div>

              <div className="text-center text-[7.5pt] space-y-0.5 font-bold pt-0.5">
                <p>{storeFooter}</p>
                <p className="font-extrabold">Kasir : {receiptTx.cashier_name || "Shift Cashier"}</p>
                <p className="font-black pt-0.5">Terima kasih</p>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
};
