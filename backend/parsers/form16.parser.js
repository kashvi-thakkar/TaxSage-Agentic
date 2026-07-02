const { z } = require("zod");

const form16Schema = z.object({

  personal: z.object({
    firstName: z.string(),
    lastName: z.string(),
    pan: z.string(),

    address: z.object({
      street: z.string(),
      city: z.string(),
      state: z.string(),
      pincode: z.string()
    })
  }),

  employment: z.object({
    employerName: z.string(),
    assessmentYear: z.string(),
    employerTAN: z.string()
  }),

  income: z.object({
    basicSalary: z.number(),
    allowances: z.number(),
    perquisites: z.number(),
    profitsInLie: z.number(),
    grossSalary: z.number(),
    taxableIncome: z.number(),
    hraExemption: z.number(),
    standardDeduction: z.number()
  }),

  taxPaid: z.object({
    tds: z.number()
  }),

  deductions: z.object({
    section80C: z.number(),
    section80D: z.number(),
    section80G: z.number(),
    section24: z.number(),
    section80E: z.number(),
    section80TTA: z.number()
  })

});

module.exports = {
  form16Schema
};