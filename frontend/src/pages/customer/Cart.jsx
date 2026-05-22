import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { CartContext } from '../../context/CartContext';
import { FaTrash } from 'react-icons/fa';
import formatCurrencyPHP from '../../utils/currency';

const Cart = () => {
  const { cart, removeFromCart, totalAmount } = useContext(CartContext);

  if (cart.length === 0) {
    return (
      <>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=DM+Sans:wght@300;400;500;600&display=swap');

          .empty-cart {
            min-height: calc(100vh - 72px);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 24px;
            background: linear-gradient(135deg, #FAF7F2 0%, #F5EFE7 100%);
            color: #2B2320;
            padding: 48px 28px;
            font-family: 'DM Sans', sans-serif;
            text-align: center;
            position: relative;
            overflow: hidden;
          }

          .empty-cart::before {
            content: '';
            position: absolute;
            top: -50%;
            right: -50%;
            width: 500px;
            height: 500px;
            border-radius: 50%;
            background: radial-gradient(circle, rgba(212, 132, 78, 0.1) 0%, transparent 70%);
            pointer-events: none;
            animation: float 6s ease-in-out infinite;
          }

          .empty-cart-icon {
            font-size: 80px;
            margin-bottom: 16px;
            animation: bounce 2s cubic-bezier(0.34, 1.56, 0.64, 1) infinite;
            position: relative;
            z-index: 1;
          }

          @keyframes bounce {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-20px); }
          }

          .empty-cart h2 {
            color: #2D5016;
            font-family: 'Playfair Display', serif;
            font-size: 32px;
            margin: 0;
            font-weight: 700;
            position: relative;
            z-index: 1;
          }

          .empty-cart p {
            color: #5C524A;
            font-size: 16px;
            margin: 0;
            max-width: 400px;
            line-height: 1.6;
            position: relative;
            z-index: 1;
          }

          .btn-primary {
            padding: 14px 32px;
            background: linear-gradient(135deg, #2D5016, #4A7C2E);
            color: white;
            border-radius: 12px;
            text-decoration: none;
            font-weight: 700;
            font-size: 13px;
            letter-spacing: 0.05em;
            text-transform: uppercase;
            transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
            display: inline-block;
            box-shadow: 0 8px 24px rgba(45, 80, 22, 0.2);
            position: relative;
            z-index: 1;
            overflow: hidden;
          }

          .btn-primary::before {
            content: '';
            position: absolute;
            inset: 0;
            background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
            transform: translateX(-100%);
            transition: transform 0.6s ease;
          }

          .btn-primary:hover {
            transform: translateY(-2px);
            box-shadow: 0 12px 32px rgba(45, 80, 22, 0.3);
            background: linear-gradient(135deg, #1F3710, #2D5016);
          }

          .btn-primary:hover::before {
            transform: translateX(100%);
          }
        `}</style>

        <div className="empty-cart">
          <div className="empty-cart-icon">🛒</div>
          <h2>Your cart is empty</h2>
          <p>Start exploring our menu and add some delicious items</p>
          <Link to="/menu" className="btn-primary">Continue Shopping</Link>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=DM+Sans:wght@300;400;500;600&display=swap');

        .cart-container {
          min-height: calc(100vh - 72px);
          padding: 48px 36px;
          background: linear-gradient(135deg, #FAF7F2 0%, #F5EFE7 100%);
          color: #2B2320;
          font-family: 'DM Sans', sans-serif;
          position: relative;
          overflow: hidden;
        }

        .cart-container::before {
          content: '';
          position: absolute;
          top: -30%;
          right: -20%;
          width: 500px;
          height: 500px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(212, 132, 78, 0.08) 0%, transparent 70%);
          pointer-events: none;
          animation: float 8s ease-in-out infinite;
        }

        .cart-content {
          max-width: 700px;
          margin: 0 auto;
          position: relative;
          z-index: 1;
        }

        .cart-content h1 {
          font-family: 'Playfair Display', serif;
          color: #2D5016;
          margin-bottom: 8px;
          font-size: 36px;
          font-weight: 700;
          transition: color 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .cart-subtitle {
          color: #5C524A;
          margin-bottom: 32px;
          font-size: 14px;
          transition: color 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .cart-items {
          display: flex;
          flex-direction: column;
          gap: 16px;
          margin-bottom: 28px;
          animation: fadeInUp 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .cart-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: white;
          border: 1px solid #EBE0D1;
          padding: 18px;
          border-radius: 14px;
          box-shadow: 0 4px 16px rgba(45, 80, 22, 0.06);
          transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
          backdrop-filter: blur(8px);
          position: relative;
        }

        .cart-item::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.05), transparent);
          border-radius: 14px;
          opacity: 0;
          transition: opacity 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
          pointer-events: none;
        }

        .cart-item:hover {
          box-shadow: 0 12px 32px rgba(45, 80, 22, 0.12);
          border-color: rgba(212, 132, 78, 0.3);
          transform: translateY(-2px);
        }

        .cart-item:hover::before {
          opacity: 1;
        }

        .item-info {
          flex: 1;
          position: relative;
          z-index: 1;
        }

        .item-info h3 {
          margin: 0;
          font-size: 16px;
          color: #2D5016;
          font-weight: 700;
          transition: color 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .cart-item:hover .item-info h3 {
          color: #D4844E;
        }

        .item-info p {
          margin: 6px 0 0;
          color: #5C524A;
          font-size: 13px;
          transition: color 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .item-actions {
          display: flex;
          gap: 16px;
          align-items: center;
          position: relative;
          z-index: 1;
        }

        .item-price {
          font-weight: 700;
          color: #2D5016;
          font-size: 16px;
          min-width: 80px;
          text-align: right;
          transition: color 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .cart-item:hover .item-price {
          color: #D4844E;
        }

        .btn-delete {
          background: rgba(231, 76, 60, 0.08);
          border: 1px solid rgba(231, 76, 60, 0.2);
          color: #E74C3C;
          padding: 10px 14px;
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
          display: flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          font-size: 14px;
        }

        .btn-delete:hover {
          background: rgba(231, 76, 60, 0.15);
          border-color: rgba(231, 76, 60, 0.5);
          transform: scale(1.05) rotate(-5deg);
          box-shadow: 0 6px 16px rgba(231, 76, 60, 0.15);
        }

        .cart-divider {
          height: 2px;
          background: linear-gradient(90deg, transparent, #EBE0D1, transparent);
          margin: 24px 0;
        }

        .cart-summary {
          background: white;
          border: 2px solid #EBE0D1;
          border-radius: 16px;
          padding: 24px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
          box-shadow: 0 12px 32px rgba(45, 80, 22, 0.08);
          backdrop-filter: blur(8px);
          transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
          animation: slideInUp 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) 0.2s both;
        }

        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .cart-summary:hover {
          border-color: rgba(212, 132, 78, 0.3);
          box-shadow: 0 16px 40px rgba(45, 80, 22, 0.12);
        }

        .cart-summary h2 {
          margin: 0;
          font-family: 'Playfair Display', serif;
          color: #2D5016;
          font-size: 24px;
          font-weight: 700;
          transition: color 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .cart-summary:hover h2 {
          color: #D4844E;
        }

        @media (max-width: 768px) {
          .cart-container {
            padding: 32px 24px;
          }

          .cart-content h1 {
            font-size: 28px;
          }

          .cart-summary {
            flex-direction: column;
            align-items: stretch;
          }

          .cart-summary h2 {
            text-align: center;
          }

          .btn-primary {
            width: 100%;
            min-width: auto;
          }
        }

        @media (max-width: 480px) {
          .cart-container {
            padding: 24px 16px;
          }

          .cart-content h1 {
            font-size: 24px;
          }

          .cart-item {
            flex-direction: column;
            align-items: flex-start;
            gap: 12px;
          }

          .item-actions {
            width: 100%;
            justify-content: space-between;
          }

          .item-price {
            text-align: left;
          }

          .cart-summary {
            padding: 18px;
          }

          .cart-summary h2 {
            font-size: 20px;
            text-align: center;
            width: 100%;
            margin-bottom: 12px;
          }

          .btn-primary {
            width: 100%;
          }
        }
      `}</style>

      <div className="cart-container">
        <div className="cart-content">
          <h1>Your Cart</h1>
          <p className="cart-subtitle">{cart.length} item{cart.length !== 1 ? 's' : ''} in your cart</p>

          <div className="cart-items">
            {cart.map((item) => (
              <div key={item.id} className="cart-item">
                <div className="item-info">
                  <h3>{item.name}</h3>
                  <p>{formatCurrencyPHP(item.price)} × {item.quantity} = {formatCurrencyPHP(item.price * item.quantity)}</p>
                </div>
                <div className="item-actions">
                  <button onClick={() => removeFromCart(item.id)} className="btn-delete" title="Remove from cart">
                    <FaTrash />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="cart-divider" />

          <div className="cart-summary">
            <h2>Total: {formatCurrencyPHP(totalAmount)}</h2>
            <Link to="/checkout" className="btn-primary">Checkout</Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default Cart;
