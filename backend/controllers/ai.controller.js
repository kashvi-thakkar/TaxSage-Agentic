let askTaxAI;
try {
  const groqService = require("../services/groq.service");
  askTaxAI = groqService.askTaxAI;
  console.log("✅ Groq service loaded successfully");
} catch (error) {
  console.error("❌ Failed to load Groq service:", error.message);
  askTaxAI = async (message, history) => {
    return `I'm a tax assistant. For the question: "${message}"\n\nPlease contact our support team or check back later as our AI service is being configured.`;
  };
}

const chatController = async (req, res) => {
  try {
    const { message, history } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        message: "Message is required"
      });
    }

    console.log("AI Chat Request:", message);

    // Use userId from authenticated JWT (req.user guaranteed by protect middleware)
    const sessionId = req.user._id.toString();

    const response = await askTaxAI(
      message,
      sessionId
    );

    res.json({
      success: true,
      response: response
    });

  } catch (error) {
    console.error("AI Chat Error:", error);
    res.status(500).json({
      success: false,
      message: "AI service failed",
      error: error.message
    });
  }
};

module.exports = {
  chatController
};