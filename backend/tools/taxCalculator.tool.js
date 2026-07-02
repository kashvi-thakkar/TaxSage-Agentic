const { tool } = require("@langchain/core/tools");
const TaxCalculator = require("../utils/taxCalculator");
const compareRegimesTool = tool(
  async ({ income, deductions}) => {
    return JSON.stringify(
      TaxCalculator.compareRegimes(
        income,
        deductions
      )
    );
  },

  {
    name: "compare_tax_regimes",

    description:
      "Compare old and new tax regimes for a taxpayer.",

    schema: {
      type: "object",

      properties: {
        income: {
          type: "number"
        },

        deductions: {
          type: "number"
        }
      },

      required: [
        "income",
        "deductions"
      ]
    }
  }

);

module.exports = {
  compareRegimesTool
};