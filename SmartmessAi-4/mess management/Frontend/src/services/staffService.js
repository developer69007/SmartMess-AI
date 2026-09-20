import api from "./api";

const staffService = {
  // Admin: get all staff members
  getAllStaff: async () => {
    const response = await api.get("/admin/staff");
    return response.data;
  },

  // Admin: create a new staff member
  createStaff: async (staffData) => {
    const response = await api.post("/admin/staff", staffData);
    return response.data;
  },

  // Admin: update a staff member
  updateStaff: async (id, staffData) => {
    const response = await api.put(`/admin/staff/${id}`, staffData);
    return response.data;
  },

  // Admin: delete a staff member
  deleteStaff: async (id) => {
    const response = await api.delete(`/admin/staff/${id}`);
    return response.data;
  },

  // Staff: get own profile
  getStaffProfile: async () => {
    const response = await api.get("/staff/profile");
    return response.data;
  },

  // Staff: update own profile
  updateStaffProfile: async (profileData) => {
    const response = await api.put("/staff/profile", profileData);
    return response.data;
  },

  // Staff: get dashboard stats
  getStaffDashboardStats: async () => {
    const response = await api.get("/staff/dashboard-stats");
    return response.data;
  },

  // Staff/Admin: get today's kitchen status
  // Route: GET /api/staff/kitchen-status
  getKitchenStatus: async () => {
    const response = await api.get("/staff/kitchen-status");
    return response.data;
  },

  // Staff/Admin: update kitchen status
  // Route: PUT /api/staff/kitchen-status
  updateKitchenStatus: async (statusData) => {
    const response = await api.put("/staff/kitchen-status", statusData);
    return response.data;
  },
};

export default staffService;
