// Bluetooth ESC/POS Direct Print Helper for 58mm Thermal Printers (e.g. VSC MP-58C)

export class BluetoothThermalPrinter {
  private static device: any = null;
  private static characteristic: any = null;

  static async connect(): Promise<{ success: boolean; deviceName?: string; error?: string }> {
    try {
      const nav = navigator as any;
      if (!nav.bluetooth) {
        return { success: false, error: "WebBluetooth tidak didukung oleh browser ini. Gunakan Google Chrome / Edge / Chrome Android." };
      }

      const device = await nav.bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: [
          "000018f0-0000-1000-8000-00805f9b34fb", // Standard ESC/POS SPP UUID
          "e7810a71-73ae-499d-8c15-faa9aef0c3f2",
          "49535343-fe7d-4ae5-8fa9-9fafd205e455",
        ],
      });

      const server = await device.gatt.connect();
      const services = await server.getPrimaryServices();

      let writeChar = null;
      for (const service of services) {
        const characteristics = await service.getCharacteristics();
        for (const char of characteristics) {
          if (char.properties.write || char.properties.writeWithoutResponse) {
            writeChar = char;
            break;
          }
        }
        if (writeChar) break;
      }

      if (!writeChar) {
        return { success: false, error: "Gagal menemukan layanan kirim cetak pada printer Bluetooth ini." };
      }

      this.device = device;
      this.characteristic = writeChar;

      return { success: true, deviceName: device.name || "Printer Bluetooth 58mm" };
    } catch (err: any) {
      return { success: false, error: err.message || "Pengkoneksian Bluetooth dibatalkan." };
    }
  }

  static async printReceipt(receiptTx: any): Promise<{ success: boolean; error?: string }> {
    if (!this.characteristic) {
      const conn = await this.connect();
      if (!conn.success) return { success: false, error: conn.error };
    }

    try {
      const encoder = new TextEncoder();
      const dateStr = new Date().toLocaleDateString("id-ID", {
        day: "numeric",
        month: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });

      let contentStr = "";
      contentStr += `KEDAI KOPI HPP\n`;
      contentStr += `Jl. Kenangan Kopi No. 88\n`;
      contentStr += `Telp: 08897482739\n`;
      contentStr += `--------------------------------\n`;
      contentStr += `${dateStr}  #${receiptTx.transaction_no || "0001"}\n`;
      contentStr += `--------------------------------\n`;

      if (receiptTx.items) {
        for (const item of receiptTx.items) {
          contentStr += `${item.menu_name}\n`;
          const qtyPrice = `${item.quantity}x ${item.unit_price || item.price}`;
          const subtotal = `${item.subtotal || item.price * item.quantity}`;
          const spaceCount = Math.max(1, 32 - (qtyPrice.length + subtotal.length));
          contentStr += `${qtyPrice}${" ".repeat(spaceCount)}${subtotal}\n`;
        }
      }

      contentStr += `--------------------------------\n`;
      contentStr += `TOTAL   : Rp ${receiptTx.total_amount}\n`;
      contentStr += `TUNAI   : Rp ${receiptTx.cash_received}\n`;
      if (receiptTx.change_amount > 0) {
        contentStr += `KEMBALI : Rp ${receiptTx.change_amount}\n`;
      }
      contentStr += `LUNAS\n`;
      contentStr += `--------------------------------\n`;
      contentStr += `Barang yg dibeli tdk dpt dikembalikan\n`;
      contentStr += `Kasir : Shift Cashier\n`;
      contentStr += `Terima Kasih!\n\n\n\n`;

      const dataBytes = encoder.encode(contentStr);
      
      const chunkSize = 100;
      for (let i = 0; i < dataBytes.length; i += chunkSize) {
        const chunk = dataBytes.slice(i, i + chunkSize);
        await this.characteristic.writeValue(chunk);
      }

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || "Gagal mencetak lewat Bluetooth." };
    }
  }
}
