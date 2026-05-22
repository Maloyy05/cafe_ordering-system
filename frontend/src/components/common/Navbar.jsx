import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { CartContext } from '../../context/CartContext';
import { FaShoppingCart, FaUser, FaSignOutAlt } from 'react-icons/fa';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const { cart } = useContext(CartContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=DM+Sans:wght@300;400;500;600&display=swap');

        .navbar {
          background: linear-gradient(135deg, #FFFBF7 0%, #FAF7F2 100%);
          border-bottom: 2px solid #EBE0D1;
          padding: 16px 32px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-family: 'DM Sans', sans-serif;
          position: sticky;
          top: 0;
          z-index: 1000;
          box-shadow: 0 8px 28px rgba(45, 80, 22, 0.08);
          backdrop-filter: blur(10px);
        }

        .nav-brand a {
          font-family: 'Playfair Display', serif;
          font-size: 26px;
          font-weight: 700;
          color: #2D5016;
          text-decoration: none;
          letter-spacing: 0.02em;
          transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
          display: flex;
          align-items: center;
          gap: 10px;
          position: relative;
        }

        .nav-brand a::before {
          content: '';
          position: absolute;
          inset: -8px;
          background: radial-gradient(circle at 30% 30%, rgba(212, 132, 78, 0.1) 0%, transparent 70%);
          border-radius: 12px;
          opacity: 0;
          transition: opacity 0.3s;
          z-index: -1;
        }

        .nav-brand a:hover {
          color: #D4844E;
          transform: scale(1.05);
        }

        .nav-brand a:hover::before {
          opacity: 1;
        }

        .nav-links {
          display: flex;
          gap: 36px;
          align-items: center;
        }

        .nav-links a {
          font-size: 13px;
          font-weight: 600;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          color: #5C524A;
          text-decoration: none;
          transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
          position: relative;
          padding: 8px 12px;
          border-radius: 8px;
        }

        .nav-links a::after {
          content: '';
          position: absolute;
          bottom: -2px;
          left: 50%;
          width: 0;
          height: 2px;
          background: linear-gradient(90deg, #2D5016, #D4844E);
          transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
          transform: translateX(-50%);
        }

        .nav-links a:hover {
          color: #2D5016;
          background: rgba(45, 80, 22, 0.04);
        }

        .nav-links a:hover::after {
          width: 100%;
        }

        .cart-link {
          position: relative;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 10px 16px;
          border-radius: 12px;
          background: rgba(212, 132, 78, 0.08);
          transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
          color: #D4844E;
          border: 1px solid rgba(212, 132, 78, 0.3);
          font-weight: 600;
          backdrop-filter: blur(4px);
        }

        .cart-link svg {
          width: 20px;
          height: 20px;
          color: inherit;
          transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .cart-link:hover {
          background: rgba(212, 132, 78, 0.15);
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(212, 132, 78, 0.15);
          border-color: rgba(212, 132, 78, 0.5);
        }

        .cart-link:hover svg {
          transform: scale(1.15);
        }

        .cart-count {
          position: absolute;
          top: -8px;
          right: -8px;
          background: linear-gradient(135deg, #D4844E, #C9A961);
          color: white;
          min-width: 20px;
          height: 20px;
          padding: 0 6px;
          border-radius: 12px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: 700;
          border: 2px solid white;
          box-shadow: 0 4px 12px rgba(212, 132, 78, 0.2);
          animation: pulse-cart 2s cubic-bezier(0.34, 1.56, 0.64, 1) infinite;
        }

        @keyframes pulse-cart {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }

        .user-info {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 13px;
          color: #5C524A;
          padding: 10px 18px;
          border-left: 2px solid #EBE0D1;
          font-weight: 500;
          transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .user-info:hover {
          color: #2D5016;
        }

        .logout-btn {
          background: rgba(45, 80, 22, 0.08);
          border: 1px solid rgba(45, 80, 22, 0.2);
          border-radius: 10px;
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #2D5016;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
          font-size: 16px;
          backdrop-filter: blur(4px);
        }

        .logout-btn:hover {
          background: rgba(212, 132, 78, 0.12);
          border-color: rgba(212, 132, 78, 0.4);
          color: #D4844E;
          transform: translateY(-2px) rotate(5deg);
          box-shadow: 0 8px 20px rgba(212, 132, 78, 0.15);
        }

        @media (max-width: 768px) {
          .navbar {
            padding: 14px 18px;
            gap: 16px;
          }

          .nav-brand a {
            font-size: 22px;
          }

          .nav-links {
            gap: 20px;
            flex-wrap: wrap;
          }

          .nav-links a {
            font-size: 12px;
          }

          .user-info {
            font-size: 12px;
            padding: 8px 14px;
          }
        }

        @media (max-width: 480px) {
          .navbar {
            padding: 12px 14px;
            flex-direction: column;
            gap: 12px;
          }

          .nav-links {
            width: 100%;
            justify-content: center;
            gap: 12px;
            flex-wrap: wrap;
          }

          .nav-links a {
            font-size: 10px;
          }
        }
      `}</style>

      <nav className="navbar">
        <div className="nav-brand">
          <Link to="/">MJ's Cafe</Link>
        </div>
        <div className="nav-links">
          {/* Show Menu/Cart only to customers (unauthenticated users or users without admin/staff roles) */}
          {(!user || (user && !['admin', 'staff'].includes(user.role))) && (
            <>
              <Link to="/menu">Menu</Link>
              <Link to="/about">About Us</Link>
              <Link to="/cart" className="cart-link">
                <FaShoppingCart />
                {cart.length > 0 && <span className="cart-count">{cart.length}</span>}
              </Link>
              <Link to="/track">Track Order</Link>
            </>
          )}
          
          {user ? (
            <>
              {user.role === 'admin' && <Link to="/admin">Admin</Link>}
              {user.role === 'staff' && <Link to="/staff">Staff</Link>}
              <span className="user-info"><FaUser /> {user.name}</span>
              <button onClick={handleLogout} className="logout-btn"><FaSignOutAlt /></button>
            </>
          ) : (
            <Link to="/login">Login</Link>
          )}
        </div>
      </nav>
    </>
  );
};

export default Navbar;
