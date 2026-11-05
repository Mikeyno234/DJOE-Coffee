import { describe, it, expect } from "vitest";
import crypto from "crypto";
import { createOrderSchema } from "@/lib/validations/order.schema";
import { openShiftSchema, closeShiftSchema } from "@/lib/validations/shift.schema";
import { AuthService } from "@/lib/services/auth.service";

describe("Phase 1: Zod Schemas & Security Validation", () => {
  it("should validate a compliant order payload", () => {
    const validStoreId = 2;
    const validProductId = 1;
    const validModifierId = 6;

    const validOrder = {
      store_id: validStoreId,
      order_type: "dine_in" as const,
      customer_name: "Budi",
      table_number: "T-04",
      items: [
        {
          product_id: validProductId,
          quantity: 2,
          notes: "less ice",
          modifiers: [validModifierId],
        },
      ],
      payment: {
        method: "cash" as const,
        cash_received: 50000,
      },
    };

    const parseResult = createOrderSchema.safeParse(validOrder);
    expect(parseResult.success).toBe(true);
  });

  it("should reject an order with invalid store id or empty items", () => {
    const invalidOrder = {
      store_id: "not-an-id",
      order_type: "dine_in",
      items: [],
      payment: { method: "cash" },
    };

    const parseResult = createOrderSchema.safeParse(invalidOrder);
    expect(parseResult.success).toBe(false);
    if (!parseResult.success) {
      const issuePaths = parseResult.error.issues.map((i) => i.path.join("."));
      expect(issuePaths.some((p) => p.includes("store_id"))).toBe(true);
      expect(issuePaths.some((p) => p.includes("items"))).toBe(true);
    }
  });

  it("should validate shift opening and closing constraints", () => {
    const validStoreId = 2;
    const validShiftId = 5;

    const validShiftOpen = {
      store_id: validStoreId,
      starting_cash: 200000,
      notes: "Shift Pagi Kasir 1",
    };
    expect(openShiftSchema.safeParse(validShiftOpen).success).toBe(true);

    const negativeShift = {
      store_id: validStoreId,
      starting_cash: -50000,
    };
    expect(openShiftSchema.safeParse(negativeShift).success).toBe(false);

    const validShiftClose = {
      shift_id: validShiftId,
      actual_cash: 1250000,
      notes: "Penutupan shift sesuai fisik",
    };
    expect(closeShiftSchema.safeParse(validShiftClose).success).toBe(true);
  });

  it("should hash with salted scrypt and verify correctly without plaintext leaks", () => {
    const rawPassword = "BaristaSuperPassword2026!";
    const scryptHash = AuthService.hashPasswordScrypt(rawPassword);

    expect(scryptHash).toContain(":");
    expect(AuthService.verifyPassword(rawPassword, scryptHash)).toBe(true);
    expect(AuthService.verifyPassword("WrongPassword", scryptHash)).toBe(false);

    // Verify plaintext is strictly rejected when storedHash is not matching
    expect(AuthService.verifyPassword(rawPassword, rawPassword)).toBe(false);
  });

  it.each([0, -1, 1.5, "7", null, Number.MAX_SAFE_INTEGER + 1])(
    "should reject %s as an identifier",
    (badId) => {
      const result = createOrderSchema.safeParse({
        store_id: badId,
        items: [{ product_id: 1, quantity: 1 }],
        payment: { method: "cash", cash_received: 1000 },
      });
      expect(result.success).toBe(false);
    }
  );

  it("should reject a negative discount", () => {
    const result = createOrderSchema.safeParse({
      store_id: 2,
      discount_amount: -1,
      items: [{ product_id: 1, quantity: 1 }],
      payment: { method: "cash", cash_received: 1000 },
    });
    expect(result.success).toBe(false);
  });
});
