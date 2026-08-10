import { initialCategories, initialMenus, initialIngredients, initialOperationalCosts } from "@/lib/db/schemas/master";
import { initialTransactions, initialPriceHistory } from "@/lib/db/schemas/transaction";
import { initialUsers, initialRefreshTokens } from "@/lib/db/schemas/auth";

export * from "@/lib/db/schemas/master";
export * from "@/lib/db/schemas/transaction";
export * from "@/lib/db/schemas/auth";
export * from "@/lib/db/views/analytics";

// Unified Client database instance
export const db = {
  master: {
    categories: initialCategories,
    menus: initialMenus,
    ingredients: initialIngredients,
    operationalCosts: initialOperationalCosts,
  },
  transactions: {
    orders: initialTransactions,
    priceHistory: initialPriceHistory,
  },
  auth: {
    users: initialUsers,
    refreshTokens: initialRefreshTokens,
  },
};

