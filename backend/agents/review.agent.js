const { reviewFiling } = require("../services/filingReview.service");

class ReviewAgent {

    validateInput(state) {

        if (!state.filingData) {
            throw new Error("Filing data not found.");
        }

        return true;
    }

    prepareReviewData(state) {

        return {

            income: state.filingData.income,

            deductions: state.filingData.deductions,

            taxPaid: state.filingData.taxPaid,

            taxRegime:
                state.taxAnalysis?.recommended || "unknown",

            personalInfo:
                state.filingData.personal

        };

    }

    async review(state) {

        this.validateInput(state);

        const reviewData =
            this.prepareReviewData(state);

        const review =
            await reviewFiling(reviewData);

        return this.postProcess(review);

    }

    postProcess(review) {

        return {

            ...review,

            reviewedAt:
                new Date().toISOString(),

            reviewedBy:
                "ReviewAgent"

        };

    }

}

module.exports = new ReviewAgent();