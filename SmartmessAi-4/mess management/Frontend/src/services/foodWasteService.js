import api from "./api";

const foodWasteService = {
  // Staff/Admin: record food waste for a meal
  recordFoodWaste: async (wasteData) => {
    const response = await api.post("/food-waste", wasteData);
    return response.data;
  },

  // Staff/Admin: get today's waste summary + records
  getTodayWaste: async () => {
    const response = await api.get("/food-waste/today");
    return response.data;
  },

  // Admin: get historical waste data
  getWasteHistory: async (days = 7, mealType = "") => {
    const params = { days };
    if (mealType) params.mealType = mealType;
    const response = await api.get("/food-waste/history", { params });
    return response.data;
  },
};

export default foodWasteService;
