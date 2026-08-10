export interface StoreConfig {
  store_name: string;
  tagline: string;
  address: string;
  phone: string;
  receipt_footer: string;
}

export const initialStoreConfig: StoreConfig = {
  store_name: "KEDAI KOPI HPP",
  tagline: "Retail POS & HPP System",
  address: "Jl. Kenangan Kopi No. 88 Jogja",
  phone: "08897482739",
  receipt_footer: "Barang yang sudah dibeli tidak bisa dikembalikan lagi",
};
