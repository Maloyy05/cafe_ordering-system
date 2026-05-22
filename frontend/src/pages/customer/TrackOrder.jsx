import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../../services/api';
import toast from 'react-hot-toast';
import formatCurrencyPHP from '../../utils/currency';

const TrackOrder = () => {
  const { orderNumber } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [orderLogs, setOrderLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCancel, setShowCancel] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelLoading, setCancelLoading] = useState(false);

  const fetchOrder = async (num) => {
    const orderNum = num || orderNumber;
    setLoading(true);
    try {
      if (!orderNum) {
        setOrder(null);
        setLoading(false);
        return;
      }
      const res = await API.get(`/orders/track/${orderNum}`);
      setOrder(res.data);
      // Also fetch order logs
      try {
        const logsRes = await API.get(`/orders/track/${orderNum}/logs`);
        setOrderLogs(logsRes.data || []);
      } catch (logErr) {
        console.log('No logs available');
        setOrderLogs([]);
      }
    } catch (err) {
      toast.error('Order not found');
      setOrder(null);
      setOrderLogs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (orderNumber) fetchOrder();
    const iv = setInterval(() => { if (orderNumber) fetchOrder(); }, 15000);
    return () => clearInterval(iv);
  }, [orderNumber]);

  const handleCancelSubmit = async () => {
    if (!order) return;
    if (!cancelReason || cancelReason.trim().length < 3) return toast.error('Please provide a reason (min 3 chars)');
    try {
      setCancelLoading(true);
      await API.put(`/orders/${order.id}/cancel`, { reason: cancelReason });
      toast.success('Order cancelled');
      setShowCancel(false);
      setCancelReason('');
      fetchOrder(order.order_number);
    } catch (err) {
      toast.error('Failed to cancel order');
    } finally {
      setCancelLoading(false);
    }
  };

  const [input, setInput] = useState(orderNumber || '');
  const handleLookup = (e) => {
    e.preventDefault();
    if (!input) return toast.error('Enter order number');
    // navigate to param route so bookmarkable
    navigate(`/track/${input}`);
  };

  if (loading) return <p>Loading...</p>;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=DM+Sans:wght@300;400;500;600&display=swap');

        .track-order {
          min-height: calc(100vh - 72px);
          padding: 48px 36px;
          background: linear-gradient(135deg, #FAF7F2 0%, #F5EFE7 100%);
          color: #2B2320;
          font-family: 'DM Sans', sans-serif;
        }

        .track-content {
          max-width: 800px;
          margin: 0 auto;
        }

        .track-content h1 {
          font-family: 'Playfair Display', serif;
          color: #2D5016;
          margin: 0 0 12px;
          font-size: 36px;
          font-weight: 700;
        }

        .track-order form {
          display: flex;
          gap: 12px;
          margin-bottom: 24px;
        }

        .track-order input[type="text"],
        .track-order input[type="search"] {
          flex: 1;
          padding: 12px 14px;
          border-radius: 10px;
          border: 1.5px solid #EBE0D1;
          background: rgba(212, 132, 78, 0.02);
          color: #2B2320;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          transition: all 0.2s;
        }

        .track-order input[type="text"]:focus,
        .track-order input[type="search"]:focus {
          outline: none;
          border-color: #D4844E;
          background: rgba(212, 132, 78, 0.06);
          box-shadow: 0 0 0 3px rgba(212, 132, 78, 0.08);
        }

        .btn-primary {
          padding: 12px 24px;
          background: linear-gradient(135deg, #2D5016, #4A7C2E);
          border: none;
          border-radius: 10px;
          color: white;
          cursor: pointer;
          font-weight: 700;
          font-size: 13px;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
          box-shadow: 0 8px 20px rgba(45, 80, 22, 0.15);
        }

        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 28px rgba(45, 80, 22, 0.25);
          background: linear-gradient(135deg, #1F3710, #2D5016);
        }

        .btn-danger {
          padding: 12px 24px;
          background: rgba(231, 76, 60, 0.08);
          border: 1px solid rgba(231, 76, 60, 0.2);
          color: #E74C3C;
          border-radius: 10px;
          cursor: pointer;
          font-weight: 600;
          font-size: 13px;
          transition: all 0.2s;
        }

        .btn-danger:hover {
          background: rgba(231, 76, 60, 0.12);
          border-color: rgba(231, 76, 60, 0.4);
        }

        .track-order .order-card {
          background: white;
          border: 1px solid #EBE0D1;
          padding: 18px;
          border-radius: 12px;
          margin-top: 16px;
          box-shadow: 0 4px 12px rgba(45, 80, 22, 0.04);
        }

        .track-order .order-card h2 {
          margin: 0 0 8px;
          font-family: 'Playfair Display', serif;
          color: #2D5016;
          font-size: 22px;
          font-weight: 700;
        }

        .track-order .order-card p {
          margin: 6px 0;
          color: #5C524A;
          font-size: 14px;
        }

        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .modal-card {
          background: white;
          color: #2B2320;
          padding: 28px;
          border-radius: 16px;
          width: 92%;
          max-width: 480px;
          border: 1px solid #EBE0D1;
          box-shadow: 0 16px 56px rgba(45, 80, 22, 0.15);
        }

        .modal-card h3 {
          margin: 0 0 12px;
          font-family: 'Playfair Display', serif;
          color: #2D5016;
          font-size: 20px;
          font-weight: 700;
        }

        .modal-card textarea {
          width: 100%;
          min-height: 100px;
          padding: 12px;
          border-radius: 10px;
          background: rgba(212, 132, 78, 0.02);
          border: 1.5px solid #EBE0D1;
          color: #2B2320;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          resize: vertical;
          transition: all 0.2s;
        }

        .modal-card textarea:focus {
          outline: none;
          border-color: #D4844E;
          background: rgba(212, 132, 78, 0.06);
          box-shadow: 0 0 0 3px rgba(212, 132, 78, 0.08);
        }

        .modal-buttons {
          display: flex;
          gap: 12px;
          margin-top: 18px;
        }

        .modal-buttons button {
          flex: 1;
          padding: 12px;
          border-radius: 10px;
          border: none;
          cursor: pointer;
          font-weight: 600;
          font-size: 13px;
          transition: all 0.2s;
        }

        .modal-btn-cancel {
          background: #EBE0D1;
          color: #2D5016;
        }

        .modal-btn-cancel:hover {
          background: #DDD0C1;
        }

        @media (max-width: 768px) {
          .track-order {
            padding: 32px 24px;
          }

          .track-content h1 {
            font-size: 28px;
          }

          .track-order form {
            flex-direction: column;
          }

          .track-order input[type="text"],
          .track-order input[type="search"] {
            width: 100%;
            box-sizing: border-box;
          }

          .modal-card {
            max-width: 94%;
          }
        }

        @media (max-width: 480px) {
          .track-order {
            padding: 24px 16px;
          }

          .track-content h1 {
            font-size: 24px;
          }

          .modal-card {
            padding: 20px;
          }

          .modal-buttons {
            flex-direction: column;
          }
        }
      `}</style>

      <div className="track-order">
        <div className="track-content">
          <h1>Track Order</h1>
      {!orderNumber && (
        <form onSubmit={handleLookup} style={{marginBottom:12}}>
          <input placeholder="Enter order number" value={input} onChange={(e)=>setInput(e.target.value)} />
          <button className="btn-primary" type="submit">Lookup</button>
        </form>
      )}
      {!order && orderNumber && <p>No order found for <strong>{orderNumber}</strong></p>}
      {order && (
        <div>
          <h2>{order.order_number}</h2>
          <p><strong>Status:</strong> {order.status}</p>
          {order.payment_status === 'Rejected' && (
            <div style={{background: 'rgba(255,107,107,0.15)', border: '1px solid rgba(255,107,107,0.3)', padding: '10px', borderRadius: '8px', marginBottom: 8}}>
              <strong style={{color: '#ff6b6b'}}>Payment Rejected</strong>
              <p style={{margin: '4px 0', fontSize: '14px'}}>Your payment was not accepted. Please cancel this order and place a new one with correct payment details.</p>
            </div>
          )}
          {['Pending','Preparing'].includes(order.status) || order.payment_status === 'Rejected' ? (
            <div style={{marginTop:8}}>
              <button className="btn-danger" onClick={() => setShowCancel(true)}>Cancel Order</button>
            </div>
          ) : null}
          <p><strong>Payment:</strong> {order.payment_method} — {order.payment_status || 'N/A'}</p>
          <p><strong>Customer:</strong> {order.customer_name}</p>
          {order.order_type === 'Delivery' && (
            <>
              <p><strong>Contact:</strong> {order.contact_number}</p>
              <p><strong>Address:</strong> {order.address}</p>
              <p><strong>Landmark:</strong> {order.landmark}</p>
            </>
          )}
          <div>
            <h3>Items</h3>
            {order.order_items && order.order_items.map(it => (
              <div key={it.id} style={{display:'flex',justifyContent:'space-between'}}>
                <div>{it.products?.name}</div>
                <div>{it.quantity} x {formatCurrencyPHP(it.price)}</div>
              </div>
            ))}
          </div>

          {/* Order Status Timeline */}
          {(orderLogs.length > 0 || order.status !== 'Pending') && (
            <div style={{marginTop: 16}}>
              <h3>Order Timeline</h3>
              <div style={{display: 'flex', flexDirection: 'column', gap: 8}}>
                {/* Initial order creation */}
                <div style={{display: 'flex', alignItems: 'center', gap: 8}}>
                  <span style={{color: '#4ade80'}}>&#9679;</span>
                  <span>Order Placed</span>
                  <small style={{color: 'rgba(255,255,255,0.4)'}}>
                    {new Date(order.created_at).toLocaleString()}
                  </small>
                </div>
                {/* Status change logs */}
                {orderLogs.map((log, idx) => (
                  <div key={idx} style={{display: 'flex', alignItems: 'center', gap: 8}}>
                    <span style={{color: log.new_status === 'Cancelled' ? '#ff6b6b' : '#e8c97a'}}>&#9679;</span>
                    <span>
                      {log.new_status === 'Cancelled' ? 'Order Cancelled' : `${log.old_status} → ${log.new_status}`}
                    </span>
                    <small style={{color: 'rgba(255,255,255,0.4)'}}>
                      {log.changed_at ? new Date(log.changed_at).toLocaleString() : ''}
                    </small>
                  </div>
                ))}
                {/* Current status if no logs */}
                {orderLogs.length === 0 && order.status !== 'Pending' && (
                  <div style={{display: 'flex', alignItems: 'center', gap: 8}}>
                    <span style={{color: '#e8c97a'}}>&#9679;</span>
                    <span>Status: {order.status}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {showCancel && (
        <div className="modal-overlay" onClick={() => setShowCancel(false)}>
          <div className="modal-card" onClick={(e)=>e.stopPropagation()}>
            <h3>Cancel Order {order?.order_number}</h3>
            <p>Provide a reason for cancelling your order:</p>
            <textarea value={cancelReason} onChange={(e)=>setCancelReason(e.target.value)} />
            <div style={{display:'flex',gap:8,justifyContent:'flex-end',marginTop:8}}>
              <button onClick={()=>setShowCancel(false)}>Close</button>
              <button className="btn-danger" onClick={handleCancelSubmit} disabled={cancelLoading}>{cancelLoading ? 'Cancelling...' : 'Submit Cancel'}</button>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
    </>
  );
};

export default TrackOrder;
