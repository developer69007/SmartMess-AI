import api from "./api";

const menuService = {
  getTodaysMenu: async () => {
    const response = await api.get("/menu/today");
    return response.data;
  },

  getWeeklyMenu: async () => {
    const response = await api.get("/menu/week");
    return response.data;
  },

  updateMenu: async (id, meals) => {
    const response = await api.put(`/menu/${id}`, { meals });
    return response.data;
  },
  
  createMenu: async (menuData) => {
    const response = await api.post("/menu", menuData);
    return response.data;
  }
};

export default menuService;
