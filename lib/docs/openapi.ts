export const openApiSpec = {
  openapi: "3.0.0",
  info: {
    title: "Kedai Kopi HPP & POS API",
    version: "1.0.0",
    description: "API Documentation for Kedai Kopi HPP (Harga Pokok Penjualan) & Point of Sale System",
  },
  paths: {
    "/api/auth/login": {
      post: {
        summary: "Staff & Admin Login",
        tags: ["Auth"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  email: { type: "string", example: "admin@kedaikopi.com" },
                  password: { type: "string", example: "admin123" },
                },
                required: ["email", "password"],
              },
            },
          },
        },
        responses: {
          200: { description: "Login successful" },
          401: { description: "Invalid credentials" },
        },
      },
    },
    "/api/auth/me": {
      get: {
        summary: "Get current user profile",
        tags: ["Auth"],
        responses: {
          200: { description: "User profile data" },
        },
      },
    },
    "/api/menus": {
      get: {
        summary: "Get all menu items",
        tags: ["Menus"],
        parameters: [
          {
            name: "category",
            in: "query",
            required: false,
            schema: { type: "string" },
            description: "Filter by category (Minuman, Makanan, Snack, Lainnya)",
          },
        ],
        responses: {
          200: { description: "List of menu items with HPP & prices" },
        },
      },
      post: {
        summary: "Create or update menu item & calculate HPP",
        tags: ["Menus"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  name: { type: "string", example: "Kopi Susu Gula Aren" },
                  category_id: { type: "string", example: "cat_1" },
                  category_name: { type: "string", example: "Minuman" },
                  ingredients: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        name: { type: "string", example: "Espresso Bean" },
                        package_price: { type: "number", example: 100000 },
                        package_capacity: { type: "number", example: 1000 },
                        usage_amount: { type: "number", example: 18 },
                      },
                    },
                  },
                  operational_costs: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        name: { type: "string", example: "Paper Cup" },
                        cost_amount: { type: "number", example: 1000 },
                      },
                    },
                  },
                  target_margin_percent: { type: "number", example: 50 },
                  manual_selling_price: { type: "number", example: 18000 },
                },
              },
            },
          },
        },
        responses: {
          200: { description: "Menu saved successfully" },
        },
      },
    },
    "/api/transactions": {
      get: {
        summary: "Get transaction list",
        tags: ["Transactions"],
        responses: {
          200: { description: "List of transactions" },
        },
      },
      post: {
        summary: "Create new POS transaction",
        tags: ["Transactions"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  cash_received: { type: "number", example: 50000 },
                  payment_method: { type: "string", example: "CASH" },
                  items: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        menu_id: { type: "string" },
                        quantity: { type: "number" },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        responses: {
          200: { description: "Transaction completed" },
        },
      },
    },
    "/api/analytics": {
      get: {
        summary: "Get dashboard analytics & KPIs",
        tags: ["Analytics"],
        responses: {
          200: { description: "KPI summary, top performers, category breakdown" },
        },
      },
    },
  },
};
