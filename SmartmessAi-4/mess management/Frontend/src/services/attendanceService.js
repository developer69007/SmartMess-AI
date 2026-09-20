import api from "./api";

const attendanceService = {
  markAttendance: async (mealType, qrToken) => {
    const response = await api.post("/attendance/scan", { mealType, qrToken });
    return response.data;
  },

  getMyAttendance: async () => {
    const response = await api.get("/attendance/my");
    return response.data;
  },

  getDailyAttendance: async (mealType = "") => {
    const query = mealType ? `?mealType=${mealType}` : "";
    const response = await api.get(`/attendance/daily${query}`);
    return response.data;
  },

  verifyQRAttendance: async (qrToken, mealType = "") => {
    const query = mealType ? `?mealType=${mealType}` : "";
    const response = await api.get(`/attendance/verify/${qrToken}${query}`);
    return response.data;
  },
};

export default attendanceService;
