const supabase = require('../config/supabase');
const bcrypt = require('bcryptjs');

const getStaff = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, name, username, role, created_at')
      .eq('role', 'staff');
    if (error) throw error;
    res.json(data);
  } catch (err) {
    next(err);
  }
};

const createStaff = async (req, res, next) => {
  const { name, username, password } = req.body;
  // Ensure server has sufficient Supabase privileges for inserts
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY && !process.env.SUPABASE_ANON_KEY) {
    return res.status(500).json({ message: 'Supabase keys are not configured on the server. Set SUPABASE_SERVICE_ROLE_KEY in .env.' });
  }
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const { data, error } = await supabase
      .from('users')
      .insert([{ name, username, password: hashedPassword, role: 'staff' }])
      .select('id, name, username, role, created_at');
    if (error) throw error;
    res.status(201).json(data[0]);
  } catch (err) {
    // If supabase returned an error, normalize it to a readable message
    const message = err?.message || err?.error_description || 'Failed to create staff';
    return res.status(500).json({ message });
  }
};

const deleteStaff = async (req, res, next) => {
  try {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', req.params.id);
    if (error) throw error;
    res.json({ message: 'Staff deleted' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getStaff, createStaff, deleteStaff };
