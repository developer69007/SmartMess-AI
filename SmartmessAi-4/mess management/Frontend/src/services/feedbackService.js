import api from "./api";

const feedbackService = {
  submitFeedback: async (feedbackData) => {
    const response = await api.post("/feedback", feedbackData);
    return response.data;
  },

  getMyFeedback: async () => {
    const response = await api.get("/feedback/my");
    return response.data;
  },

  getAllFeedback: async (params = {}) => {
    const response = await api.get("/feedback", { params });
    return response.data;
  },

  getFeedbackAnalytics: async () => {
    const response = await api.get("/feedback/analytics");
    return response.data;
  },
};

export default feedbackService;
