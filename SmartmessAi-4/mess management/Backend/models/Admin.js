// models/Admin.js
// Supabase helper for the admins table.

const bcrypt = require('bcryptjs');

const TABLE_NAME = 'admins';

const hashPassword = async (password) => {
  return bcrypt.hash(password, 10);
};

const comparePassword = async (candidatePassword, hashedPassword) => {
  return bcrypt.compare(candidatePassword, hashedPassword);
};

const sanitize = (admin) => {
  if (!admin) return null;
  const { password, ...safe } = admin;
  return safe;
};

module.exports = { TABLE_NAME, hashPassword, comparePassword, sanitize };
