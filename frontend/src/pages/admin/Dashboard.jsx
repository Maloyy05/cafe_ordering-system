import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../../services/api';
import toast from 'react-hot-toast';
import StaffManagement from '../../components/admin/StaffManagement';
import formatCurrencyPHP from '../../utils/currency';

const AdminDashboard = () => {
  const [stats, setStats] = useState({ totalSales: 0, orderCount: 0 });
  const [products, setProducts] = useState([]);
  const [productForm, setProductForm] = useState({ name: '', description: '', price: '', stock: '', image_url: '', imageFile: null, status: 'available', id: null });
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [salesRes, productsRes, ordersRes] = await Promise.all([
          API.get('/reports/sales'),
          API.get('/products'),
          API.get('/orders')
        ]);
        // Use sales report for totalSales
        const totalSales = (salesRes.data && salesRes.data.totalSales) ? salesRes.data.totalSales : 0;
        // Use pagination total from /orders for the true all-time order count
        const orderCount = (ordersRes.data && ordersRes.data.pagination) ? ordersRes.data.pagination.total : 0;
        setStats({ totalSales, orderCount });
        setProducts(productsRes.data || []);
      } catch (err) {
        toast.error('Failed to load dashboard data');
      }
    };
    fetchData();
  }, []);

  const handleProductChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'imageFile') {
      return setProductForm({ ...productForm, imageFile: files[0] });
    }
    setProductForm({ ...productForm, [name]: value });
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    
    // Validate that a category is selected
    if (!productForm.category_name) {
      toast.error('Please select a category before saving the product');
      return;
    }

    try {
      let imageUrl = productForm.image_url;

      // If a new image file is provided, upload it first
      if (productForm.imageFile) {
        const formData = new FormData();
        formData.append('image', productForm.imageFile);
        if (editing && productForm.id) formData.append('id', productForm.id);
        const uploadRes = await API.post('/products/upload', formData);
        imageUrl = uploadRes.data.image_url || uploadRes.data.publicUrl || uploadRes.data.image_url;
      }

      // Build payload and only include numeric fields when valid
      const payload = {
        name: productForm.name,
        description: productForm.description || '',
        image_url: imageUrl,
        status: productForm.status,
        category_name: productForm.category_name,
      };

      const parsedPrice = Number(productForm.price);
      if (!Number.isNaN(parsedPrice) && productForm.price !== '') payload.price = parsedPrice;

      const parsedStock = Number(productForm.stock);
      if (!Number.isNaN(parsedStock) && productForm.stock !== '') payload.stock = parsedStock;

      if (editing) {
        const res = await API.put(`/products/${productForm.id}`, payload);
        setProducts((p) => p.map((it) => (it.id === res.data.id ? res.data : it)));
        toast.success('Product updated');
      } else {
        const res = await API.post('/products', payload);
        setProducts((p) => [res.data, ...p]);
        toast.success('Product created');
      }

      setProductForm({ name: '', description: '', price: '', stock: '', image_url: '', status: 'available', category_name: '', id: null });
      setEditing(false);
    } catch (err) {
      console.error('Save product failed', err.response?.data || err.message || err);
      toast.error(err.response?.data?.message || 'Failed to save product');
    }
  };

  const handleEditProduct = (product) => {
    setProductForm({ name: product.name, description: product.description || '', price: product.price || '', stock: product.stock || 0, image_url: product.image_url || '', status: product.status || 'available', category_name: product.categories?.name || '', id: product.id });
    setEditing(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteProduct = async (id) => {
    if (!confirm('Delete this product?')) return;
    try {
      await API.delete(`/products/${id}`);
      setProducts((p) => p.filter((it) => it.id !== id));
      toast.success('Product deleted');
    } catch (err) {
      toast.error('Failed to delete product');
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=DM+Sans:wght@300;400;500;600&display=swap');

        body {
          background: #F8F5F0;
          font-family: 'DM Sans', sans-serif;
        }

        .admin-dashboard {
          min-height: 100vh;
          background: linear-gradient(135deg, #F8F5F0 0%, #F5EFE7 100%);
          padding: 48px 36px;
          font-family: 'DM Sans', sans-serif;
          color: #2B2320;
          position: relative;
          overflow: hidden;
        }

        .admin-dashboard::before {
          content: '';
          position: absolute;
          top: -40%;
          right: -20%;
          width: 600px;
          height: 600px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(31, 77, 58, 0.04) 0%, transparent 70%);
          pointer-events: none;
        }

        .admin-dashboard::after {
          content: '';
          position: absolute;
          bottom: -30%;
          left: -10%;
          width: 500px;
          height: 500px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(45, 80, 22, 0.03) 0%, transparent 70%);
          pointer-events: none;
        }

        .dashboard-header {
          margin-bottom: 48px;
          position: relative;
          z-index: 1;
        }

        .dashboard-header h1 {
          font-family: 'Playfair Display', serif;
          font-size: 42px;
          font-weight: 700;
          color: #1F4D3A;
          letter-spacing: 0.02em;
          margin: 0 0 8px;
          transition: color 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .dashboard-header p {
          font-size: 14px;
          color: #5C524A;
          letter-spacing: 0.05em;
          margin: 0;
          opacity: 0.8;
        }

        .dashboard-nav {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 40px;
          gap: 24px;
          flex-wrap: wrap;
          position: relative;
          z-index: 1;
        }

        .btn-delivery {
          background: linear-gradient(135deg, #1F4D3A, #2D5016);
          border: none;
          border-radius: 10px;
          padding: 12px 24px;
          font-family: 'DM Sans', sans-serif;
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: white;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          box-shadow: 0 8px 20px rgba(31, 77, 58, 0.15);
        }

        .btn-delivery:hover {
          background: linear-gradient(135deg, #162d25, #1F4D3A);
          transform: translateY(-2px);
          box-shadow: 0 12px 32px rgba(31, 77, 58, 0.3);
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
          margin-bottom: 48px;
          position: relative;
          z-index: 1;
        }

        .stat-card {
          background: white;
          border: 1px solid #EBE0D1;
          border-radius: 16px;
          padding: 28px;
          position: relative;
          overflow: hidden;
          box-shadow: 0 8px 28px rgba(31, 77, 58, 0.06);
          transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .stat-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 16px 48px rgba(31, 77, 58, 0.1);
          border-color: rgba(31, 77, 58, 0.2);
        }

        .stat-card::before {
          content: '';
          position: absolute;
          top: -50%;
          right: -50%;
          width: 200px;
          height: 200px;
          background-color: radial-gradient(circle, rgba(31, 77, 58, 0.08) 0%, transparent 70%);
          border-radius: 50%;
          pointer-events: none;
        }

        .stat-content {
          position: relative;
          z-index: 1;
        }

        .stat-label {
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #5C524A;
          margin: 0 0 8px;
        }

        .stat-value {
          font-size: 28px;
          font-weight: 700;
          color: #1F4D3A;
          margin: 0;
          letter-spacing: 0.01em;
          font-family: 'Playfair Display', serif;
        }

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

        .product-form {
          background: white;
          border: 1px solid #EBE0D1;
          border-radius: 16px;
          padding: 32px;
          margin-bottom: 28px;
          box-shadow: 0 8px 28px rgba(31, 77, 58, 0.06);
          transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .product-form:hover {
          box-shadow: 0 12px 40px rgba(31, 77, 58, 0.08);
          border-color: rgba(31, 77, 58, 0.15);
        }

        .product-form h3 {
          font-family: 'Playfair Display', serif;
          font-size: 18px;
          color: #1F4D3A;
          margin: 0 0 20px;
          font-weight: 700;
          letter-spacing: 0.01em;
        }

        .form-wrapper {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
          align-items: end;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .form-label {
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #5C524A;
        }

        .form-input,
        .form-select {
          background: white;
          border: 1px solid #EBE0D1;
          border-radius: 10px;
          padding: 12px 14px;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          color: #2B2320;
          outline: none;
          transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
          width: 100%;
          box-sizing: border-box;
        }

        .form-input:focus,
        .form-select:focus {
          border-color: #1F4D3A;
          box-shadow: 0 0 0 3px rgba(31, 77, 58, 0.1);
          background: #FFFBF8;
        }

        .form-input::placeholder {
          color: #9E9280;
        }

        .form-buttons {
          display: flex;
          gap: 12px;
          justify-content: flex-end;
        }

        .btn-submit,
        .btn-cancel {
          padding: 12px 24px;
          border-radius: 10px;
          font-family: 'DM Sans', sans-serif;
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          cursor: pointer;
          border: none;
          transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .btn-submit {
          background: linear-gradient(135deg, #1F4D3A, #2D5016);
          color: white;
          box-shadow: 0 8px 20px rgba(31, 77, 58, 0.15);
        }

        .btn-submit:hover {
          background: linear-gradient(135deg, #162d25, #1F4D3A);
          transform: translateY(-2px);
          box-shadow: 0 12px 32px rgba(31, 77, 58, 0.3);
        }

        .btn-submit:active {
          transform: translateY(0);
        }

        .btn-cancel {
          background: #EBE0D1;
          color: #1F4D3A;
          border: 1px solid #D5C5B8;
        }

        .btn-cancel:hover {
          background: #E0D0C3;
          border-color: #1F4D3A;
        }

        .table-responsive {
          width: 100%;
          overflow-x: auto;
          border-radius: 16px;
          box-shadow: 0 8px 28px rgba(31, 77, 58, 0.06);
          border: 1px solid #EBE0D1;
          background: white;
        }

        .admin-table {
          width: 100%;
          min-width: 600px;
          border-collapse: collapse;
        }

        .admin-table thead {
          background: linear-gradient(135deg, rgba(31, 77, 58, 0.04) 0%, rgba(31, 77, 58, 0.02) 100%);
          border-bottom: 1px solid #EBE0D1;
        }

        .admin-table th {
          padding: 16px;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #1F4D3A;
          text-align: left;
        }

        .admin-table td {
          padding: 16px;
          font-size: 14px;
          color: #2B2320;
          border-bottom: 1px solid #EBE0D1;
        }

        .admin-table tbody tr:hover {
          background: linear-gradient(135deg, rgba(31, 77, 58, 0.02) 0%, transparent 100%);
        }

        .table-actions {
          display: flex;
          gap: 8px;
        }

        .btn-edit,
        .btn-delete {
          padding: 8px 14px;
          border: 1px solid #1F4D3A;
          border-radius: 8px;
          font-family: 'DM Sans', sans-serif;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
          background: white;
        }

        .btn-edit {
          color: #1F4D3A;
          border-color: #1F4D3A;
        }

        .btn-edit:hover {
          background: #1F4D3A;
          color: white;
          box-shadow: 0 6px 16px rgba(31, 77, 58, 0.2);
        }

        .btn-delete {
          color: #C0392B;
          border-color: #C0392B;
        }

        .btn-delete:hover {
          background: #C0392B;
          color: white;
          box-shadow: 0 6px 16px rgba(192, 57, 43, 0.2);
        }

        .empty-state {
          text-align: center;
          padding: 48px 24px;
          color: #5C524A;
          font-size: 14px;
          background: white;
          border: 1px solid #EBE0D1;
          border-radius: 16px;
          box-shadow: 0 8px 28px rgba(31, 77, 58, 0.06);
        }

        @media (max-width: 768px) {
          .admin-dashboard { 
            padding: 24px 16px; 
          }
          .stats-grid { 
            grid-template-columns: 1fr; 
          }
          .dashboard-header h1 { 
            font-size: 32px; 
          }
          .form-wrapper { 
            grid-template-columns: 1fr; 
          }
          .btn-delivery { 
            width: 100%; 
            justify-content: center; 
          }
        }
      `}</style>

      <div className="admin-dashboard">
        <div className="dashboard-header">
          <div>
            <h1>Admin Dashboard</h1>
            <p>Manage your café operations and inventory</p>
          </div>
        </div>

        <div className="dashboard-nav">
          <div></div>
          <Link to="/admin/deliveries" className="btn-delivery">
            🚚 Delivery Orders
          </Link>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-content">
              <p className="stat-label">Total Sales</p>
              <p className="stat-value">{formatCurrencyPHP(stats.totalSales)}</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-content">
              <p className="stat-label">Total Orders</p>
              <p className="stat-value">{stats.orderCount}</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-content">
              <p className="stat-label">Total Products</p>
              <p className="stat-value">{products.length}</p>
            </div>
          </div>
        </div>

        <section className="admin-section">
          <h2>Product Management</h2>
          <p>Add, edit, and manage your product inventory</p>

          <form className="product-form" onSubmit={handleProductSubmit}>
            <h3>{editing ? 'Edit Product' : 'Add New Product'}</h3>
            <div className="form-wrapper">
              <div className="form-group">
                <label className="form-label">Product Name</label>
                <input 
                  type="text"
                  name="name" 
                  placeholder="Enter name" 
                  value={productForm.name} 
                  onChange={handleProductChange} 
                  className="form-input"
                  required 
                />
              </div>

              <div className="form-group">
                <label className="form-label">Price</label>
                <input 
                  type="number"
                  name="price" 
                  placeholder="0.00" 
                  value={productForm.price} 
                  onChange={handleProductChange}
                  step="0.01"
                  className="form-input"
                  required 
                />
              </div>

              <div className="form-group">
                <label className="form-label">Stock</label>
                <input 
                  type="number"
                  name="stock" 
                  placeholder="0" 
                  value={productForm.stock} 
                  onChange={handleProductChange}
                  className="form-input"
                  required 
                />
              </div>

              <div className="form-group">
                <label className="form-label">Status</label>
                <select 
                  name="status" 
                  value={productForm.status} 
                  onChange={handleProductChange}
                  className="form-select"
                >
                  <option value="available">Available</option>
                  <option value="out_of_stock">Out of Stock</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Category</label>
                <select 
                  name="category_name" 
                  value={productForm.category_name || ''} 
                  onChange={handleProductChange}
                  className="form-select"
                  required
                >
                  <option value="">Select Category</option>
                  <option value="Coffee">Coffee</option>
                  <option value="Cookies">Cookies</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Image</label>
                <input 
                  type="file" 
                  name="imageFile" 
                  accept="image/*" 
                  onChange={handleProductChange}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <input 
                  type="text"
                  name="description" 
                  placeholder="Enter description" 
                  value={productForm.description} 
                  onChange={handleProductChange}
                  className="form-input"
                />
              </div>
            </div>

            <div className="form-buttons" style={{marginTop: '24px'}}>
              {editing && (
                <button 
                  type="button" 
                  className="btn-cancel"
                  onClick={() => { 
                    setEditing(false); 
                    setProductForm({ name: '', description: '', price: '', stock: '', image_url: '', imageFile: null, status: 'available', category_name: '', id: null }); 
                  }}
                >
                  Cancel
                </button>
              )}
              <button type="submit" className="btn-submit">
                {editing ? '✏️ Update Product' : '➕ Create Product'}
              </button>
            </div>
          </form>

          {products.length > 0 ? (
            <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map(product => (
                  <tr key={product.id}>
                    <td>{product.name}</td>
                    <td>{formatCurrencyPHP(product.price)}</td>
                    <td>{product.stock}</td>
                    <td style={{color: product.status === 'available' ? '#51cf66' : '#ff6b6b'}}>{product.status}</td>
                    <td>
                      <div className="table-actions">
                        <button 
                          className="btn-edit"
                          onClick={() => handleEditProduct(product)}
                          type="button"
                        >
                          Edit
                        </button>
                        <button 
                          className="btn-delete"
                          onClick={() => handleDeleteProduct(product.id)}
                          type="button"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          ) : (
            <div className="empty-state">
              No products yet. Add one to get started!
            </div>
          )}
        </section>

        <StaffManagement />
      </div>
    </>
  );
};

export default AdminDashboard;
