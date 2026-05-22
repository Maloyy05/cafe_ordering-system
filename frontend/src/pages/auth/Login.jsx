import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(username, password);
      toast.success('Signed in successfully');
      navigate('/');
    } catch (err) {
      const message = err?.response?.data?.message || 'Sign in failed. Check credentials.';
      toast.error(message);
    }
  };

  return (
    <div className="login-page container">
      <div className="hero-left">
        <div className="hero-curves" aria-hidden />
        <div className="hero-content">
          <div className="feature-pill">Premium Quality</div>
          <h1 className="brand-title">MJ's Cafe</h1>
          <div className="subtitle">Where craft meets hospitality — run your café with warmth and precision.</div>

          <div className="hero-illustration">
            <div className="coffee-machine" aria-hidden />
            <div className="decor-plant" aria-hidden />
          </div>

          <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
            <button className="btn-primary">Staff Portal</button>
            <button className="btn-add" style={{ background: 'transparent', color: 'var(--forest-green-dark)', border: '1px solid #efe7de' }}>Learn More</button>
          </div>
        </div>
      </div>

      <aside className="login-card" aria-label="Sign in">
        <h3>Welcome Back!</h3>
        <p className="lead">Sign in to continue to MJ's Cafe Management System</p>

        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <label htmlFor="username">Username</label>
            <input id="username" type="text" value={username} onChange={(e) => setUsername(e.target.value)} required />
          </div>

          <div className="form-row">
            <label htmlFor="password">Password</label>
            <div style={{ position: 'relative' }}>
              <input id="password" type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} required />
              <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: 8, top: 8, background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }} aria-label="Toggle password visibility">{showPassword ? 'Hide' : 'Show'}</button>
            </div>
          </div>

          <div className="login-actions">
            <label className="remember"><input type="checkbox" /> Remember me</label>
            <a href="#" style={{ marginLeft: 'auto', color: 'var(--warm-orange-light)', fontSize: 13 }}>Forgot password?</a>
          </div>

          <div style={{ marginTop: 18 }}>
            <button type="submit" className="btn-signin">Sign in</button>
          </div>

          <div className="or-divider">OR</div>
          <a href="/" className="alt-link">Go to Landing Page</a>
        </form>
      </aside>
    </div>
  );
}
