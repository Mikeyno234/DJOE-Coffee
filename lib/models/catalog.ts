// Shape sent to the cashier terminal. Cost (HPP) fields are intentionally absent:
// the terminal never needs them and the server prices every order itself.

export interface CatalogVariant {
  id: number;
  name: string;
  price_adjustment: number;
}

export interface CatalogModifierOption {
  id: number;
  name: string;
  price_adjustment: number;
}

export interface CatalogModifierGroup {
  id: number;
  name: string;
  is_required: boolean;
  min_selection: number;
  max_selection: number;
  options: CatalogModifierOption[];
}

export interface CatalogProduct {
  id: number;
  category_id: number | null;
  name: string;
  description: string | null;
  image_url: string | null;
  base_price: number;
  variants: CatalogVariant[];
  modifier_groups: CatalogModifierGroup[];
}

export interface CatalogCategory {
  id: number;
  name: string;
  sort_order: number;
}

export interface CatalogStore {
  id: number;
  name: string;
  address: string | null;
  phone: string | null;
  receipt_footer: string | null;
}

export interface Catalog {
  store: CatalogStore;
  categories: CatalogCategory[];
  products: CatalogProduct[];
}
