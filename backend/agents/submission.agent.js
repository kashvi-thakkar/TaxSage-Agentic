class SubmissionAgent {

    async submit(state) {

        return {
            readyToSubmit:
                state.review.confidence >= 80 &&
                state.missingFields.length === 0
        };

    }

}

module.exports = new SubmissionAgent();