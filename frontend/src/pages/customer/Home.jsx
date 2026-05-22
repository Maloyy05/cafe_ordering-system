import React from 'react';
import { useNavigate } from 'react-router-dom';
import Menu from './Menu';

const Home = () => {
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = React.useState(false);

  const handleExploreMenu = () => {
    setShowMenu(true);
  };

  if (showMenu) {
    return <Menu />;
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=DM+Sans:wght@300;400;500;600&display=swap');

        .home-hero {
          background: linear-gradient(135deg, #FAF7F2 0%, #F5EFE7 100%);
          min-height: calc(100vh - 72px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px 24px;
          box-sizing: border-box;
          position: relative;
          overflow: hidden;
        }

        .home-hero::before {
          content: '';
          position: absolute;
          top: -40%;
          right: -20%;
          width: 600px;
          height: 600px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(45, 80, 22, 0.04) 0%, transparent 70%);
          pointer-events: none;
        }

        .home-hero::after {
          content: '';
          position: absolute;
          bottom: -30%;
          left: -10%;
          width: 500px;
          height: 500px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(212, 132, 78, 0.03) 0%, transparent 70%);
          pointer-events: none;
        }

        .hero-content {
          max-width: 1200px;
          width: 100%;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 60px;
          align-items: center;
          position: relative;
          z-index: 1;
        }

        .hero-left {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .hero-eyebrow {
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: #D4844E;
        }

        .hero-title {
          font-family: 'Playfair Display', serif;
          font-size: 56px;
          font-weight: 700;
          color: #2D5016;
          line-height: 1.2;
          letter-spacing: -0.02em;
        }

        .hero-subtitle {
          font-family: 'Playfair Display', serif;
          font-style: italic;
          font-size: 18px;
          color: #5C524A;
          line-height: 1.6;
          font-weight: 400;
        }

        .hero-description {
          font-size: 15px;
          color: #5C524A;
          line-height: 1.8;
          max-width: 480px;
        }

        .hero-features {
          display: flex;
          flex-direction: column;
          gap: 16px;
          margin-top: 12px;
        }

        .hero-feature {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .hero-feature-icon {
          width: 32px;
          height: 32px;
          border-radius: 10px;
          background: rgba(45, 80, 22, 0.08);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #2D5016;
          font-size: 16px;
          flex-shrink: 0;
        }

        .hero-feature-text {
          font-size: 14px;
          color: #2B2320;
          font-weight: 500;
        }

        .hero-cta {
          display: flex;
          gap: 16px;
          margin-top: 20px;
          flex-wrap: wrap;
        }

        .btn-hero-primary {
          padding: 16px 36px;
          background: linear-gradient(135deg, #2D5016, #4A7C2E);
          border: none;
          border-radius: 14px;
          color: white;
          font-weight: 700;
          font-size: 15px;
          letter-spacing: 0.03em;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
          box-shadow: 0 12px 32px rgba(45, 80, 22, 0.2);
          text-transform: uppercase;
        }

        .btn-hero-primary:hover {
          transform: translateY(-4px);
          box-shadow: 0 16px 48px rgba(45, 80, 22, 0.3);
          background: linear-gradient(135deg, #1F3710, #2D5016);
        }

        .btn-hero-secondary {
          padding: 16px 36px;
          background: white;
          border: 2px solid #2D5016;
          border-radius: 14px;
          color: #2D5016;
          font-weight: 700;
          font-size: 15px;
          letter-spacing: 0.03em;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
          box-shadow: 0 8px 24px rgba(45, 80, 22, 0.08);
          text-transform: uppercase;
        }

        .btn-hero-secondary:hover {
          background: rgba(45, 80, 22, 0.04);
          transform: translateY(-4px);
          box-shadow: 0 12px 32px rgba(45, 80, 22, 0.15);
        }

        .hero-right {
          position: relative;
          height: 500px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .hero-visual {
          position: relative;
          width: 100%;
          height: 100%;
        }

        .coffee-machine {
          position: absolute;
          width: 280px;
          height: 320px;
          background: linear-gradient(135deg, #2D5016 0%, #4A7C2E 100%);
          border-radius: 20px;
          box-shadow: 0 24px 64px rgba(45, 80, 22, 0.2), inset 0 1px 20px rgba(255, 255, 255, 0.1);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 120px;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          border: 1px solid rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(8px);
          transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .coffee-machine:hover {
          transform: translate(-50%, -55%);
          box-shadow: 0 32px 80px rgba(45, 80, 22, 0.3), inset 0 1px 20px rgba(255, 255, 255, 0.15);
        }

        .hanging-lamp {
          position: absolute;
          width: 60px;
          height: 80px;
          background: linear-gradient(180deg, #1F3710 0%, #2D5016 100%);
          border-radius: 0 0 16px 16px;
          top: -30px;
          left: 50%;
          transform: translateX(-50%);
          box-shadow: 0 8px 24px rgba(212, 132, 78, 0.2), inset 0 1px 12px rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(212, 132, 78, 0.15);
          display: flex;
          align-items: flex-end;
          justify-content: center;
          padding-bottom: 8px;
          animation: sway-lamp 3s ease-in-out infinite;
        }

        .hanging-lamp::before {
          content: '';
          position: absolute;
          top: -20px;
          left: 50%;
          width: 2px;
          height: 20px;
          background: linear-gradient(180deg, rgba(212, 132, 78, 0.4), rgba(212, 132, 78, 0.1));
          transform: translateX(-50%);
        }

        .lamp-light {
          position: absolute;
          width: 100px;
          height: 100px;
          background: radial-gradient(circle, rgba(212, 132, 78, 0.2) 0%, transparent 70%);
          border-radius: 50%;
          top: -40px;
          left: 50%;
          transform: translateX(-50%);
          pointer-events: none;
        }

        @keyframes sway-lamp {
          0%, 100% { transform: translateX(-50%) rotateZ(0deg); }
          50% { transform: translateX(-50%) rotateZ(1.5deg); }
        }

        .decoration-top {
          position: absolute;
          top: -40px;
          left: 20px;
          font-size: 60px;
          animation: float 3s ease-in-out infinite;
        }

        .decoration-left {
          position: absolute;
          left: -30px;
          top: 100px;
          font-size: 50px;
          animation: float 4s ease-in-out infinite 0.5s;
        }

        .decoration-right {
          position: absolute;
          right: -20px;
          bottom: 60px;
          font-size: 45px;
          animation: float 3.5s ease-in-out infinite 1s;
        }

        /* Café ambiance lighting */
        .ambiance-light {
          position: absolute;
          border-radius: 50%;
          pointer-events: none;
        }

        .light-1 {
          width: 120px;
          height: 120px;
          background: radial-gradient(circle, rgba(212, 132, 78, 0.1) 0%, transparent 70%);
          top: -30%;
          right: 10%;
        }

        .light-2 {
          width: 100px;
          height: 100px;
          background: radial-gradient(circle, rgba(45, 80, 22, 0.08) 0%, transparent 70%);
          bottom: 10%;
          left: 5%;
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }

        /* Responsive */
        @media (max-width: 1024px) {
          .hero-content {
            grid-template-columns: 1fr;
            gap: 40px;
          }

          .hero-right {
            height: 350px;
          }

          .hero-title {
            font-size: 42px;
          }

          .coffee-machine {
            width: 220px;
            height: 250px;
            font-size: 80px;
          }
        }

        @media (max-width: 768px) {
          .home-hero {
            padding: 32px 20px;
            min-height: auto;
          }

          .hero-content {
            grid-template-columns: 1fr;
            gap: 32px;
          }

          .hero-title {
            font-size: 36px;
          }

          .hero-subtitle {
            font-size: 16px;
          }

          .hero-right {
            height: 280px;
          }

          .coffee-machine {
            width: 180px;
            height: 200px;
            font-size: 60px;
          }

          .decoration-top {
            font-size: 40px;
          }

          .decoration-left {
            font-size: 35px;
          }

          .decoration-right {
            font-size: 30px;
          }
        }

        @media (max-width: 480px) {
          .home-hero {
            padding: 24px 16px;
          }

          .hero-title {
            font-size: 28px;
          }

          .hero-subtitle {
            font-size: 14px;
          }

          .hero-description {
            font-size: 14px;
          }

          .hero-cta {
            flex-direction: column;
          }

          .btn-hero-primary, .btn-hero-secondary {
            width: 100%;
            padding: 14px 24px;
            font-size: 13px;
          }

          .hero-right {
            height: 220px;
          }

          .coffee-machine {
            width: 140px;
            height: 160px;
            font-size: 50px;
          }

          .decoration-top {
            font-size: 30px;
          }

          .decoration-left {
            font-size: 25px;
          }

          .decoration-right {
            font-size: 22px;
          }
        }
      `}</style>

      <div className="home-hero">
        <div className="hero-content">
          <div className="hero-left">
            <span className="hero-eyebrow">Welcome to MJ's Cafe</span>
            <h1 className="hero-title">Premium Coffee Experience</h1>
            <p className="hero-subtitle">
              Where craft meets hospitality — discover your perfect brew
            </p>
            <p className="hero-description">
              Indulge in our carefully curated selection of premium coffee drinks, pastries, and treats. Experience the warmth of hospitality with every visit to our café management system.
            </p>

            <div className="hero-features">
              <div className="hero-feature">
                <div className="hero-feature-icon">☕</div>
                <span className="hero-feature-text">Premium Quality Coffee Beans</span>
              </div>
              <div className="hero-feature">
                <div className="hero-feature-icon">⚡</div>
                <span className="hero-feature-text">Fast & Efficient Service</span>
              </div>
              <div className="hero-feature">
                <div className="hero-feature-icon">🎯</div>
                <span className="hero-feature-text">Seamless Ordering Experience</span>
              </div>
            </div>

            <div className="hero-cta">
              <button className="btn-hero-primary" onClick={handleExploreMenu}>
                Explore Menu
              </button>
              <button className="btn-hero-secondary" onClick={() => navigate('/about')}>
                Learn More
              </button>
            </div>
          </div>

          <div className="hero-right">
            <div className="hero-visual">
              <div className="ambiance-light light-1" />
              <div className="ambiance-light light-2" />
              <div className="hanging-lamp">
                <div className="lamp-light" />
              </div>
              <div className="decoration-top">🪴</div>
              <div className="decoration-left">💡</div>
              <div className="coffee-machine">☕</div>
              <div className="decoration-right">🌿</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
