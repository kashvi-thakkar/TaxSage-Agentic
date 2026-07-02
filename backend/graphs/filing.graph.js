const {
  StateGraph,
  START,
  END,
  Annotation
} = require("@langchain/langgraph");

const ingestionAgent = require("../agents/ingestion.agent");
const {compareRegimesTool} = require("../tools/taxCalculator.tool");
const reviewAgent = require("../agents/review.agent");
const submissionAgent = require("../agents/submission.agent");

const GraphState = Annotation.Root({

  filePath: Annotation({
    default: () => ""
  }),

  filingData: Annotation({
    default: () => ({})
  }),

  missingFields: Annotation({
    default: () => []
  }),

  taxAnalysis: Annotation({
    default: () => ({})
  }),

  review: Annotation({
    default: () => ({})
  }),

  readyToSubmit: Annotation({
    default: () => false
  }),

  reviewAttempts: Annotation({
    default: () => 0
  })

});


async function extractNode(state) {

  console.log("Extract Node");

  const filingData =
      await ingestionAgent.ingest({

        source: "local",

        filePath: state.filePath

    });

  return {
      filingData
  };
}


async function validateNode(state) {
  console.log("Validate Node");

  const missing = [];

  if (!state.filingData?.personal?.pan) {
    missing.push("PAN");
  }

  return {
    missingFields: missing
  };
}


async function updateNode(state) {
  console.log("User Update Node");

  return state;
}


async function reviewNode(state) {

  console.log(
    "Review Node"
  );

  const review =
    await reviewAgent.review(state);

  console.log(
    "REVIEW RESULT:"
  );

  console.log(review);

  return {
    review,
    reviewAttempts:
      state.reviewAttempts
  };

}

async function taxAnalysisNode(state) {

  console.log(
    "Tax Analysis Node"
  );

  const income =
    state.filingData.income
      ?.taxableIncome || 0;

  const deductions =
    state.filingData.deductions
      ?.section80C || 0;

  const result =
    await compareRegimesTool.invoke({
      income,
      deductions
    });

    console.log("TAX RESULT:");
    console.log(result);

  return {
    taxAnalysis:
      typeof result === "string"
        ? JSON.parse(result)
        : result
  };

}

async function submissionDecisionNode(state) {

    console.log("Submission Decision Node");

    console.log("submissionAgent =", submissionAgent);
    console.log("typeof =", typeof submissionAgent);
    console.log("submit =", submissionAgent.submit);

    return await submissionAgent.submit(state);

}

async function reviewAgainNode(state) {

  console.log(
    "Review Again Node"
  );

  return {
    reviewAttempts:
      state.reviewAttempts + 1
  };

}

const workflow = new StateGraph(GraphState);

workflow.addNode("extract", extractNode);
workflow.addNode("validate", validateNode);
workflow.addNode("update", updateNode);
workflow.addNode("filing_review", reviewNode);
workflow.addNode("tax_analysis", taxAnalysisNode);
workflow.addNode("submission_decision", submissionDecisionNode);
workflow.addNode("review_again", reviewAgainNode);
workflow.addEdge(START, "extract");
workflow.addEdge("extract", "validate");

workflow.addConditionalEdges(
  "validate",
  (state) => {
    return state.missingFields.length > 0
      ? "update"
      : "tax_analysis";
  },
  {
    update: "update",
    tax_analysis: "tax_analysis"
  }
);

workflow.addEdge("update", "validate");
workflow.addEdge("tax_analysis", "filing_review");
workflow.addConditionalEdges(
  "filing_review",

  (state) => {

    if (
      state.review.confidence < 80 &&
      state.reviewAttempts < 1
    ) {
      return "review_again";
    }
    return "submission_decision";
  },

  {
    review_again:
      "review_again",

    submission_decision:
      "submission_decision"
  }

);
workflow.addEdge("review_again", "filing_review");
workflow.addEdge("submission_decision", END);

const graph = workflow.compile();

module.exports = {graph};