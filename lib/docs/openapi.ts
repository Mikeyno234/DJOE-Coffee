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
    "/api/pos/catalog": {
      get: {
        summary: "Cashier catalog: store, categories, products with variants and modifier groups",
        tags: ["POS"],
        responses: {
          200: { description: "Catalog without cost (HPP) fields" },
          401: { description: "Not authenticated" },
          503: { description: "Database unreachable" },
        },
      },
    },
    "/api/checkout": {
      post: {
        summary: "Create a paid cash order atomically; prices are computed on the server",
        tags: ["POS"],
        parameters: [
          {
            name: "Idempotency-Key",
            in: "header",
            required: true,
            schema: { type: "string", minLength: 8, maxLength: 100 },
            description: "Repeating a key returns the original order instead of creating another",
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  store_id: { type: "integer", example: 2 },
                  order_type: { type: "string", enum: ["dine_in", "takeaway", "delivery"] },
                  discount_amount: { type: "integer", example: 0 },
                  items: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        product_id: { type: "integer" },
                        variant_id: { type: "integer", nullable: true },
                        quantity: { type: "integer", minimum: 1, maximum: 99 },
                        modifiers: { type: "array", items: { type: "integer" } },
                      },
                    },
                  },
                  payment: {
                    type: "object",
                    properties: {
                      method: { type: "string", enum: ["cash"] },
                      cash_received: { type: "integer", example: 50000 },
                    },
                  },
                },
              },
            },
          },
        },
        responses: {
          200: { description: "Order created or replayed" },
          400: { description: "Missing or malformed Idempotency-Key or JSON body" },
          422: { description: "Validation failed or business rule violated" },
          502: { description: "Storage failure, nothing was created" },
          503: { description: "Database unreachable, order status uncertain" },
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
