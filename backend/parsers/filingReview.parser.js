const { z } = require("zod");

const filingReviewSchema = z.object({
  summary: z.string(),
  issues: z.array(z.string()),
  recommendations: z.array(z.string()),
  confidence: z.number().min(0).max(100)
});

module.exports = {
  filingReviewSchema
};
