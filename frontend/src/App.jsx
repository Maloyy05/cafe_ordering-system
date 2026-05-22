import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/queryClient';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { Toaster } from 'react-hot-toast';

// Lazy load pages for better performance
const Login = lazy(() => import('./pages/auth/Login'));
const Home = lazy(() => import('./pages/customer/Home'));
const Menu = lazy(() => import('./pages/customer/Menu'));
const Cart = lazy(() => import('./pages/customer/Cart'));
const Checkout = lazy(() => import('./pages/customer/Checkout'));
const TrackOrder = lazy(() => import('./pages/customer/TrackOrder'));
const About = lazy(() => import('./pages/customer/About'));
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'));
const DeliveryOrders = lazy(() => import('./pages/admin/DeliveryOrders'));
const StaffDashboard = lazy(() => import('./pages/staff/StaffDashboard'));
import Navbar from './components/common/Navbar';

// Loading fallback component
const Loading = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
    <div style={{ color: 'rgba(255,255,255,0.6)' }}>Loading...</div>
  </div>
);

const ProtectedRoute = ({ children, roles }) => {
  const { user, loading } = React.useContext(AuthContext);

  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" />;

  return children;
};

const CustomerRoute = ({ children }) => {
  const { user, loading } = React.useContext(AuthContext);
  if (loading) return <div>Loading...</div>;
  // If logged-in user is admin or staff, redirect them away from customer pages
  if (user && ['admin', 'staff'].includes(user.role)) {
    if (user.role === 'admin') return <Navigate to="/admin" />;
    if (user.role === 'staff') return <Navigate to="/staff" />;
  }
  return children;
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <CartProvider>
          <Router>
          <style>{`
            @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=DM+Sans:wght@300;400;500;600&display=swap');

            :root { 
              --cream-bg: #FAF7F2;
              --cream-secondary: #F5EFE7;
              --beige-accent: #EBE0D1;
              --forest-green: #2D5016;
              --forest-green-dark: #1F3710;
              --forest-green-light: #4A7C2E;
              --warm-orange: #D4844E;
              --warm-orange-light: #E5A870;
              --text-dark: #2B2320;
              --text-secondary: #5C524A;
            }

            .container {
              max-width: 1200px;
              margin: 28px auto;
              padding: 0 24px;
              box-sizing: border-box;
            }

            body { 
              background: linear-gradient(135deg, var(--cream-bg) 0%, var(--cream-secondary) 100%);
              color: var(--text-dark);
              font-family: 'DM Sans', sans-serif;
              min-height: 100vh;
            }

            /* Helper button classes */
            .btn-primary { 
              padding: 11px 24px;
              background: linear-gradient(135deg, var(--forest-green), var(--forest-green-light));
              border-radius: 12px;
              border: none;
              color: white;
              cursor: pointer;
              font-weight: 600;
              transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
              box-shadow: 0 8px 24px rgba(45, 80, 22, 0.15);
            }
            
            .btn-primary:hover {
              background: linear-gradient(135deg, var(--forest-green-dark), var(--forest-green));
              transform: translateY(-2px);
              box-shadow: 0 12px 32px rgba(45, 80, 22, 0.25);
            }
            
            .btn-danger { 
              padding: 11px 24px;
              background: rgba(231, 76, 60, 0.08);
              border-radius: 12px;
              border: 1px solid rgba(231, 76, 60, 0.2);
              color: #E74C3C;
              cursor: pointer;
              font-weight: 600;
              transition: all 0.2s;
            }
            
            .btn-danger:hover {
              background: rgba(231, 76, 60, 0.12);
              border-color: rgba(231, 76, 60, 0.4);
            }
          `}</style>
          <Navbar />
          <div className="container">
            <Suspense fallback={<Loading />}>
              <Routes>
              {/* Customer Routes */}
              <Route path="/" element={<CustomerRoute><Home /></CustomerRoute>} />
              <Route path="/menu" element={<CustomerRoute><Menu /></CustomerRoute>} />
              
              <Route path="/about" element={<CustomerRoute><About /></CustomerRoute>} />
              <Route path="/cart" element={<CustomerRoute><Cart /></CustomerRoute>} />
              <Route path="/checkout" element={<CustomerRoute><Checkout /></CustomerRoute>} />
              <Route path="/track" element={<CustomerRoute><TrackOrder /></CustomerRoute>} />
              <Route path="/track/:orderNumber" element={<CustomerRoute><TrackOrder /></CustomerRoute>} />
              
              {/* Auth Routes */}
              <Route path="/login" element={<Login />} />

              {/* Admin Routes */}
              <Route 
                path="/admin/*" 
                element={
                  <ProtectedRoute roles={['admin']}>
                    <AdminDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route
                path="/admin/deliveries"
                element={
                  <ProtectedRoute roles={['admin']}>
                    <DeliveryOrders />
                  </ProtectedRoute>
                }
              />

              {/* Staff Routes */}
              <Route 
                path="/staff/*" 
                element={
                  <ProtectedRoute roles={['staff', 'admin']}>
                    <StaffDashboard />
                  </ProtectedRoute>
                } 
              />
            </Routes>
            </Suspense>
          </div>
          <Toaster position="top-right" />
        </Router>
      </CartProvider>
    </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
