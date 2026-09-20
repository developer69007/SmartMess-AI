import api from "./api";

const aiService = {
  // Get AI-powered meal & ingredient recommendations
  getRecommendations: async () => {
    const response = await api.post("/ai/recommend", {});
    return response.data;
  },

  // Predict attendance for a given date
  predictAttendance: async (date) => {
    const response = await api.post("/ai/predict", { date });
    return response.data;
  },

  // Chat with AI assistant
  chat: async (message) => {
    const response = await api.post("/ai/chat", { message });
    return response.data;
  },
};

export default aiService;
