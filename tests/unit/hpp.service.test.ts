import { describe, it, expect } from "vitest";
import { HppService } from "@/lib/services/hpp.service";

describe("HppService.calculateHPP", () => {
  it("should calculate correct ingredient cost and total HPP", () => {
    const result = HppService.calculateHPP({
      ingredients: [
        { package_price: 100000, package_capacity: 1000, usage_amount: 20 }, // 100/g * 20g = 2000
        { package_price: 24000, package_capacity: 1000, usage_amount: 150 }, // 24/ml * 150ml = 3600
      ],
      operational_costs: [
        { cost_amount: 500 }, // cup + lid
        { cost_amount: 300 }, // straw + sleeve
      ],
      target_margin_percent: 50,
    });

    // Ingredient cost: 2000 + 3600 = 5600
    expect(result.ingredient_cost).toBe(5600);
    // Operational cost: 500 + 300 = 800
    expect(result.operational_cost).toBe(800);
    // Total HPP: 5600 + 800 = 6400
    expect(result.total_hpp).toBe(6400);

    // Selling price: 6400 * 1.5 = 9600 -> rounded up to nearest 1000 = 10000
    expect(result.selling_price).toBe(10000);
    // Margin percent: ((10000 - 6400) / 6400) * 100 = 56.3%
    expect(result.margin_percent).toBe(56.3);
  });

  it("should safely handle zero or negative capacity without NaN", () => {
    const result = HppService.calculateHPP({
      ingredients: [
        { package_price: 50000, package_capacity: 0, usage_amount: 10 },
      ],
      operational_costs: [],
      target_margin_percent: 30,
    });

    expect(result.ingredient_cost).toBe(0);
    expect(result.total_hpp).toBe(0);
    expect(result.selling_price).toBe(0);
    expect(result.margin_percent).toBe(0);
  });

  it("should respect manual selling price override", () => {
    const result = HppService.calculateHPP({
      ingredients: [
        { package_price: 100000, package_capacity: 1000, usage_amount: 10 }, // 1000
      ],
      operational_costs: [{ cost_amount: 1000 }],
      target_margin_percent: 50,
      manual_selling_price: 15000,
    });

    expect(result.total_hpp).toBe(2000);
    expect(result.selling_price).toBe(15000);
    // Margin percent: ((15000 - 2000) / 2000) * 100 = 650%
    expect(result.margin_percent).toBe(650);
  });
});
