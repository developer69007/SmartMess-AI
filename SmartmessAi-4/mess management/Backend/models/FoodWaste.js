// models/FoodWaste.js
const TABLE_NAME = 'food_waste';

const computeWastePercentage = (totalPreparedKg, wasteKg) => {
  if (totalPreparedKg > 0) {
    return parseFloat(((wasteKg / totalPreparedKg) * 100).toFixed(2));
  }
  return 0;
};

module.exports = { TABLE_NAME, computeWastePercentage };
