"use client";

import React, { useState } from "react";
import { createPortal } from "react-dom";
import { formatIDR } from "@/lib/utils/currency";
import { PrinterIcon, XMarkIcon, BuildingStorefrontIcon, SignalIcon } from "@heroicons/react/24/solid";
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
    setBtStatus("Menghubungkan ke Printer Bluetooth VSC 58mm...");
    const res = await BluetoothThermalPrinter.printReceipt(receiptTx);
    if (res.success) {
      setBtStatus("✓ Berhasil mencetak ke Bluetooth Printer!");
    } else {
      setBtStatus(`⚠️ ${res.error}`);
    }
    setIsBtPrinting(false);
  };

  return (
    <>
      {/* 1. On-Screen Preview Modal (Hidden when printing) */}
      <div className="no-print fixed inset-0 z-50 bg-[#1E3932]/75 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in overflow-y-auto">
        <div className="bg-white rounded-3xl max-w-sm w-full p-5 shadow-2xl space-y-4 border border-[#cba258]/30 animate-scale-in relative max-h-[90vh] overflow-y-auto my-auto">
          {/* Header Controls */}
          <div className="flex justify-between items-center border-b border-stone-200 pb-3">
            <h3 className="font-black text-xs text-[#543A14] flex items-center gap-2">
              <PrinterIcon className="w-4 h-4 text-[#543A14]" />
              <span>Preview Struk Kasir Thermal</span>
            </h3>
            <div className="flex gap-1 bg-stone-100 p-1 rounded-xl">
              {(["58", "80"] as const).map((sz) => (
                <button
                  key={sz}
                  onClick={() => setPrintSize(sz)}
                  className={`px-2 py-0.5 rounded-lg text-[10px] font-extrabold cursor-pointer transition-all ${
                    printSize === sz ? "bg-[#543A14] text-[#F0BB78] shadow-sm" : "text-stone-600 hover:text-stone-900"
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
          <div className="font-mono text-xs p-4 bg-stone-50 text-black border border-stone-300 rounded-xl space-y-2 leading-tight">
            <div className="text-center space-y-0.5">
              <img
                src="/images/Logo/logo.png"
                alt="DJOE COFFEE Logo"
                className="w-10 h-10 rounded-full mx-auto mb-1 border border-amber-300/60 object-cover shadow-xs"
              />
              <p className="font-black text-sm uppercase tracking-wider">{storeName}</p>
              <p className="text-[9px] text-stone-600 leading-tight max-w-[220px] mx-auto">{storeAddress}</p>
              <p className="text-[10px] text-stone-600">{storePhone}</p>
            </div>


            <div className="flex justify-between text-[11px] pt-1 border-t border-dashed border-stone-400 font-bold">
              <span>{nowStr}</span>
              <span>#{receiptTx.transaction_no || "TRX-KOP_0001"}</span>
            </div>

            <div className="border-t border-dashed border-stone-400 my-1"></div>

            <div className="space-y-1.5 text-[11px]">
              {receiptTx.items?.map((item: any, idx: number) => (
                <div key={idx} className="space-y-0.5">
                  <div className="font-bold text-stone-900">{item.menu_name}</div>
                  <div className="flex justify-between text-stone-700 pl-2">
                    <span>
                      {item.quantity}x {formatIDR(item.unit_price || item.price || 0).replace("Rp ", "")}
                    </span>
                    <span className="font-bold text-stone-900">
                      {formatIDR(item.subtotal || item.price * item.quantity).replace("Rp ", "")}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-dashed border-stone-400 my-1"></div>

            <div className="space-y-1 text-[11px] font-mono">
              <div className="flex justify-between font-bold">
                <span>Total</span>
                <span>{formatIDR(receiptTx.total_amount)}</span>
              </div>
              <div className="flex justify-between text-stone-700">
                <span>Tunai</span>
                <span>{formatIDR(receiptTx.cash_received)}</span>
              </div>
              {receiptTx.change_amount > 0 && (
                <div className="flex justify-between text-stone-700">
                  <span>Kembali</span>
                  <span>{formatIDR(receiptTx.change_amount)}</span>
                </div>
              )}
              <div className="text-right font-bold pt-0.5">Lunas</div>
            </div>

            <div className="border-t border-dashed border-stone-400 my-1"></div>

            <div className="text-center text-[10px] space-y-1.5 text-stone-700 pt-1 font-sans">
              <p>{storeFooter}</p>
              <p className="font-bold">Kasir : {receiptTx.cashier_name || "Shift Cashier"}</p>
              <p className="font-extrabold pt-1">Terima kasih</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2 pt-1">
            <div className="flex gap-2">
              <button
                onClick={onClose}
                className="flex-1 py-2.5 border border-stone-300 rounded-2xl font-bold text-xs text-stone-600 hover:bg-stone-100 cursor-pointer transition-colors flex items-center justify-center gap-1"
              >
                <XMarkIcon className="w-4 h-4" />
                <span>Tutup</span>
              </button>

              <button
                onClick={handlePrint}
                className="flex-1 py-2.5 bg-[#543A14] hover:bg-[#3d2a0e] text-[#F0BB78] rounded-2xl font-black text-xs shadow-lg cursor-pointer transition-all flex items-center justify-center gap-1.5 active:scale-95 transform hover:-translate-y-0.5"
              >
                <PrinterIcon className="w-4 h-4 text-[#F0BB78]" />
                <span>Cetak Standard</span>
              </button>

            </div>

            <button
              onClick={handleBluetoothPrint}
              disabled={isBtPrinting}
              className="w-full py-2.5 bg-blue-700 hover:bg-blue-800 text-white rounded-2xl font-black text-xs shadow-md cursor-pointer transition-all flex items-center justify-center gap-1.5 active:scale-95 disabled:opacity-50"
            >
              <SignalIcon className="w-4 h-4 text-blue-200" />
              <span>{isBtPrinting ? "Proses Bluetooth..." : "Cetak Langsung via Bluetooth"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Standalone Direct Body Portal Target (Only Active Element during Print) */}
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

              <div className="border-t border-dashed border-black my-1"></div>

              <div className="space-y-1 text-[8pt]">
                {receiptTx.items?.map((item: any, idx: number) => (
                  <div key={idx} className="space-y-0.5">
                    <div className="font-extrabold text-black truncate max-w-[42mm]">{item.menu_name}</div>
                    <div className="flex justify-between font-bold pl-1">
                      <span>
                        {item.quantity}x {formatIDR(item.unit_price || item.price || 0).replace("Rp ", "")}
                      </span>
                      <span className="font-extrabold text-black">
                        {formatIDR(item.subtotal || item.price * item.quantity).replace("Rp ", "")}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-dashed border-black my-1"></div>

              <div className="space-y-0.5 text-[8pt] font-mono">
                <div className="flex justify-between font-extrabold text-black text-[8.5pt]">
                  <span>Total</span>
                  <span>{formatIDR(receiptTx.total_amount)}</span>
                </div>
                <div className="flex justify-between font-bold">
                  <span>Tunai</span>
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
