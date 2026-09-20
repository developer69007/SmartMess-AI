import api from "./api";

const leaveService = {
  // Student: apply for mess leave
  applyLeave: async (leaveData) => {
    const response = await api.post("/leave", leaveData);
    return response.data;
  },

  // Student: get own leave requests
  getMyLeaveRequests: async () => {
    const response = await api.get("/leave/my");
    return response.data;
  },

  // Admin: get all leave requests with optional status filter
  getAllLeaveRequests: async (params = {}) => {
    const response = await api.get("/leave", { params });
    return response.data;
  },

  // Admin: approve or reject a leave request
  updateLeaveStatus: async (id, status, rejectionReason = "") => {
    const response = await api.put(`/leave/${id}`, { status, rejectionReason });
    return response.data;
  },
};

export default leaveService;
