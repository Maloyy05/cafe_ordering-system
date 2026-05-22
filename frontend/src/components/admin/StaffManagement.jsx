import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import toast from 'react-hot-toast';

const StaffManagement = () => {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: '', username: '', password: '' });

  const fetchStaff = async () => {
    setLoading(true);
    try {
      const res = await API.get('/staff');
      setStaff(res.data || []);
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to load staff list';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.name || !form.username || !form.password) return toast.error('Fill all fields');
    try {
      const res = await API.post('/staff', form);
      setStaff((s) => [res.data, ...s]);
      setForm({ name: '', username: '', password: '' });
      toast.success('Staff created');
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to create staff';
      toast.error(msg);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this staff member?')) return;
    try {
      await API.delete(`/staff/${id}`);
      setStaff((s) => s.filter((p) => p.id !== id));
      toast.success('Staff deleted');
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to delete staff';
      toast.error(msg);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=DM+Sans:wght@300;400;500;600&display=swap');

        .admin-section { 
          margin-bottom: 48px;
          position: relative;
          z-index: 1;
        }

        .admin-section h2 { 
          font-family: 'Playfair Display', serif;
          font-size: 28px;
          font-weight: 700;
          color: #1F4D3A;
          letter-spacing: 0.02em;
          margin: 0 0 12px;
          transition: color 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .admin-section p {
          font-size: 14px;
          color: #5C524A;
          letter-spacing: 0.05em;
          margin: 0 0 28px;
          opacity: 0.8;
        }

        .staff-grid { 
          display: grid;
          grid-template-columns: 320px 1fr;
          gap: 24px;
        }

        .staff-form { 
          background: white;
          padding: 28px;
          border-radius: 16px;
          border: 1px solid #EBE0D1;
          box-shadow: 0 8px 28px rgba(31, 77, 58, 0.06);
          transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .staff-form:hover {
          box-shadow: 0 12px 40px rgba(31, 77, 58, 0.08);
          border-color: rgba(31, 77, 58, 0.15);
        }

        .staff-form h3 { 
          margin: 0 0 20px 0;
          color: #1F4D3A;
          font-family: 'Playfair Display', serif;
          font-size: 18px;
          font-weight: 700;
        }

        .staff-form .form-group { 
          margin-bottom: 16px;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .staff-form label { 
          font-size: 11px;
          color: #5C524A;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          font-weight: 600;
        }

        .staff-form input { 
          padding: 12px 14px;
          border-radius: 10px;
          background: white;
          border: 1px solid #EBE0D1;
          color: #2B2320;
          width: 100%;
          box-sizing: border-box;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .staff-form input::placeholder { 
          color: #9E9280;
        }

        .staff-form input:focus { 
          border-color: #1F4D3A;
          box-shadow: 0 0 0 3px rgba(31, 77, 58, 0.1);
          background: #FFFBF8;
          outline: none;
        }

        /* Override browser autofill (Chrome/Safari) */
        input:-webkit-autofill,
        input:-webkit-autofill:focus,
        input:-webkit-autofill:hover,
        textarea:-webkit-autofill,
        textarea:-webkit-autofill:focus {
          -webkit-text-fill-color: #2B2320 !important;
          -webkit-box-shadow: 0 0 0px 1000px white inset !important;
          box-shadow: 0 0 0px 1000px white inset !important;
        }

        .btn-primary { 
          padding: 12px 24px;
          background: linear-gradient(135deg, #1F4D3A, #2D5016);
          color: white;
          border: none;
          border-radius: 10px;
          cursor: pointer;
          margin-top: 8px;
          font-family: 'DM Sans', sans-serif;
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
          box-shadow: 0 8px 20px rgba(31, 77, 58, 0.15);
          width: 100%;
        }

        .btn-primary:hover {
          background: linear-gradient(135deg, #162d25, #1F4D3A);
          transform: translateY(-2px);
          box-shadow: 0 12px 32px rgba(31, 77, 58, 0.3);
        }

        .btn-primary:active {
          transform: translateY(0);
        }

        .staff-list { 
          background: white;
          padding: 28px;
          border-radius: 16px;
          border: 1px solid #EBE0D1;
          overflow-x: auto;
          box-shadow: 0 8px 28px rgba(31, 77, 58, 0.06);
        }

        .staff-list h3 {
          margin: 0 0 20px 0;
          color: #1F4D3A;
          font-family: 'Playfair Display', serif;
          font-size: 18px;
          font-weight: 700;
        }

        .admin-table { 
          width: 100%;
          min-width: 500px;
          border-collapse: collapse;
        }

        .admin-table th { 
          padding: 14px;
          text-align: left;
          border-bottom: 1px solid #EBE0D1;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #1F4D3A;
          background: linear-gradient(135deg, rgba(31, 77, 58, 0.04) 0%, rgba(31, 77, 58, 0.02) 100%);
        }

        .admin-table td { 
          padding: 14px;
          text-align: left;
          border-bottom: 1px solid #EBE0D1;
          color: #2B2320;
          font-size: 14px;
        }

        .admin-table tbody tr:hover {
          background: linear-gradient(135deg, rgba(31, 77, 58, 0.02) 0%, transparent 100%);
        }

        .btn-danger { 
          padding: 8px 14px;
          background: white;
          color: #C0392B;
          border: 1px solid #C0392B;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          font-family: 'DM Sans', sans-serif;
          font-size: 11px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .btn-danger:hover {
          background: #C0392B;
          color: white;
          box-shadow: 0 6px 16px rgba(192, 57, 43, 0.2);
        }

        @media (max-width: 900px) { 
          .staff-grid { 
            grid-template-columns: 1fr;
            gap: 24px;
          }
        }

        @media (max-width: 640px) { 
          .staff-form { 
            padding: 20px;
          }
          .staff-list {
            padding: 20px;
          }
        }
      `}</style>

      <section className="admin-section">
        <h2>Staff Management</h2>

        <div className="staff-grid">
          <form className="staff-form" onSubmit={handleCreate}>
            <h3>Add Staff</h3>
            <div className="form-group">
              <label>Name</label>
              <input name="name" value={form.name} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Username</label>
              <input name="username" value={form.username} onChange={handleChange} type="text" />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input name="password" value={form.password} onChange={handleChange} type="password" />
            </div>
            <button className="btn-primary" type="submit">Create Staff</button>
          </form>

          <div className="staff-list">
            <h3>Existing Staff</h3>
            {loading ? (
              <p>Loading...</p>
            ) : (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Username</th>
                    <th>Role</th>
                    <th>Created</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {staff.map((s) => (
                    <tr key={s.id}>
                      <td>{s.name}</td>
                      <td>{s.username}</td>
                      <td>{s.role}</td>
                      <td>{new Date(s.created_at).toLocaleString()}</td>
                      <td>
                        <button className="btn-danger" onClick={() => handleDelete(s.id)}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </section>
    </>
  );
};

export default StaffManagement;
