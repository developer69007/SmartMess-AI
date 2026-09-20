// models/Feedback.js
const TABLE_NAME = 'feedback';

const computeSentiment = (rating) => {
  if (rating >= 4) return 'Positive';
  if (rating === 3) return 'Neutral';
  return 'Negative';
};

module.exports = { TABLE_NAME, computeSentiment };
