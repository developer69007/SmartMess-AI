import api from "./api";

const complaintService = {
  // Student: raise a new complaint
  raiseComplaint: async (complaintData) => {
    const response = await api.post("/complaints", complaintData);
    return response.data;
  },

  // Student: get own complaints
  getMyComplaints: async () => {
    const response = await api.get("/complaints/my");
    return response.data;
  },

  // Admin: get all complaints with optional filters
  getAllComplaints: async (params = {}) => {
    const response = await api.get("/complaints", { params });
    return response.data;
  },

  // Admin: update complaint status / add response
  updateComplaint: async (id, updateData) => {
    const response = await api.put(`/complaints/${id}`, updateData);
    return response.data;
  },

  // Admin: delete a complaint
  deleteComplaint: async (id) => {
    const response = await api.delete(`/complaints/${id}`);
    return response.data;
  },
};

export default complaintService;
