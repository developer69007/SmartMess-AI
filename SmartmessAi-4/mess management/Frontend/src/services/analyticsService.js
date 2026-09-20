import api from "./api";

const analyticsService = {
  getAdminDashboardStats: async () => {
    const response = await api.get("/analytics/dashboard");
    return response.data;
  },

  getStaffDashboardStats: async () => {
    const response = await api.get("/analytics/staff-stats");
    return response.data;
  },

  getAttendanceTrend: async (days = 7) => {
    const response = await api.get(`/analytics/attendance-trend?days=${days}`);
    return response.data;
  },

  getMealDistribution: async () => {
    const response = await api.get("/analytics/meal-distribution");
    return response.data;
  },

  getFeedbackSummary: async () => {
    const response = await api.get("/analytics/feedback-summary");
    return response.data;
  },
};

export default analyticsService;
