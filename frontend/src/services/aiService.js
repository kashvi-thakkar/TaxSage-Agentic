class AIService {
  async sendMessage(message) {
    try {
      const response = await fetch("http://localhost:5001/api/ai/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ 
          message: message
        })
      });

      const data = await response.json();

      if (data.success) {
        return data.response;
      } else {
        throw new Error(data.message || "AI service error");
      }
    } catch (error) {
      console.error("AI Chat Error:", error);
      return "Sorry, the AI assistant is currently unavailable. Please try again later or contact our support team.";
    }
  }
}

export default new AIService();