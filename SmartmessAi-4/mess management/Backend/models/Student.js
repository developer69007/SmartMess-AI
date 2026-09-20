// models/Student.js
// Supabase helper for the students table.

const bcrypt = require('bcryptjs');

const TABLE_NAME = 'students';

const hashPassword = async (password) => {
  return bcrypt.hash(password, 10);
};

const comparePassword = async (candidatePassword, hashedPassword) => {
  return bcrypt.compare(candidatePassword, hashedPassword);
};

// Strip password from a student object for API responses
const sanitize = (student) => {
  if (!student) return null;
  const { password, ...safe } = student;
  return safe;
};

module.exports = { TABLE_NAME, hashPassword, comparePassword, sanitize };