import { Category, Menu, RecipeIngredient, OperationalCost } from "@/lib/models/menu";

export const initialCategories: Category[] = [
  { id: "cat-1", name: "Minuman" },
  { id: "cat-2", name: "Makanan" },
  { id: "cat-3", name: "Snack" },
  { id: "cat-4", name: "Lainnya" },
];

export const initialMenus: Menu[] = [
  {
    id: "menu-1",
    category_id: "cat-1",
    category_name: "Minuman",
    name: "Kopi Susu Gula Aren",
    hpp: 6800,
    selling_price: 20000,
    margin_percent: 194.1,
    is_manual_price: false,
    image_url: "/images/kopi_susu.png",
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    id: "menu-2",
    category_id: "cat-1",
    category_name: "Minuman",
    name: "Americano",
    hpp: 4200,
    selling_price: 15000,
    margin_percent: 257.1,
    is_manual_price: false,
    image_url: "/images/americano.png",
    created_at: new Date(),
    updated_at: new Date(),
  },
];


export const initialIngredients: RecipeIngredient[] = [
  { id: "ing-1", menu_id: "menu-1", name: "Espresso", package_price: 180000, package_capacity: 1000, usage_amount: 18, unit_cost: 3240 },
  { id: "ing-2", menu_id: "menu-1", name: "Susu UHT", package_price: 20000, package_capacity: 1000, usage_amount: 120, unit_cost: 2400 },
];

export const initialOperationalCosts: OperationalCost[] = [
  { id: "op-1", menu_id: "menu-1", name: "Cup 16oz + Tutup", cost_amount: 800 },
  { id: "op-2", menu_id: "menu-1", name: "Sedotan + Plastic Bag", cost_amount: 360 },
];
