import React from 'react';
import { Link } from 'react-router-dom';

const About = () => {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=Inter:wght@300;400;600&display=swap');

        :root{
          --bg: #f8f7f4;
          --green: #1f5c3f;
          --green-2: #2d6b4a;
          --brown: #d4a373;
          --card: #ffffff;
          --muted: #6b6b6b;
        }

        *{box-sizing:border-box}
        body{margin:0}

        .page-wrap{
          background: var(--bg);
          min-height:100vh;
          font-family: Inter, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial;
          color: #222;
        }

        /* Sticky modern navbar */
        .nav {
          position: sticky;
          top: 0;
          z-index: 60;
          backdrop-filter: blur(6px) saturate(120%);
          background: rgba(255,255,255,0.6);
          border-bottom: 1px solid rgba(31,92,63,0.06);
        }
        .nav-inner{
          max-width:1200px;margin:0 auto;display:flex;align-items:center;gap:16px;padding:14px 20px;
        }
        .logo{font-family:'Playfair Display', serif;color:var(--green);font-weight:700;font-size:20px}
        .nav-links{flex:1;display:flex;justify-content:center;gap:28px}
        .nav-links a{color:var(--green);text-decoration:none;font-weight:600;opacity:.9}
        .nav-actions{display:flex;gap:12px;align-items:center}
        .btn-ghost{background:transparent;border:1px solid rgba(31,92,63,0.08);padding:8px 14px;border-radius:10px;color:var(--green);font-weight:600}
        .btn-solid{background:linear-gradient(180deg,var(--green),var(--green-2));color:white;padding:10px 16px;border-radius:12px;border:none;font-weight:700}

        .container{max-width:1200px;margin:0 auto;padding:56px 20px}

        /* Hero */
        .hero{display:flex;align-items:center;gap:40px;padding:12px}
        .hero-left{flex:1}
        .hero-right{flex:1;display:flex;justify-content:center}
        .kicker{display:inline-block;background:rgba(212,163,115,0.12);color:var(--brown);padding:6px 10px;border-radius:999px;font-weight:600;margin-bottom:18px}
        .hero-title{font-family:'Playfair Display',serif;font-size:48px;color:var(--green);line-height:1.02;margin:0}
        .hero-desc{color:var(--muted);margin-top:16px;max-width:560px;line-height:1.8}
        .hero-ctas{display:flex;gap:12px;margin-top:22px}

        .hero-media{
          width:100%;max-width:520px;border-radius:18px;overflow:hidden;box-shadow:0 20px 50px rgba(31,92,63,0.08);border:1px solid rgba(0,0,0,0.03);
          background:linear-gradient(135deg, rgba(31,92,63,0.04), rgba(212,163,115,0.02));
          min-height:320px;display:flex;align-items:center;justify-content:center;
        }
        .hero-media img{width:100%;height:100%;object-fit:cover}

        /* Team */
        .team{margin-top:56px}
        .team-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:22px}
        .team-card{background:var(--card);padding:20px;border-radius:14px;display:flex;gap:18px;align-items:center;box-shadow:0 8px 30px rgba(17,17,17,0.04);transition:transform .28s ease,box-shadow .28s ease}
        .team-card:hover{transform:translateY(-6px);box-shadow:0 22px 48px rgba(31,92,63,0.08)}
        .team-avatar{width:96px;height:96px;border-radius:12px;object-fit:cover;border:1px solid rgba(0,0,0,0.04)}
        .team-meta h4{margin:0;font-family:'Playfair Display',serif;color:var(--green);font-size:18px}
        .role-badge{display:inline-block;background:rgba(31,92,63,0.08);color:var(--green);padding:6px 10px;border-radius:999px;font-weight:600;font-size:12px;margin-top:8px}
        .team-meta p{margin:10px 0 0;color:#555;line-height:1.6}
        .socials{margin-left:auto;display:flex;gap:8px}
        .socials a{width:36px;height:36px;border-radius:8px;display:inline-flex;align-items:center;justify-content:center;background:rgba(31,92,63,0.04);color:var(--green);text-decoration:none}

        /* Features */
        .features{display:flex;gap:18px;margin-top:44px}
        .feature{flex:1;background:linear-gradient(180deg,rgba(255,255,255,0.8),var(--card));padding:22px;border-radius:12px;box-shadow:0 10px 30px rgba(17,17,17,0.04);display:flex;gap:14px;align-items:flex-start}
        .icon-wrap{width:44px;height:44px;border-radius:10px;background:linear-gradient(135deg,var(--green),var(--green-2));display:flex;align-items:center;justify-content:center;color:white}
        .feature h5{margin:0;font-size:16px;color:var(--green);font-weight:700}
        .feature p{margin:6px 0 0;color:#666}

        /* Footer */
        .site-footer{margin-top:64px;padding:28px 0;border-top:1px solid rgba(31,92,63,0.04);display:flex;align-items:center;justify-content:space-between}
        .foot-socials a{margin-left:10px;color:var(--green);text-decoration:none}

        /* Responsive */
        @media (max-width:900px){
          .hero{flex-direction:column}
          .team-grid{grid-template-columns:1fr}
          .features{flex-direction:column}
        }

      `}</style>

      <div className="page-wrap">
        <nav className="nav">
          <div className="nav-inner">
            <div className="logo">MJ's Cafe</div>
            <div className="nav-links">
              <a href="/">Home</a>
              <a href="/menu">Menu</a>
              <a href="/about">About</a>
              <a href="/contact">Contact</a>
            </div>
            <div className="nav-actions">
              <Link to="/cart" className="btn-ghost">Cart</Link>
              <Link to="/login" className="btn-solid">Login</Link>
            </div>
          </div>
        </nav>

        <main className="container">
          <section className="hero">
            <div className="hero-left">
              <div className="kicker">Locally Crafted</div>
              <h1 className="hero-title">Brewing Moments, Delivering Happiness.</h1>
              <p className="hero-desc">MJ's Café blends thoughtful design with warm service. We build delightful digital experiences to match the care poured into every cup — order ahead, track your delivery, and enjoy premium café convenience.</p>

              <div className="hero-ctas">
                <Link to="/menu" className="btn-solid">Explore Menu</Link>
                <Link to="/track-order" className="btn-ghost">Track Order</Link>
              </div>
            </div>

            <div className="hero-right">
              <div className="hero-media">
                <img src="/images/shop.jpg" alt="MJ's Cafe shop" onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = '/images/shop.svg'; }} />
              </div>
            </div>
          </section>

          <section className="team">
            <h2 style={{fontFamily:'Playfair Display, serif',color:'var(--green)',marginBottom:18}}>Meet the Team</h2>
            <div className="team-grid">
              <div className="team-card">
                <img className="team-avatar" src="/images/malou.jpg" alt="Malou" />
                <div className="team-meta">
                  <h4>Malou T. Astronomo</h4>
                  <div className="role-badge">Full-Stack Developer</div>
                  <p>Passionate about crafting smooth user journeys and backend systems that scale for real cafés.</p>
                </div>
                <div className="socials">
                  <a href="#" aria-label="LinkedIn"> {/* LinkedIn SVG */}
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4.98 3.5C4.98 4.6 4.12 5.5 3 5.5 1.88 5.5 1 4.6 1 3.5 1 2.4 1.88 1.5 3 1.5c1.12 0 1.98.9 1.98 2zM.5 8.5h5V24h-5V8.5zM9.5 8.5h4.78v2.06h.07c.67-1.27 2.3-2.6 4.73-2.6 5.06 0 6 3.33 6 7.66V24h-5V16.8c0-1.73-.03-3.97-2.42-3.97-2.42 0-2.79 1.88-2.79 3.83V24h-5V8.5z" fill="currentColor"/></svg>
                  </a>
                  <a href="#" aria-label="GitHub"> {/* GitHub SVG */}
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 .5C5.73.5.75 5.48.75 11.74c0 4.88 3.16 9.02 7.55 10.48.55.1.75-.24.75-.53v-1.86c-3.07.66-3.72-1.34-3.72-1.34-.5-1.28-1.22-1.62-1.22-1.62-.99-.68.08-.67.08-.67 1.1.08 1.68 1.12 1.68 1.12.97 1.65 2.54 1.18 3.16.9.1-.7.38-1.18.69-1.45-2.45-.28-5.03-1.23-5.03-5.48 0-1.21.43-2.2 1.12-2.98-.11-.28-.49-1.4.11-2.92 0 0 .92-.29 3.02 1.12.88-.24 1.82-.36 2.75-.36.93 0 1.87.12 2.75.36 2.1-1.41 3.02-1.12 3.02-1.12.6 1.52.22 2.64.11 2.92.69.78 1.12 1.77 1.12 2.98 0 4.26-2.59 5.19-5.05 5.46.39.34.74 1.02.74 2.06v3.06c0 .29.2.64.76.53 4.39-1.46 7.55-5.6 7.55-10.48C23.25 5.48 18.27.5 12 .5z" fill="currentColor"/></svg>
                  </a>
                </div>
              </div>

              <div className="team-card">
                <img className="team-avatar" src="/images/nhel.png" alt="Jean Nhel" />
                <div className="team-meta">
                  <h4>Jean Nhel L. Rolida</h4>
                  <div className="role-badge">Frontend Specialist</div>
                  <p>Focused on accessible interfaces and polished interactions across all user touchpoints.</p>
                </div>
                <div className="socials">
                  <a href="#" aria-label="LinkedIn">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4.98 3.5C4.98 4.6 4.12 5.5 3 5.5 1.88 5.5 1 4.6 1 3.5 1 2.4 1.88 1.5 3 1.5c1.12 0 1.98.9 1.98 2zM.5 8.5h5V24h-5V8.5zM9.5 8.5h4.78v2.06h.07c.67-1.27 2.3-2.6 4.73-2.6 5.06 0 6 3.33 6 7.66V24h-5V16.8c0-1.73-.03-3.97-2.42-3.97-2.42 0-2.79 1.88-2.79 3.83V24h-5V8.5z" fill="currentColor"/></svg>
                  </a>
                  <a href="#" aria-label="GitHub">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 .5C5.73.5.75 5.48.75 11.74c0 4.88 3.16 9.02 7.55 10.48.55.1.75-.24.75-.53v-1.86c-3.07.66-3.72-1.34-3.72-1.34-.5-1.28-1.22-1.62-1.22-1.62-.99-.68.08-.67.08-.67 1.1.08 1.68 1.12 1.68 1.12.97 1.65 2.54 1.18 3.16.9.1-.7.38-1.18.69-1.45-2.45-.28-5.03-1.23-5.03-5.48 0-1.21.43-2.2 1.12-2.98-.11-.28-.49-1.4.11-2.92 0 0 .92-.29 3.02 1.12.88-.24 1.82-.36 2.75-.36.93 0 1.87.12 2.75.36 2.1-1.41 3.02-1.12 3.02-1.12.6 1.52.22 2.64.11 2.92.69.78 1.12 1.77 1.12 2.98 0 4.26-2.59 5.19-5.05 5.46.39.34.74 1.02.74 2.06v3.06c0 .29.2.64.76.53 4.39-1.46 7.55-5.6 7.55-10.48C23.25 5.48 18.27.5 12 .5z" fill="currentColor"/></svg>
                  </a>
                </div>
              </div>
            </div>

            <div className="features">
              <div className="feature">
                <div className="icon-wrap">☕</div>
                <div>
                  <h5>User-Friendly</h5>
                  <p>Intuitive ordering and clean layouts that make the experience effortless.</p>
                </div>
              </div>

              <div className="feature">
                <div className="icon-wrap">❤️</div>
                <div>
                  <h5>Warm Service</h5>
                  <p>Designed for hospitality — thoughtful touches that feel personal.</p>
                </div>
              </div>

              <div className="feature">
                <div className="icon-wrap">⚡</div>
                <div>
                  <h5>Reliable & Efficient</h5>
                  <p>Fast performance and dependable ordering flow for busy cafés.</p>
                </div>
              </div>
            </div>
          </section>

          <footer className="site-footer">
            <div style={{color:'#666'}}>© {new Date().getFullYear()} MJ's Cafe — All rights reserved</div>
            <div className="foot-socials">
              <a href="#">Twitter</a>
              <a href="#">Instagram</a>
            </div>
          </footer>
        </main>
      </div>
    </>
  );
};

export default About;
