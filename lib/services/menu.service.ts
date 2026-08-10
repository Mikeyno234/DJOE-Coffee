import { db } from "@/lib/db/client";
import { Menu } from "@/lib/models/menu";
import { HppService } from "./hpp.service";


export interface SaveMenuPayload {
  id?: string;
  name: string;
  category_id: string;
  category_name: string;
  ingredients: { name: string; package_price: number; package_capacity: number; usage_amount: number }[];
  operational_costs: { name: string; cost_amount: number }[];
  target_margin_percent: number;
  manual_selling_price?: number;
}

export class MenuService {
  /**
   * Saves or updates a menu item, auto-computes HPP & price, and records price history updates
   */
  static saveMenu(payload: SaveMenuPayload): { success: boolean; menu?: Menu; error?: string } {
    if (!payload.name || payload.name.trim() === "") {
      return { success: false, error: "Nama menu wajib diisi." };
    }

    const calcResult = HppService.calculateHPP({
      ingredients: payload.ingredients,
      operational_costs: payload.operational_costs,
      target_margin_percent: payload.target_margin_percent,
      manual_selling_price: payload.manual_selling_price,
    });

    const isExisting = payload.id && db.master.menus.some((m: Menu) => m.id === payload.id);
    const menuId = payload.id || `menu-${Date.now()}`;
    const now = new Date().toISOString();

    if (isExisting) {
      const idx = db.master.menus.findIndex((m: Menu) => m.id === menuId);
      const oldMenu = db.master.menus[idx];


      // Audit trail logging if price or HPP modified
      if (oldMenu.hpp !== calcResult.total_hpp || oldMenu.selling_price !== calcResult.selling_price) {
        db.transactions.priceHistory.push({
          id: `hist-${Date.now()}`,
          menu_id: menuId,
          hpp: oldMenu.hpp,
          selling_price: oldMenu.selling_price,
          margin_percent: oldMenu.margin_percent,
          created_at: now,
        });
      }

      db.master.menus[idx] = {
        ...oldMenu,
        name: payload.name,
        category_id: payload.category_id,
        category_name: payload.category_name,
        hpp: calcResult.total_hpp,
        selling_price: calcResult.selling_price,
        margin_percent: calcResult.margin_percent,
        is_manual_price: !!(payload.manual_selling_price && payload.manual_selling_price > 0),
        updated_at: new Date(),
      };

      return { success: true, menu: db.master.menus[idx] };
    }

    const newMenu: Menu = {
      id: menuId,
      name: payload.name,
      category_id: payload.category_id,
      category_name: payload.category_name,
      hpp: calcResult.total_hpp,
      selling_price: calcResult.selling_price,
      margin_percent: calcResult.margin_percent,
      is_manual_price: !!(payload.manual_selling_price && payload.manual_selling_price > 0),
      created_at: new Date(),
      updated_at: new Date(),
    };

    db.master.menus.unshift(newMenu);
    return { success: true, menu: newMenu };
  }
}
