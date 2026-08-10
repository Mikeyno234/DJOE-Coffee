export interface TransactionItem {
  id?: string;
  transaction_id?: string;
  menu_id: string;
  menu_name: string;
  unit_hpp: number;
  unit_price: number;
  quantity: number;
  subtotal: number;
}

export interface Transaction {
  id: string;
  transaction_no: string;
  total_amount: number;
  cash_received: number;
  change_amount: number;
  payment_method: string;
  user_id?: string;
  cashier_name?: string;
  items: TransactionItem[];
  created_at: Date;
  created_by?: string;
}
