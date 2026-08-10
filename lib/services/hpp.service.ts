export interface CalculateHPPInput {
  ingredients: { package_price: number; package_capacity: number; usage_amount: number }[];
  operational_costs: { cost_amount: number }[];
  target_margin_percent: number;
  manual_selling_price?: number;
}

export class HppService {
  static calculateHPP(input: CalculateHPPInput) {
    const ingredientCost = input.ingredients.reduce((acc, curr) => {
      if (curr.package_capacity <= 0) return acc;
      return acc + (curr.package_price / curr.package_capacity) * curr.usage_amount;
    }, 0);

    const operationalCost = input.operational_costs.reduce((acc, curr) => acc + curr.cost_amount, 0);

    const total_hpp = Math.round(ingredientCost + operationalCost);

    let selling_price = 0;
    if (input.manual_selling_price && input.manual_selling_price > 0) {
      selling_price = input.manual_selling_price;
    } else {
      const rawPrice = total_hpp * (1 + input.target_margin_percent / 100);
      selling_price = Math.ceil(rawPrice / 1000) * 1000;
    }

    const margin_percent = total_hpp > 0 ? parseFloat((((selling_price - total_hpp) / total_hpp) * 100).toFixed(1)) : 0;

    return {
      ingredient_cost: Math.round(ingredientCost),
      operational_cost: Math.round(operationalCost),
      total_hpp,
      selling_price,
      margin_percent,
    };
  }
}
