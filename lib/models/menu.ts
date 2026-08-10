export interface Category {
  id: string;
  name: string;
  icon?: string;
  color_scheme?: string;
  created_at?: Date;
  created_by?: string;
  updated_at?: Date;
  updated_by?: string;
}

export interface RecipeIngredient {
  id?: string;
  menu_id?: string;
  name: string;
  package_price: number;
  package_capacity: number;
  usage_amount: number;
  unit_cost?: number;
  created_at?: Date;
  created_by?: string;
}

export interface OperationalCost {
  id?: string;
  menu_id?: string;
  name: string;
  cost_amount: number;
  created_at?: Date;
  created_by?: string;
}

export interface Menu {
  id: string;
  category_id: string;
  category_name?: string;
  name: string;
  hpp: number;
  selling_price: number;
  margin_percent: number;
  is_manual_price: boolean;
  image_url?: string;
  ingredients?: RecipeIngredient[];
  operational_costs?: OperationalCost[];
  created_at?: Date;
  created_by?: string;
  updated_at?: Date;
  updated_by?: string;
}

export interface MenuPriceHistory {
  id: string;
  menu_id: string;
  hpp: number;
  selling_price: number;
  margin_percent: number;
  created_at: Date;
  created_by?: string;
}
