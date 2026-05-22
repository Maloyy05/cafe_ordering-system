import React, { useState, useEffect, useContext } from 'react';
import API from '../../services/api';
import toast from 'react-hot-toast';
import { AuthContext } from '../../context/AuthContext';
import formatCurrencyPHP from '../../utils/currency';

const DeliveryOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({ payment_status: 'all', status: 'all', q: '' });
  const [selectedProof, setSelectedProof] = useState(null);
  const [updatingIds, setUpdatingIds] = useState([]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await API.get('/orders');
      const payload = res.data;
      let data = Array.isArray(payload) ? payload : (payload && payload.data) ? payload.data : [];
      // filter for Delivery
      data = data.filter(o => o.order_type === 'Delivery');

      // Apply filters
      if (filters.payment_status !== 'all') data = data.filter(o => (o.payment_status || '') === filters.payment_status);
      if (filters.status !== 'all') data = data.filter(o => (o.status || '') === filters.status);
      if (filters.q) {
        const q = filters.q.toLowerCase();
        data = data.filter(o => (o.order_number || '').toLowerCase().includes(q) || (o.customer_name || '').toLowerCase().includes(q));
      }

      setOrders(data);
    } catch (err) {
      const status = err?.response?.status;
      if (status === 401) {
        toast.error('Unauthorized. Please log in as admin/staff.');
      } else {
        toast.error('Failed to load delivery orders');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    const iv = setInterval(fetchOrders, 30000);
    // Listen for order updates from other tabs (e.g. staff marking Out for Delivery)
    const onStorage = (e) => {
      if (!e) return;
      try {
        if (e.key === 'order_update') {
          // refresh orders to reflect changes made elsewhere
          fetchOrders();
        }
      } catch (err) {
        // ignore
      }
    };
    window.addEventListener('storage', onStorage);
    return () => clearInterval(iv);
    // cleanup storage listener
    // (note: returning a single cleanup; ensure listener removal)
  }, [filters]);

  // remove storage listener on unmount
  useEffect(() => {
    const onStorage = (e) => {
      if (!e) return;
      try {
        if (e.key === 'order_update') fetchOrders();
      } catch (err) {}
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const handleVerify = async (orderId) => {
    try {
      await API.put(`/orders/${orderId}/payment`, { payment_status: 'Paid' });
      toast.success('Payment marked Paid');
      fetchOrders();
    } catch (err) {
      toast.error('Failed to verify payment');
    }
  };

  const handleReject = async (orderId) => {
    try {
      await API.put(`/orders/${orderId}/payment`, { payment_status: 'Rejected' });
      toast.success('Payment marked Rejected');
      fetchOrders();
    } catch (err) {
      toast.error('Failed to reject payment');
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    let prevStatus = null;
    try {
      prevStatus = (orders.find(o => o.id === orderId) || {}).status;
      // Optimistically update local orders state so UI updates immediately
      setOrders(prev => prev.map(o => o.id === orderId ? ({ ...o, status: newStatus }) : o));
      // mark updating
      setUpdatingIds(prev => Array.from(new Set([...prev, orderId])));
      // call API and apply returned order object to keep full state in sync
      const res = await API.put(`/orders/${orderId}/status`, { status: newStatus });
      const updatedOrder = res?.data;
      if (updatedOrder) {
        setOrders(prev => prev.map(o => o.id === orderId ? ({ ...o, ...updatedOrder }) : o));
      }
      toast.success('Order status updated');
      // still refresh in background
      fetchOrders();
    } catch (err) {
      // Check if payment verification is required
      if (err?.response?.data?.requires_verification) {
        toast.error('Payment must be verified before preparing order');
      } else {
        toast.error('Failed to update status');
      }
      if (prevStatus !== null) {
        setOrders(prev => prev.map(o => o.id === orderId ? ({ ...o, status: prevStatus }) : o));
      }
    } finally {
      setUpdatingIds(prev => prev.filter(id => id !== orderId));
    }
  };

  const allowedTransitions = {
    Pending: ['Preparing', 'Cancelled'],
    Preparing: ['Ready for Pickup', 'Served', 'Out for Delivery', 'Cancelled'],
    'Ready for Pickup': ['Completed', 'Cancelled'],
    'Served': ['Completed', 'Cancelled'],
    'Out for Delivery': ['Delivered'],
    Delivered: ['Completed'],
    Completed: [],
    Cancelled: []
  };

  const { user } = useContext(AuthContext);

  const statusOptionsFor = (order) => {
    const next = allowedTransitions[order.status] || [];
    // include current status as first option so select shows it
    const opts = [order.status, ...next.filter(s => s !== order.status)];
    return opts;
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=DM+Sans:wght@300;400;500;600&display=swap');

        .admin-section { min-height: calc(100vh - 72px); padding: 28px 36px; background: #F8F5F0; color: #2B2320; font-family: 'DM Sans', sans-serif; }
        .admin-section h2 { font-family: 'Playfair Display', serif; color: #1F4D3A; margin-bottom:28px; font-size: 32px; }

        /* Modern Filter Bar */
        .admin-filters { 
          background: white; 
          padding: 20px 24px; 
          border-radius: 16px; 
          margin-bottom: 28px; 
          display: flex; 
          align-items: center; 
          gap: 16px; 
          flex-wrap: wrap;
          box-shadow: 0 8px 24px rgba(31, 77, 58, 0.08);
          border: 1px solid rgba(31, 77, 58, 0.05);
        }

        .filter-group {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
          flex: 1;
          min-width: 240px;
        }

        .filter-label {
          font-size: 13px;
          font-weight: 600;
          color: #6B6B6B;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          white-space: nowrap;
        }

        .admin-filters select,
        .admin-filters input {
          padding: 12px 16px;
          border-radius: 12px;
          background: #FAFAFA;
          border: 1.5px solid #EBE0D1;
          color: #2B2320;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          font-weight: 500;
          transition: all 0.2s ease;
          flex: 1;
          min-width: 160px;
          box-sizing: border-box;
        }

        .admin-filters select:hover,
        .admin-filters input:hover {
          border-color: #1F4D3A;
          background: #FFFFFF;
          box-shadow: 0 4px 12px rgba(31, 77, 58, 0.06);
        }

        .admin-filters select:focus,
        .admin-filters input:focus {
          outline: none;
          border-color: #1F4D3A;
          background: #FFFFFF;
          box-shadow: 0 6px 20px rgba(31, 77, 58, 0.12);
        }

        .admin-filters input::placeholder {
          color: #B0A89A;
          font-weight: 400;
        }

        .filter-actions { 
          display: flex; 
          gap: 12px;
          align-items: center;
          margin-left: auto;
          flex-wrap: wrap;
        }

        /* Buttons */
        .btn-primary { 
          padding: 12px 20px; 
          background: linear-gradient(135deg, #1F4D3A 0%, #2D5016 100%); 
          border: none; 
          border-radius: 12px; 
          color: white; 
          cursor: pointer; 
          font-weight: 600;
          font-size: 14px;
          box-shadow: 0 8px 20px rgba(31, 77, 58, 0.15);
          transition: all 0.3s ease;
          white-space: nowrap;
        }

        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 28px rgba(31, 77, 58, 0.2);
        }

        .btn-primary:active {
          transform: translateY(0);
          box-shadow: 0 6px 12px rgba(31, 77, 58, 0.15);
        }

        .btn-ghost { 
          padding: 10px 14px; 
          background: #FAFAFA; 
          border: 1.5px solid #EBE0D1; 
          border-radius: 10px; 
          color: #2B2320; 
          cursor: pointer;
          font-weight: 600;
          font-size: 13px;
          transition: all 0.2s ease;
        }

        .btn-ghost:hover {
          background: white;
          border-color: #1F4D3A;
          color: #1F4D3A;
          box-shadow: 0 4px 12px rgba(31, 77, 58, 0.08);
        }

        .btn-danger { 
          padding: 10px 14px; 
          background: #FFF5F5; 
          border: 1.5px solid #F2B5B5; 
          border-radius: 10px; 
          color: #C0392B; 
          cursor: pointer;
          font-weight: 600;
          font-size: 13px;
          transition: all 0.2s ease;
        }

        .btn-danger:hover {
          background: #FFE8E8;
          border-color: #E07070;
          box-shadow: 0 4px 12px rgba(192, 57, 43, 0.08);
        }

        /* Orders grid and card */
        .orders-list { display:grid; grid-template-columns: repeat(auto-fill, minmax(360px, 1fr)); gap:18px; }
        .order-card { background: white; border:1px solid #EBE0D1; padding:18px; border-radius:14px; display:flex; flex-direction:column; gap:12px; box-shadow: 0 10px 30px rgba(31,77,58,0.04); }

        .order-head { display:flex; align-items:flex-start; justify-content:space-between; gap:12px; }
        .order-meta { display:flex; flex-direction:column; gap:6px; }
        .order-number { font-family: 'Playfair Display', serif; color: #1F4D3A; font-size:18px; font-weight:700; }
        .order-time { font-size:12px; color:#6B6B6B; }

        .badge { padding:6px 10px; border-radius:999px; font-weight:700; font-size:12px; display:inline-block; text-transform:capitalize; }
        .badge.pending { background:#FFF7E6; color:#C47A00; border:1px solid #F4E1C1; }
        .badge.preparing { background:#E9F7EF; color:#1F7A3A; border:1px solid #CFEFD9; }
        .badge.out { background:#E8F8FF; color:#0B6A8B; border:1px solid #CDEDF6; }
        .badge.delivered { background:#F0FFF4; color:#086A2E; border:1px solid #DFF1DF; }
        .badge.cancelled { background:#FFF5F5; color:#B02A2A; border:1px solid #F5DADA; }

        .order-body { display:flex; gap:12px; flex-direction:column; }
        .items-list { display:flex; flex-direction:column; gap:6px; font-size:14px; color:#3C3C3C; }
        .items-list .item { display:flex; justify-content:space-between; gap:12px; }

        .order-footer { display:flex; align-items:center; justify-content:space-between; gap:12px; margin-top:8px; }
        .order-info { display:flex; flex-direction:column; gap:6px; }
        .order-total { font-weight:700; color:#1F4D3A; }

        .order-actions { display:flex; gap:8px; align-items:center; margin-top:8px; flex-wrap:wrap; }
        .order-actions select { padding:10px 12px; border-radius:10px; border:1px solid #EBE0D1; background:white; color:#2B2320; }
        .order-actions button { padding:10px 12px; border-radius:10px; cursor:pointer; border:none; font-size:13px; font-weight:600; }

        .order-actions .icon { margin-right:6px; }

        .modal-overlay { position:fixed; inset:0; background: rgba(0,0,0,0.35); display:flex; align-items:center; justify-content:center }
        .modal-proof { background:white; padding:16px; border-radius:12px; max-width:90%; max-height:90%; border:1px solid #EBE0D1; }
        .modal-proof img{ max-width:100%; max-height:80vh; display:block }

        @media (max-width: 1200px) { 
          .admin-filters { 
            padding: 18px 20px;
          }
          .filter-actions { 
            margin-left: 0;
            width: 100%;
            justify-content: flex-start;
          }
          .orders-list { grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); }
        }

        @media (max-width: 900px) { 
          .admin-filters { 
            flex-direction: column;
            align-items: flex-start;
            gap: 14px;
          }
          .filter-group {
            width: 100%;
            min-width: unset;
          }
          .admin-filters select,
          .admin-filters input {
            width: 100%;
            min-width: unset;
          }
          .filter-actions { 
            width: 100%;
            margin-left: 0;
          }
          .btn-primary {
            width: 100%;
            justify-content: center;
          }
          .orders-list { grid-template-columns: 1fr; } 
        }

        @media (max-width: 640px) { 
          .admin-section { 
            padding: 18px 12px;
          }
          .admin-section h2 {
            font-size: 24px;
            margin-bottom: 20px;
          }
          .admin-filters { 
            padding: 16px 14px;
            border-radius: 14px;
          }
          .filter-label {
            font-size: 12px;
          }
          .admin-filters select,
          .admin-filters input {
            padding: 10px 14px;
            font-size: 13px;
          }
          .order-card { 
            padding: 14px;
          }
        }
      `}</style>

      <div className="admin-section">
        <h2>🚚 Delivery Orders & Payments</h2>

        <div className="admin-filters">
          <div className="filter-group">
            <span className="filter-label">Payment Status</span>
            <select value={filters.payment_status} onChange={(e) => setFilters(f => ({...f, payment_status: e.target.value}))}>
              <option value="all">All Payment Statuses</option>
              <option value="Pending Verification">Pending Verification</option>
              <option value="Paid">Paid</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>

          <div className="filter-group">
            <span className="filter-label">Order Status</span>
            <select value={filters.status} onChange={(e) => setFilters(f => ({...f, status: e.target.value}))}>
              <option value="all">All Order Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Preparing">Preparing</option>
              <option value="Ready for Pickup">Ready for Pickup</option>
              <option value="Served">Served</option>
              <option value="Out for Delivery">Out for Delivery</option>
              <option value="Delivered">Delivered</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>

          <div className="filter-group" style={{ flex: 1.5 }}>
            <span className="filter-label">Search</span>
            <input placeholder="Order # or customer name..." value={filters.q} onChange={(e) => setFilters(f => ({...f, q: e.target.value}))} />
          </div>

          <div className="filter-actions">
            <button onClick={fetchOrders} className="btn-primary">🔄 Refresh</button>
          </div>
        </div>

        {loading ? <p>Loading...</p> : (
          <div className="orders-list">
            {orders.map(order => {
              const badgeClass = (status => {
                if (!status) return 'pending';
                const s = status.toLowerCase();
                if (s.includes('pending')) return 'pending';
                if (s.includes('prepar')) return 'preparing';
                if (s.includes('out for') || s.includes('delivery')) return 'out';
                if (s.includes('deliver') || s.includes('delivered')) return 'delivered';
                if (s.includes('cancel')) return 'cancelled';
                return 'preparing';
              })(order.status);

              return (
                <div key={order.id} className="order-card">
                  <div className="order-head">
                    <div className="order-meta">
                      <div className="order-number">{order.order_number}</div>
                      <div className="order-time">{new Date(order.created_at).toLocaleString()}</div>
                    </div>
                    <div>
                      <span className={`badge ${badgeClass}`}>{order.status}</span>
                    </div>
                  </div>

                  <div className="order-body">
                    <div className="items-list">
                      {(order.items && order.items.length > 0) ? order.items.map((it, idx) => (
                        <div className="item" key={idx}><div>{it.name || it.product_name || 'Item' }{it.quantity ? ` x${it.quantity}` : ''}</div><div style={{color:'#6B6B6B'}}>{formatCurrencyPHP((it.price||0) * (it.quantity||1))}</div></div>
                      )) : (
                        <div className="item">No item details available</div>
                      )}
                    </div>

                    <div className="order-info">
                      <div><strong>Customer:</strong> {order.customer_name} — <span style={{color:'#6B6B6B'}}>{order.contact_number}</span></div>
                      <div><strong>Address:</strong> {order.address} {order.landmark ? `· ${order.landmark}` : ''}</div>
                      {order.status === 'Cancelled' && (
                        <div style={{color:'#B02A2A'}}><strong>Cancellation:</strong> {order.cancellation_reason || '—'}</div>
                      )}
                      <div style={{fontSize:12, color:'#6B6B6B'}}>Last update: {new Date(order.updated_at || order.delivery_started_at || order.delivered_at || order.created_at).toLocaleString()}</div>
                    </div>
                  </div>

                  <div className="order-footer">
                    <div className="order-total">{formatCurrencyPHP(order.total_amount)}</div>
                    <div style={{display:'flex', gap:8}}>
                      <div style={{fontSize:13, color:'#6B6B6B'}}>{order.payment_method} · {order.payment_status || 'N/A'}</div>
                    </div>
                  </div>

                  <div className="order-actions">
                    {order.payment_proof && (
                      <button className="btn-ghost" onClick={() => setSelectedProof(order.payment_proof)} title="View payment proof">🔍 View</button>
                    )}

                    {order.payment_status === 'Pending Verification' && (
                      <>
                        <button className="btn-primary" onClick={() => handleVerify(order.id)} title="Mark payment as Paid">✅ Verify</button>
                        <button className="btn-danger" onClick={() => handleReject(order.id)} title="Reject payment">✖ Reject</button>
                      </>
                    )}

                    <select className="control" disabled={updatingIds.includes(order.id) || (allowedTransitions[order.status]||[]).length===0} defaultValue="" onChange={(e) => { if (e.target.value) handleStatusChange(order.id, e.target.value); e.target.value=''; }}>
                      <option value="">Change status</option>
                      {(allowedTransitions[order.status] || []).map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {selectedProof && (
          <div className="modal-overlay" onClick={() => setSelectedProof(null)}>
            <div className="modal-proof" onClick={(e)=>e.stopPropagation()}>
              <button style={{float:'right'}} onClick={() => setSelectedProof(null)}>Close</button>
              <img src={selectedProof} alt="payment proof" />
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default DeliveryOrders;
