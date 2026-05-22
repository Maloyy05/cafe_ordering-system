import React, { useState, useEffect, useContext } from 'react';
import API from '../../services/api';
import toast from 'react-hot-toast';
import { AuthContext } from '../../context/AuthContext';
import formatCurrencyPHP from '../../utils/currency';
import ConfirmModal from '../../components/common/ConfirmModal';

const StaffDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [updatingIds, setUpdatingIds] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [showCancelled, setShowCancelled] = useState(false);
  const [dateFilter, setDateFilter] = useState('today');

  const fetchOrders = async () => {
    try {
      const res = await API.get('/orders');
      const payload = res.data;
      const orders = Array.isArray(payload) ? payload : (payload && payload.data) ? payload.data : [];
      setOrders(orders);
    } catch (err) {
      const status = err?.response?.status;
      if (status === 401) {
        toast.error('Unauthorized. Please log in as staff/admin.');
      } else {
        toast.error('Failed to load orders');
      }
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const updateStatus = async (orderId, newStatus) => {
    let prevStatus = null;
    try {
      // capture previous status so we can revert if API fails
      prevStatus = (orders.find(o => o.id === orderId) || {}).status;
      // Optimistically update local orders state so UI reflects change immediately
      setOrders(prev => prev.map(o => o.id === orderId ? ({ ...o, status: newStatus }) : o));
      // mark updating
      setUpdatingIds(prev => Array.from(new Set([...prev, orderId])));
      // call API and use its returned updated order object to ensure full consistency
      const res = await API.put(`/orders/${orderId}/status`, { status: newStatus });
      const updatedOrder = res?.data;
      if (updatedOrder) {
        setOrders(prev => prev.map(o => o.id === orderId ? ({ ...o, ...updatedOrder }) : o));
      }
      toast.success(`Order status updated to ${newStatus}`);
      // broadcast update for other tabs (admin view) to pick up immediately
      try {
        localStorage.setItem('order_update', JSON.stringify({ id: orderId, ts: Date.now() }));
      } catch (e) {
        // ignore storage errors (e.g., private mode)
      }
      // refresh in background to ensure latest data
      fetchOrders();
    } catch (err) {
      console.error('updateStatus error', err);
      // revert optimistic update on failure
      const serverData = err?.response?.data;
      const serverMsg = serverData && (serverData.message || JSON.stringify(serverData));
      const msg = serverMsg || err?.message || 'Failed to update status';
      // Check if payment verification is required
      if (serverData?.requires_verification) {
        toast.error('Payment must be verified before preparing order');
      } else if (err?.response === undefined) {
        // Network error or CORS
        toast.error('Network error: could not reach the backend. Check backend URL and CORS.');
      } else {
        toast.error(msg);
      }
      if (prevStatus !== null) {
        setOrders(prev => prev.map(o => o.id === orderId ? ({ ...o, status: prevStatus }) : o));
      }
    } finally {
      setUpdatingIds(prev => prev.filter(id => id !== orderId));
    }
  };

  // Confirmation modal state
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmPayload, setConfirmPayload] = useState({ orderId: null, newStatus: null });
  const [confirmLoading, setConfirmLoading] = useState(false);

  const openConfirm = (orderId, newStatus) => {
    setConfirmPayload({ orderId, newStatus });
    setConfirmOpen(true);
  };

  const handleConfirm = async () => {
    setConfirmLoading(true);
    try {
      await updateStatus(confirmPayload.orderId, confirmPayload.newStatus);
    } finally {
      setConfirmLoading(false);
      setConfirmOpen(false);
      setConfirmPayload({ orderId: null, newStatus: null });
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

  const nextActionsFor = (order) => {
    const next = allowedTransitions[order.status] || [];
    const orderType = order.order_type || 'Pickup';
    // Filter out order-type-specific statuses that don't apply
    return next.filter(s => {
      if (s === 'Out for Delivery' || s === 'Delivered') {
        return orderType === 'Delivery';
      }
      if (s === 'Ready for Pickup') {
        return orderType === 'Pickup';
      }
      if (s === 'Served') {
        return orderType === 'Dine-in';
      }
      return true;
    });
  };

  const verifyPayment = async (orderId, action) => {
    try {
      const payment_status = action === 'verify' ? 'Paid' : 'Rejected';
      await API.put(`/orders/${orderId}/payment`, { payment_status });
      toast.success(`Payment ${payment_status}`);
      fetchOrders();
    } catch (err) {
      console.error('verifyPayment error', err);
      const msg = err?.response?.data?.message || err.message || 'Failed to update payment';
      toast.error(msg);
    }
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=DM+Sans:wght@300;400;500;600&display=swap');

        .staff-dashboard { 
          min-height: calc(100vh - 72px); 
          padding: 28px 36px; 
          background: #F8F5F0; 
          color: #2B2320; 
          font-family: 'DM Sans', sans-serif;
        }

        .staff-dashboard h1 { 
          font-family: 'Playfair Display', serif; 
          color: #1F4D3A; 
          margin-bottom: 28px;
          font-size: 32px;
        }

        /* Modern Filter Bar */
        .staff-filters {
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
          min-width: 200px;
        }

        .filter-label {
          font-size: 13px;
          font-weight: 600;
          color: #6B6B6B;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          white-space: nowrap;
        }

        .staff-filters select,
        .staff-filters input {
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
          min-width: 140px;
          box-sizing: border-box;
        }

        .staff-filters select:hover,
        .staff-filters input:hover {
          border-color: #1F4D3A;
          background: #FFFFFF;
          box-shadow: 0 4px 12px rgba(31, 77, 58, 0.06);
        }

        .staff-filters select:focus,
        .staff-filters input:focus {
          outline: none;
          border-color: #1F4D3A;
          background: #FFFFFF;
          box-shadow: 0 6px 20px rgba(31, 77, 58, 0.12);
        }

        /* Checkbox Styling */
        .checkbox-group {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 16px;
          background: #FAFAFA;
          border-radius: 12px;
          border: 1.5px solid #EBE0D1;
          transition: all 0.2s ease;
          cursor: pointer;
        }

        .checkbox-group:hover {
          border-color: #1F4D3A;
          background: #FFFFFF;
          box-shadow: 0 4px 12px rgba(31, 77, 58, 0.06);
        }

        .checkbox-group input[type="checkbox"] {
          width: 18px;
          height: 18px;
          cursor: pointer;
          accent-color: #1F4D3A;
        }

        .checkbox-group label {
          font-size: 14px;
          font-weight: 500;
          color: #2B2320;
          cursor: pointer;
          margin: 0;
        }

        /* Order Cards */
        .orders-list { 
          display: grid; 
          grid-template-columns: repeat(auto-fill, minmax(360px, 1fr)); 
          gap: 18px;
        }

        .order-card { 
          background: white; 
          border: 1px solid #EBE0D1;
          padding: 18px; 
          border-radius: 14px; 
          display: flex; 
          flex-direction: column; 
          gap: 12px;
          box-shadow: 0 10px 30px rgba(31, 77, 58, 0.04);
          transition: all 0.3s ease;
        }

        .order-card:hover {
          box-shadow: 0 15px 40px rgba(31, 77, 58, 0.08);
          transform: translateY(-2px);
        }

        .order-header { 
          display: flex; 
          justify-content: space-between; 
          align-items: flex-start;
          gap: 12px;
        }

        .order-meta {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .order-number { 
          font-family: 'Playfair Display', serif;
          color: #1F4D3A; 
          font-size: 18px; 
          font-weight: 700;
          margin: 0;
        }

        .order-time {
          font-size: 12px;
          color: #6B6B6B;
        }

        /* Status Badges */
        .order-status { 
          padding: 6px 12px; 
          border-radius: 999px; 
          font-weight: 700;
          font-size: 12px;
          display: inline-block;
          text-transform: capitalize;
          white-space: nowrap;
        }

        .order-status.pending { 
          background: #FFF7E6; 
          color: #C47A00;
          border: 1px solid #F4E1C1;
        }

        .order-status.preparing { 
          background: #E9F7EF; 
          color: #1F7A3A;
          border: 1px solid #CFEFD9;
        }

        .order-status.ready,
        .order-status.out { 
          background: #E8F8FF; 
          color: #0B6A8B;
          border: 1px solid #CDEDF6;
        }

        .order-status.completed,
        .order-status.delivered { 
          background: #F0FFF4; 
          color: #086A2E;
          border: 1px solid #DFF1DF;
        }

        .order-status.served {
          background: #E9F7EF;
          color: #1F7A3A;
          border: 1px solid #CFEFD9;
        }

        .order-status.cancelled { 
          background: #FFF5F5; 
          color: #B02A2A;
          border: 1px solid #F5DADA;
        }

        .order-body { 
          display: flex; 
          gap: 12px; 
          flex-direction: column;
        }

        .order-info {
          display: flex;
          flex-direction: column;
          gap: 6px;
          font-size: 14px;
          color: #3C3C3C;
        }

        .order-info strong {
          color: #1F4D3A;
        }

        .order-info p {
          margin: 0;
          line-height: 1.4;
        }

        .order-items { 
          margin-top: 4px; 
          display: flex; 
          gap: 8px; 
          flex-wrap: wrap;
        }

        .order-item { 
          background: #FAFAFA; 
          padding: 6px 10px; 
          border-radius: 8px;
          font-size: 12px;
          color: #2B2320;
          border: 1px solid #EBE0D1;
        }

        .order-timestamps {
          font-size: 12px;
          color: #6B6B6B;
          display: flex;
          flex-direction: column;
          gap: 4px;
          margin-top: 4px;
        }

        .order-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin-top: 8px;
          padding-top: 12px;
          border-top: 1px solid #EBE0D1;
        }

        .order-total {
          font-weight: 700;
          color: #1F4D3A;
          font-size: 16px;
        }

        .order-payment {
          font-size: 13px;
          color: #6B6B6B;
        }

        .order-actions { 
          display: flex; 
          gap: 8px; 
          margin-top: auto; 
          flex-wrap: wrap;
        }

        .order-actions button,
        .order-actions select {
          padding: 10px 14px;
          border-radius: 10px;
          border: none;
          cursor: pointer;
          font-size: 13px;
          font-weight: 600;
          transition: all 0.2s ease;
          flex: 1;
          text-align: center;
        }

        .order-actions select {
          background: #FAFAFA;
          border: 1.5px solid #EBE0D1;
          color: #2B2320;
        }

        .order-actions select:hover {
          border-color: #1F4D3A;
          background: #FFFFFF;
          box-shadow: 0 4px 12px rgba(31, 77, 58, 0.06);
        }

        .btn-verify,
        .btn-preparing,
        .btn-ready,
        .btn-complete {
          background: linear-gradient(135deg, #1F4D3A 0%, #2D5016 100%);
          color: white;
          box-shadow: 0 4px 12px rgba(31, 77, 58, 0.1);
        }

        .btn-verify:hover,
        .btn-preparing:hover,
        .btn-ready:hover,
        .btn-complete:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 16px rgba(31, 77, 58, 0.15);
        }

        .btn-verify:disabled,
        .btn-preparing:disabled,
        .btn-ready:disabled,
        .btn-complete:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        .btn-reject { 
          background: #FFF5F5; 
          color: #C0392B;
          border: 1.5px solid #F2B5B5;
        }

        .btn-reject:hover {
          background: #FFE8E8;
          border-color: #E07070;
          box-shadow: 0 4px 12px rgba(192, 57, 43, 0.08);
        }

        /* Responsive Design */
        @media (max-width: 1200px) { 
          .staff-filters { 
            padding: 18px 20px;
          }
          .orders-list { grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); }
        }

        @media (max-width: 900px) { 
          .staff-filters { 
            flex-direction: column;
            align-items: flex-start;
            gap: 14px;
          }
          .filter-group {
            width: 100%;
            min-width: unset;
          }
          .staff-filters select,
          .staff-filters input {
            width: 100%;
            min-width: unset;
          }
          .checkbox-group {
            width: 100%;
          }
          .orders-list { grid-template-columns: 1fr; }
        }

        @media (max-width: 640px) { 
          .staff-dashboard {
            padding: 18px 12px;
          }
          .staff-dashboard h1 {
            font-size: 24px;
            margin-bottom: 20px;
          }
          .staff-filters { 
            padding: 16px 14px;
            border-radius: 14px;
          }
          .filter-label {
            font-size: 12px;
          }
          .staff-filters select,
          .staff-filters input {
            padding: 10px 14px;
            font-size: 13px;
          }
          .order-card { 
            padding: 14px;
          }
          .order-number {
            font-size: 16px;
          }
        }
      `}</style>

      <div className="staff-dashboard">
        <h1>📋 Incoming Orders</h1>

        <div className="staff-filters">
          <div className="filter-group">
            <span className="filter-label">Date</span>
            <select value={dateFilter} onChange={(e) => setDateFilter(e.target.value)}>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="all">All Time</option>
            </select>
          </div>

          <div className="filter-group">
            <span className="filter-label">Status</span>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="all">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Preparing">Preparing</option>
              <option value="Ready for Pickup">Ready for Pickup</option>
              <option value="Served">Served</option>
              <option value="Out for Delivery">Out for Delivery</option>
              <option value="Delivered">Delivered</option>
              <option value="Completed">Completed</option>
            </select>
          </div>

          <div className="checkbox-group">
            <input type="checkbox" id="showCancelledChk" checked={showCancelled} onChange={(e) => setShowCancelled(e.target.checked)} />
            <label htmlFor="showCancelledChk">Show Cancelled</label>
          </div>
        </div>
        <div className="orders-list">
          {orders
            .filter(order => {
              const orderDate = new Date(order.created_at);
              const now = new Date();
              if (dateFilter === 'today') {
                return orderDate.toDateString() === now.toDateString();
              } else if (dateFilter === 'week') {
                const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                return orderDate >= weekAgo;
              } else if (dateFilter === 'month') {
                const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
                return orderDate >= monthAgo;
              }
              return true;
            })
            .filter(order => statusFilter === 'all' || order.status === statusFilter)
            .filter(order => showCancelled || order.status !== 'Cancelled')
            .map(order => {
              const badgeClass = (status => {
                if (!status) return 'pending';
                const s = status.toLowerCase();
                if (s.includes('pending')) return 'pending';
                if (s.includes('prepar')) return 'preparing';
                if (s.includes('ready')) return 'ready';
                if (s.includes('served')) return 'served';
                if (s.includes('out for') || s.includes('delivery')) return 'out';
                if (s.includes('deliver') && s.includes('delivered')) return 'delivered';
                if (s.includes('complet')) return 'completed';
                if (s.includes('cancel')) return 'cancelled';
                return 'pending';
              })(order.status);

              return (
                <div key={order.id} className="order-card">
                  <div className="order-header">
                    <div className="order-meta">
                      <div className="order-number">{order.order_number}</div>
                      <div className="order-time">{new Date(order.created_at).toLocaleString()}</div>
                    </div>
                    <div>
                      <span className={`order-status ${badgeClass}`}>{order.status}</span>
                    </div>
                  </div>

                  <div className="order-body">
                    <div className="order-info">
                      <p><strong>Customer:</strong> {order.customer_name}</p>
                      {order.order_type === 'Delivery' && (
                        <>
                          <p><strong>Contact:</strong> {order.contact_number}</p>
                          <p><strong>Address:</strong> {order.address} {order.landmark ? `· ${order.landmark}` : ''}</p>
                          <p><strong>Payment:</strong> {order.payment_method} · {order.payment_status || 'N/A'}</p>
                          {order.payment_proof && (
                            <p><a href={order.payment_proof} target="_blank" rel="noreferrer" style={{ color: '#1F4D3A', textDecoration: 'none', fontWeight: 600 }}>🔍 View Payment Proof</a></p>
                          )}
                          {order.status === 'Cancelled' && (
                            <p style={{color:'#B02A2A'}}><strong>Cancellation:</strong> {order.cancellation_reason || '—'}{order.cancellation_time && (
                              <span> · {new Date(order.cancellation_time).toLocaleString()}</span>
                            )}</p>
                          )}
                        </>
                      )}
                    </div>

                    <div className="order-items">
                      {order.order_items && order.order_items.map(item => (
                        <div key={item.id} className="order-item">
                          {item.products?.name || 'Item'} ×{item.quantity}
                        </div>
                      ))}
                    </div>

                    <div className="order-timestamps">
                      <div>📍 Placed: {new Date(order.created_at).toLocaleString()}</div>
                      {order.delivery_started_at && <div>🚚 Delivery Started: {new Date(order.delivery_started_at).toLocaleString()}</div>}
                      {order.delivered_at && <div>✓ Delivered: {new Date(order.delivered_at).toLocaleString()}</div>}
                      {order.status === 'Completed' && order.updated_at && <div>✅ Completed: {new Date(order.updated_at).toLocaleString()}</div>}
                    </div>
                  </div>

                  <div className="order-footer">
                    <div className="order-total">{formatCurrencyPHP(order.total_amount)}</div>
                    {order.order_type === 'Delivery' && (
                      <div className="order-payment">{order.order_type}</div>
                    )}
                  </div>

                  <div className="order-actions">
                    {order.order_type === 'Delivery' && order.payment_status === 'Pending Verification' && (
                      <>
                        <button onClick={() => verifyPayment(order.id, 'verify')} className="btn-verify" title="Mark payment as Paid">✅ Verify</button>
                        <button onClick={() => verifyPayment(order.id, 'reject')} className="btn-reject" title="Reject payment">✖ Reject</button>
                      </>
                    )}
                    {order.status === 'Pending' && (
                      <button disabled={updatingIds.includes(order.id)} onClick={() => openConfirm(order.id, 'Preparing')} className="btn-preparing">Start Preparing</button>
                    )}

                    {order.status === 'Preparing' && (
                      order.order_type === 'Delivery' ? (
                        <button disabled={updatingIds.includes(order.id)} onClick={() => openConfirm(order.id, 'Out for Delivery')} className="btn-ready">Mark Out for Delivery</button>
                      ) : order.order_type === 'Dine-in' ? (
                        <button disabled={updatingIds.includes(order.id)} onClick={() => openConfirm(order.id, 'Served')} className="btn-ready">Mark Served</button>
                      ) : (
                        <button disabled={updatingIds.includes(order.id)} onClick={() => openConfirm(order.id, 'Out for Delivery')} className="btn-ready">Mark Out for Delivery</button>
                      )
                    )}

                    {order.status === 'Ready for Pickup' && (
                      <button disabled={updatingIds.includes(order.id)} onClick={() => openConfirm(order.id, 'Completed')} className="btn-complete">Complete Order</button>
                    )}

                    {order.status === 'Served' && (
                      <button disabled={updatingIds.includes(order.id)} onClick={() => openConfirm(order.id, 'Completed')} className="btn-complete">Complete Order</button>
                    )}

                    {order.status === 'Out for Delivery' && (
                      <button disabled={updatingIds.includes(order.id)} onClick={() => openConfirm(order.id, 'Delivered')} className="btn-ready">Mark Delivered</button>
                    )}

                    {order.status === 'Delivered' && (
                      user && user.role === 'admin' ? (
                        <button disabled={updatingIds.includes(order.id)} onClick={() => openConfirm(order.id, 'Completed')} className="btn-complete">Complete Order</button>
                      ) : (
                        <button onClick={() => toast('Waiting for admin to finalize delivery')} className="btn-complete">Awaiting Completion</button>
                      )
                    )}

                    {nextActionsFor(order).length > 0 && (
                        <select className="order-actions" disabled={updatingIds.includes(order.id)} onChange={(e) => { if (e.target.value) { openConfirm(order.id, e.target.value); } e.target.value=''; }}>
                        <option value="">More...</option>
                        {nextActionsFor(order).map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    )}
                  </div>
                </div>
              );
            })}
        </div>
        <ConfirmModal
          open={confirmOpen}
          title={`Change Order Status`}
          message={`Change order status to "${confirmPayload.newStatus || ''}"?`}
          confirmLabel={`Change status`}
          loading={confirmLoading}
          onConfirm={handleConfirm}
          onCancel={() => setConfirmOpen(false)}
        />
      </div>
    </>
  );
};

export default StaffDashboard;
