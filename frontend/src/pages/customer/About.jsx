import React from 'react';
import { Link } from 'react-router-dom';

const About = () => {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=DM+Sans:wght@300;400;500;600&display=swap');

        .about-container {
          background: linear-gradient(135deg, #FAF7F2 0%, #F5EFE7 100%);
          min-height: calc(100vh - 72px);
          padding: 48px 36px;
          font-family: 'DM Sans', sans-serif;
        }

        .about-hero {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 40px;
          margin-bottom: 48px;
          max-width: 1200px;
          margin-left: auto;
          margin-right: auto;
        }

        .about-title {
          font-family: 'Playfair Display', serif;
          color: #2D5016;
          font-size: 42px;
          margin: 0;
          font-weight: 700;
          letter-spacing: -0.02em;
        }

        .about-sub {
          color: #5C524A;
          margin-top: 12px;
          max-width: 480px;
          line-height: 1.8;
          font-size: 15px;
        }

        .hero-buttons {
          display: flex;
          gap: 12px;
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
          border: none;
          cursor: pointer;
          box-shadow: 0 8px 24px rgba(45, 80, 22, 0.2);
        }

        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 32px rgba(45, 80, 22, 0.3);
          background: linear-gradient(135deg, #1F3710, #2D5016);
        }

        .profiles {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 28px;
          max-width: 1200px;
          margin-left: auto;
          margin-right: auto;
        }

        .card {
          background: white;
          border: 1px solid #EBE0D1;
          padding: 28px;
          border-radius: 16px;
          display: flex;
          gap: 20px;
          align-items: flex-start;
          box-shadow: 0 8px 28px rgba(45, 80, 22, 0.06);
          transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .card:hover {
          transform: translateY(-4px);
          box-shadow: 0 16px 48px rgba(45, 80, 22, 0.12);
          border-color: rgba(212, 132, 78, 0.2);
        }

        .avatar {
          width: 100px;
          height: 100px;
          border-radius: 12px;
          object-fit: cover;
          border: 2px solid #EBE0D1;
          box-shadow: 0 8px 20px rgba(45, 80, 22, 0.1);
          flex-shrink: 0;
        }

        .meta h3 {
          margin: 0;
          color: #2D5016;
          font-family: 'Playfair Display', serif;
          font-size: 18px;
          font-weight: 700;
        }

        .meta p {
          margin: 8px 0 0;
          color: #5C524A;
          font-size: 13px;
          line-height: 1.6;
        }

        @media (max-width: 1024px) {
          .about-hero {
            flex-direction: column;
            align-items: flex-start;
            gap: 28px;
            margin-bottom: 40px;
          }

          .hero-buttons {
            width: 100%;
          }

          .btn-primary {
            flex: 1;
          }
        }

        @media (max-width: 768px) {
          .about-container {
            padding: 32px 24px;
          }

          .about-title {
            font-size: 32px;
          }

          .about-sub {
            max-width: none;
            font-size: 14px;
          }

          .profiles {
            grid-template-columns: 1fr;
            gap: 20px;
          }

          .card {
            padding: 20px;
            gap: 16px;
          }

          .avatar {
            width: 80px;
            height: 80px;
          }

          .meta h3 {
            font-size: 16px;
          }

          .meta p {
            font-size: 12px;
          }
        }

        @media (max-width: 480px) {
          .about-container {
            padding: 24px 16px;
          }

          .about-title {
            font-size: 26px;
          }

          .profiles {
            gap: 16px;
          }

          .card {
            padding: 16px;
            flex-direction: column;
            align-items: center;
            text-align: center;
          }

          .avatar {
            width: 70px;
            height: 70px;
          }

          .hero-buttons {
            width: 100%;
            flex-direction: column;
          }

          .btn-primary {
            width: 100%;
            text-align: center;
          }
        }
      `}</style>

      <div className="about-container">
        <div className="about-hero">
          <div>
            <h1 className="about-title">About MJ's Cafe</h1>
            <p className="about-sub">MJ’s Café Management System is created by passionate students who aim to elevate café experiences by combining user-friendly technology with warm and efficient service.</p>
          </div>
          <div className="hero-buttons">
            <Link to="/menu" className="btn-primary">Explore Menu</Link>
          </div>
        </div>

        <div className="profiles">
          <div className="card">
            <img src="/images/malou.jpg" alt="Malou T. Astronomo" className="avatar" />
            <div className="meta">
              <h3>Malou T. Astronomo</h3>
              <p>Full-Stack Developer | 3rd Year CS Student. Passionate about creating seamless web experiences, intuitive UI/UX design, and building solutions that delight customers.</p>
            </div>
          </div>

          <div className="card">
            <img src="/images/nhel.png" alt="Jean Nhel Rolida" className="avatar" />
            <div className="meta">
              <h3>Jean Nhel L. Rolida</h3>
              <p>Frontend Specialist | 3rd Year CS Student. Focused on crafting beautiful, accessible interfaces and ensuring consistency across all user touchpoints.</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default About;
