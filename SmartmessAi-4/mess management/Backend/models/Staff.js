// models/Staff.js
// Supabase helper for the staff table.

const bcrypt = require('bcryptjs');

const TABLE_NAME = 'staff';

const hashPassword = async (password) => {
  return bcrypt.hash(password, 10);
};

const comparePassword = async (candidatePassword, hashedPassword) => {
  return bcrypt.compare(candidatePassword, hashedPassword);
};

const sanitize = (staffMember) => {
  if (!staffMember) return null;
  const { password, ...safe } = staffMember;
  return safe;
};

module.exports = { TABLE_NAME, hashPassword, comparePassword, sanitize };
