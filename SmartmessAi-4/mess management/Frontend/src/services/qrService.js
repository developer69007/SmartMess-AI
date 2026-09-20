/**
 * qrService.js
 * Handles QR code token generation and attendance verification via backend.
 */
import api from "./api";

const qrService = {
  /**
   * Student: generate a QR attendance token
   * Calls POST /api/attendance/scan with meal type
   */
  generateQRToken: async (mealType = "lunch") => {
    const response = await api.post("/attendance/scan", { mealType });
    return response.data;
  },

  /**
   * Staff: verify a student's QR token and mark attendance
   * Calls GET /api/attendance/verify/:qrToken
   */
  verifyQRToken: async (qrToken) => {
    const response = await api.get(`/attendance/verify/${qrToken}`);
    return response.data;
  },
};

export default qrService;
