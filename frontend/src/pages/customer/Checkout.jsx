import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CartContext } from '../../context/CartContext';
import API from '../../services/api';
import toast from 'react-hot-toast';
import formatCurrencyPHP from '../../utils/currency';

const DELIVERY_FEE = 35; // Fixed delivery fee in PHP

const Checkout = () => {
  const { cart, totalAmount, clearCart } = useContext(CartContext);
  const [customerName, setCustomerName] = useState('');
  const [orderType, setOrderType] = useState('Pickup');
  const [tableNumber, setTableNumber] = useState('');
  const [address, setAddress] = useState('');
  const [landmark, setLandmark] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Cash on Delivery');
  const [paymentReference, setPaymentReference] = useState('');
  const [paymentProofFile, setPaymentProofFile] = useState(null);
  const navigate = useNavigate();

  // Calculate total with delivery fee
  const calculateTotal = () => {
    let total = totalAmount;
    if (orderType === 'Delivery') {
      total += DELIVERY_FEE;
    }
    return total;
  };

  const handleCheckout = async (e) => {
    e.preventDefault();
    if (cart.length === 0) return;

    try {
      if (cart.length === 0) return;

      const items = cart.map(item => ({
        product_id: item.id,
        quantity: item.quantity,
        price: item.price
      }));

      // Use FormData if there's a file or to support multipart fields
      const formData = new FormData();
      formData.append('customer_name', customerName);
      formData.append('items', JSON.stringify(items));
      formData.append('total_amount', calculateTotal());
      formData.append('payment_method', paymentMethod);
      formData.append('order_type', orderType);
      formData.append('delivery_fee', orderType === 'Delivery' ? DELIVERY_FEE : 0);
      if (orderType === 'Dine-in') formData.append('table_number', tableNumber);
      if (orderType === 'Delivery') {
        formData.append('address', address);
        formData.append('landmark', landmark);
        formData.append('contact_number', contactNumber);
        formData.append('notes', notes);
      }
      if (paymentReference) formData.append('payment_reference', paymentReference);
      if (paymentProofFile) formData.append('payment_proof', paymentProofFile);

      const res = await API.post('/orders', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      const createdOrder = res.data;
      toast.success('Order placed successfully!');
      clearCart();
      // Navigate to track page with order number
      if (createdOrder && createdOrder.order_number) {
        navigate(`/track/${createdOrder.order_number}`);
      } else {
        navigate('/');
      }
    } catch (err) {
      console.error(err);
      // Check for stock validation errors
      if (err.response?.data?.out_of_stock?.length > 0) {
        const outOfStock = err.response.data.out_of_stock;
        const names = outOfStock.map(o => o.name || o.product_id).join(', ');
        toast.error(`Out of stock: ${names}`);
      } else if (err.response?.data?.insufficient_stock?.length > 0) {
        const insufficient = err.response.data.insufficient_stock;
        const messages = insufficient.map(i => `${i.name}: ${i.message}`).join(', ');
        toast.error(`Insufficient stock: ${messages}`);
      } else {
        toast.error('Failed to place order');
      }
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=DM+Sans:wght@300;400;500;600&display=swap');

        .checkout-container {
          min-height: calc(100vh - 72px);
          padding: 48px 36px;
          background: linear-gradient(135deg, #FAF7F2 0%, #F5EFE7 100%);
          color: #2B2320;
          font-family: 'DM Sans', sans-serif;
        }

        .checkout-content {
          max-width: 720px;
          margin: 0 auto;
        }

        .checkout-content h1 {
          font-family: 'Playfair Display', serif;
          color: #2D5016;
          margin-bottom: 12px;
          font-size: 36px;
          font-weight: 700;
        }

        .checkout-subtitle {
          color: #5C524A;
          margin-bottom: 28px;
          font-size: 14px;
        }

        .checkout-form {
          width: 100%;
          box-sizing: border-box;
          background: white;
          padding: 32px;
          border-radius: 18px;
          border: 1px solid #EBE0D1;
          box-shadow: 0 8px 32px rgba(45, 80, 22, 0.08);
        }

        .form-group {
          margin-bottom: 20px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .form-group label {
          font-size: 12px;
          color: #2D5016;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          font-weight: 600;
        }

        .form-group input,
        .form-group select,
        .form-group textarea {
          width: 100%;
          box-sizing: border-box;
          padding: 12px 14px;
          border-radius: 10px;
          border: 1.5px solid #EBE0D1;
          background: rgba(212, 132, 78, 0.02);
          color: #2B2320;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          transition: all 0.2s;
        }

        .form-group input:focus,
        .form-group select:focus,
        .form-group textarea:focus {
          outline: none;
          border-color: #D4844E;
          background: rgba(212, 132, 78, 0.06);
          box-shadow: 0 0 0 3px rgba(212, 132, 78, 0.08);
        }

        .form-group input::placeholder,
        .form-group textarea::placeholder {
          color: rgba(92, 82, 74, 0.5);
        }

        .form-divider {
          height: 1px;
          background: #EBE0D1;
          margin: 28px 0;
        }

        .order-summary {
          background: linear-gradient(135deg, #FAF7F2 0%, #F5EFE7 100%);
          padding: 18px;
          border-radius: 12px;
          border: 1px solid #EBE0D1;
          margin-bottom: 24px;
        }

        .order-summary h3 {
          margin: 0 0 8px;
          font-family: 'Playfair Display', serif;
          color: #2D5016;
          font-size: 20px;
          font-weight: 700;
        }

        .order-summary small {
          display: block;
          color: #5C524A;
          margin-top: 6px;
          font-size: 12px;
        }

        .btn-primary {
          width: 100%;
          padding: 16px 24px;
          background: linear-gradient(135deg, #2D5016, #4A7C2E);
          color: white;
          border-radius: 12px;
          border: none;
          cursor: pointer;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          font-size: 13px;
          transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
          box-shadow: 0 8px 24px rgba(45, 80, 22, 0.2);
        }

        .btn-primary:hover {
          background: linear-gradient(135deg, #1F3710, #2D5016);
          transform: translateY(-2px);
          box-shadow: 0 12px 32px rgba(45, 80, 22, 0.3);
        }

        .btn-primary:active {
          transform: translateY(0);
        }

        .conditional-section {
          background: rgba(212, 132, 78, 0.04);
          padding: 16px;
          border-radius: 12px;
          border-left: 3px solid #D4844E;
          margin-bottom: 20px;
        }

        @media (max-width: 768px) {
          .checkout-container {
            padding: 32px 24px;
          }

          .checkout-content h1 {
            font-size: 28px;
          }

          .checkout-form {
            padding: 24px;
          }

          .form-group input,
          .form-group select,
          .form-group textarea {
            font-size: 16px;
            padding: 14px;
          }
        }

        @media (max-width: 480px) {
          .checkout-container {
            padding: 24px 16px;
          }

          .checkout-content h1 {
            font-size: 24px;
          }

          .checkout-form {
            padding: 18px;
          }

          .form-group {
            margin-bottom: 16px;
          }

          .btn-primary {
            padding: 14px 20px;
            font-size: 12px;
          }
        }
      `}</style>

      <div className="checkout-container">
        <div className="checkout-content">
          <h1>Checkout</h1>
          <p className="checkout-subtitle">Complete your order by providing your details below</p>
        <form onSubmit={handleCheckout} className="checkout-form">
          <div className="form-group">
            <label>Customer Name</label>
            <input 
              type="text" 
              value={customerName} 
              onChange={(e) => setCustomerName(e.target.value)} 
              required 
            />
          </div>

          <div className="form-group">
            <label>Order Type</label>
            <select value={orderType} onChange={(e) => setOrderType(e.target.value)}>
              <option value="Pickup">Pickup</option>
              <option value="Dine-in">Dine-in</option>
              <option value="Delivery">Delivery</option>
            </select>
          </div>

          {orderType === 'Dine-in' && (
            <div className="form-group">
              <label>Table Number</label>
              <input type="text" value={tableNumber} onChange={(e) => setTableNumber(e.target.value)} required />
            </div>
          )}

          {orderType === 'Delivery' && (
            <>
              <div className="form-group">
                <label>Contact Number</label>
                <input type="text" value={contactNumber} onChange={(e) => setContactNumber(e.target.value)} required />
              </div>
              <div className="form-group">
                <label>Complete Address</label>
                <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} required />
              </div>
              <div className="form-group">
                <label>Landmark</label>
                <input type="text" value={landmark} onChange={(e) => setLandmark(e.target.value)} required />
              </div>
              <div className="form-group">
                <label>Notes (optional)</label>
                <textarea value={notes} onChange={(e) => setNotes(e.target.value)} />
              </div>
            </>
          )}

          <div className="form-group">
            <label>Payment Method</label>
            <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
              <option value="Cash on Delivery">Cash on Delivery</option>
              <option value="GCash">GCash</option>
              <option value="Maya">Maya</option>
              <option value="Card">Card</option>
            </select>
          </div>

          {(paymentMethod === 'GCash' || paymentMethod === 'Maya' || paymentMethod === 'Card') && (
            <>
              <div className="form-group">
                <label>Reference Number</label>
                <input type="text" value={paymentReference} onChange={(e) => setPaymentReference(e.target.value)} required />
              </div>
              <div className="form-group">
                <label>Upload Payment Screenshot</label>
                <input type="file" accept="image/*" onChange={(e) => setPaymentProofFile(e.target.files[0])} required />
              </div>
            </>
          )}
          <div className="order-summary">
            <h3>Order Total: {formatCurrencyPHP(calculateTotal())}</h3>
            {orderType === 'Delivery' && (
              <small style={{ display: 'block', color: 'rgba(232,201,122,0.7)', marginTop: 4 }}>
                (Includes delivery fee: {formatCurrencyPHP(DELIVERY_FEE)})
              </small>
            )}
          </div>
          <button type="submit" className="btn-primary">Place Order</button>
        </form>
        </div>
      </div>
    </>
  );
};

export default Checkout;
