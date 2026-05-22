import React, { useContext, useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import API from '../../services/api';
import { CartContext } from '../../context/CartContext';
import toast from 'react-hot-toast';
import formatCurrencyPHP from '../../utils/currency';

const Menu = () => {
  const { addToCart } = useContext(CartContext);
  const [quantities, setQuantities] = useState({});

  const { data: products = [], isLoading, error, refetch } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const res = await API.get('/products');
      return res.data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  useEffect(() => {
    refetch(); // Refetch products whenever the component is mounted
  }, [refetch]);

  // Local mapping for product name -> local image file (public folder)
  // keys are lowercase for case-insensitive lookup
  const nameToImage = {
    'cappuccino': '/images/products/Cappucino (3).jpg',
    'cappucino': '/images/products/Cappucino (3).jpg',
    'espresso': '/images/products/Espresso (3).jpg',
    'americano': '/images/products/Americano (2).jpg',
    'cortado': '/images/products/cortado.jpg',
    'latte': '/images/products/Latte (3).jpg',
    'mocha': '/images/products/Mocha (2).jpg'
  };

  // Filter products to include only those with status 'available'
  const visibleProducts = products.filter(p => p.status === 'available');

  const getCategoryName = (p) => (p.categories && p.categories.name ? p.categories.name.toLowerCase().trim() : 'categorized');

  // Coffee section should include coffees and cookies (cookies combined into main menu)
  const coffeeProducts = visibleProducts.filter(p => {
    const c = getCategoryName(p);
    return c.includes('coffee'); 
  });

  // Cookies section (managed by admin+staff)
  const cookieProducts = visibleProducts.filter(p => {
    const c = getCategoryName(p);
    return c.includes('cookie');
  });

  // Show error toast if query fails
  if (error) {
    toast.error('Failed to load menu');
  }

  const handleAddToCart = (product) => {
    const quantity = quantities[product.id] || 1;
    addToCart(product, quantity);
    toast.success(`${product.name} x${quantity} added to cart`);
    // Reset quantity after adding to cart
    setQuantities(prev => ({ ...prev, [product.id]: 1 }));
  };

  const handleQuantityChange = (productId, newQuantity, maxStock) => {
    if (newQuantity < 1) return;
    if (newQuantity > maxStock) return;
    setQuantities(prev => ({ ...prev, [productId]: newQuantity }));
  };

  const getProductQuantity = (productId, maxStock = 1) => {
    return quantities[productId] || 1;
  };

  const handleSubmit = (product) => {
    if (!product.category_name) {
      toast.error('Please select a category before saving the product');
      return;
    }

    // Proceed with saving the product
    API.post('/products', product)
      .then(() => {
        toast.success('Product added successfully');
        refetch();
      })
      .catch((error) => {
        toast.error(`Failed to add product: ${error.response.data.message}`);
      });
  };

  if (isLoading) {
    return (
      <div className="menu-container">
        <h1>Our Menu</h1>
        <div style={{ textAlign: 'center', padding: '40px', color: 'rgba(255,255,255,0.6)' }}>
          Loading menu...
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=DM+Sans:wght@300;400;500;600&display=swap');

        .menu-container {
          font-family: 'DM Sans', sans-serif;
          background: linear-gradient(135deg, #FAF7F2 0%, #F5EFE7 100%);
          min-height: calc(100vh - 72px);
          padding: 48px 36px;
          color: #2B2320;
          position: relative;
          overflow: hidden;
        }

        .menu-container::before {
          content: '';
          position: absolute;
          top: -40%;
          right: -20%;
          width: 600px;
          height: 600px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(212, 132, 78, 0.05) 0%, transparent 70%);
          pointer-events: none;
        }

        .menu-container::after {
          content: '';
          position: absolute;
          bottom: -30%;
          left: -10%;
          width: 500px;
          height: 500px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(45, 80, 22, 0.04) 0%, transparent 70%);
          pointer-events: none;
        }

        .menu-content {
          max-width: 1400px;
          margin: 0 auto;
          position: relative;
          z-index: 1;
        }

        .menu-content h1 {
          font-family: 'Playfair Display', serif;
          font-size: 42px;
          font-weight: 700;
          color: #2D5016;
          margin: 0 0 12px;
          letter-spacing: 0.02em;
          transition: color 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .menu-subtitle {
          font-size: 14px;
          color: #5C524A;
          margin-bottom: 40px;
          font-weight: 400;
          letter-spacing: 0.05em;
          opacity: 0.9;
          transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .product-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
          padding: 16px;
        }

        .product-card {
          background: white;
          border: 1px solid #EBE0D1;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .product-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
        }

        .product-image-wrapper {
          height: 200px;
          overflow: hidden;
          border-top-left-radius: 16px;
          border-top-right-radius: 16px;
        }

        .product-card img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s ease;
        }

        .product-card:hover img {
          transform: scale(1.05);
        }

        .product-content {
          padding: 16px;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
        }

        .product-card h3 {
          font-size: 18px;
          font-weight: bold;
          margin: 8px 0;
          color: #2D5016;
        }

        .product-card p {
          font-size: 14px;
          color: #5C524A;
          margin: 8px 0;
        }

        .product-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          width: 100%;
          margin-top: 12px;
        }

        .price {
          font-size: 16px;
          font-weight: bold;
          color: #2D5016;
        }

        .btn-add {
          padding: 10px 16px;
          background: linear-gradient(135deg, #2D5016, #4A7C2E);
          border: none;
          border-radius: 8px;
          color: white;
          font-weight: 600;
          font-size: 14px;
          cursor: pointer;
          transition: background 0.3s ease, transform 0.2s ease;
        }

        .btn-add:hover {
          background: linear-gradient(135deg, #1F3710, #2D5016);
          transform: scale(1.05);
        }

        .loading-text {
          text-align: center;
          padding: 80px 20px;
          font-size: 16px;
          color: #5C524A;
          font-weight: 500;
          animation: pulse 2s cubic-bezier(0.34, 1.56, 0.64, 1) infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 0.7; }
          50% { opacity: 1; }
        }

        .product-card {
          background: white;
          border: 1px solid #EBE0D1;
          border-radius: 18px;
          padding: 0;
          overflow: hidden;
          box-shadow: 0 8px 28px rgba(45, 80, 22, 0.06);
          display: flex;
          flex-direction: column;
          gap: 0;
          transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
          position: relative;
          backdrop-filter: blur(8px);
        }

        .product-card:hover {
          transform: translateY(-12px);
          box-shadow: 0 24px 64px rgba(45, 80, 22, 0.15), 0 0 0 1px rgba(212, 132, 78, 0.15);
          border-color: rgba(212, 132, 78, 0.4);
        }

        .product-card::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.1), transparent);
          opacity: 0;
          transition: opacity 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
          pointer-events: none;
          z-index: 10;
        }

        .product-card:hover::before {
          opacity: 1;
        }

        .product-image-wrapper {
          position: relative;
          height: 200px;
          overflow: hidden;
          background: linear-gradient(135deg, #F5EFE7, #EBE0D1);
          display: block;
          border-top-left-radius: 18px;
          border-top-right-radius: 18px;
          aspect-ratio: 4/3;
        }

        .product-image-wrapper::before {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at 30% 30%, rgba(212, 132, 78, 0.1) 0%, transparent 60%);
          z-index: 1;
          pointer-events: none;
        }

        .product-card img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center;
          display: block;
          transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
          position: relative;
          z-index: 0;
        }

        .product-card:hover img {
          transform: scale(1.08) rotate(0.5deg);
        }

        .product-status {
          position: absolute;
          top: 12px;
          right: 12px;
          background: linear-gradient(135deg, rgba(212, 132, 78, 0.9), rgba(201, 169, 97, 0.8));
          color: white;
          padding: 8px 14px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          box-shadow: 0 6px 16px rgba(212, 132, 78, 0.3);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          z-index: 5;
        }

        .product-status.available {
          background: linear-gradient(135deg, rgba(39, 174, 96, 0.9), rgba(46, 204, 113, 0.8));
          display: none;
        }

        .product-content {
          padding: 20px;
          display: flex;
          flex-direction: column;
          flex-grow: 1;
          gap: 12px;
        }

        .product-card h3 {
          margin: 0;
          font-size: 18px;
          color: #2D5016;
          font-weight: 700;
          letter-spacing: 0.01em;
          transition: color 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .product-card:hover h3 {
          color: #D4844E;
        }

        .product-card p {
          margin: 0;
          font-size: 13px;
          color: #5C524A;
          min-height: 38px;
          line-height: 1.5;
          flex-grow: 1;
          transition: color 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .product-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding-top: 12px;
          border-top: 1px solid #EBE0D1;
        }

        .price {
          font-weight: 700;
          color: #2D5016;
          font-size: 18px;
          font-family: 'Playfair Display', serif;
          transition: color 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .product-card:hover .price {
          color: #D4844E;
        }

        .btn-add {
          padding: 11px 18px;
          background: linear-gradient(135deg, #2D5016, #4A7C2E);
          border: none;
          border-radius: 10px;
          color: white;
          font-weight: 600;
          font-size: 12px;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
          box-shadow: 0 8px 20px rgba(45, 80, 22, 0.15);
          flex: 1;
          position: relative;
          overflow: hidden;
        }

        .btn-add::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
          transform: translateX(-100%);
          transition: transform 0.6s ease;
        }

        .btn-add:hover:not(:disabled)::before {
          transform: translateX(100%);
        }

        .btn-add:hover:not(:disabled) {
          background: linear-gradient(135deg, #1F3710, #2D5016);
          transform: translateY(-2px);
          box-shadow: 0 12px 32px rgba(45, 80, 22, 0.3);
        }

        .btn-add:active:not(:disabled) {
          transform: translateY(0);
        }

        .btn-add:disabled {
          background: linear-gradient(135deg, #EBE0D1, #E5D5C8);
          color: #5C524A;
          cursor: not-allowed;
          box-shadow: 0 4px 12px rgba(45, 80, 22, 0.04);
        }

        .stock-info {
          font-size: 12px;
          color: #5C524A;
          margin-bottom: 8px;
        }

        .out-of-stock-badge {
          display: inline-block;
          background: linear-gradient(135deg, #E74C3C, #C0392B);
          color: white;
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          box-shadow: 0 6px 16px rgba(231, 76, 60, 0.3);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          margin-bottom: 8px;
        }

        .quantity-selector {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          background: #F5EFE7;
          border-radius: 8px;
          padding: 6px;
          margin-bottom: 12px;
        }

        .qty-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 28px;
          height: 28px;
          background: linear-gradient(135deg, #2D5016, #4A7C2E);
          border: none;
          border-radius: 6px;
          color: white;
          font-weight: 700;
          font-size: 16px;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
          box-shadow: 0 4px 12px rgba(45, 80, 22, 0.1);
        }

        .qty-btn:hover:not(:disabled) {
          background: linear-gradient(135deg, #1F3710, #2D5016);
          transform: scale(1.08);
          box-shadow: 0 6px 16px rgba(45, 80, 22, 0.2);
        }

        .qty-btn:active:not(:disabled) {
          transform: scale(0.95);
        }

        .qty-btn:disabled {
          background: linear-gradient(135deg, #E5D5C8, #EBE0D1);
          color: #9E9280;
          cursor: not-allowed;
          box-shadow: 0 2px 6px rgba(45, 80, 22, 0.05);
        }

        .qty-display {
          font-weight: 700;
          color: #2D5016;
          font-size: 14px;
          min-width: 24px;
          text-align: center;
        }

        .product-actions {
          display: flex;
          flex-direction: column;
          gap: 0;
          width: 100%;
        }

        .loading-text {
          text-align: center;
          padding: 60px 20px;
          font-size: 16px;
          color: #5C524A;
          font-weight: 500;
        }

        @media (max-width: 768px) {
          .menu-container {
            padding: 32px 20px;
          }

          .menu-content h1 {
            font-size: 32px;
            margin-bottom: 8px;
          }

          .product-grid {
            grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
            gap: 20px;
          }

          .product-card {
            border-radius: 14px;
          }

          .product-image-wrapper {
            height: 160px;
          }

          .product-content {
            padding: 16px;
          }

          .btn-add {
            padding: 10px 14px;
            font-size: 11px;
          }

          .quantity-selector {
            gap: 6px;
            padding: 5px;
          }

          .qty-btn {
            width: 26px;
            height: 26px;
            font-size: 14px;
          }

          .qty-display {
            font-size: 13px;
          }

          .stock-info {
            font-size: 11px;
          }
        }

        @media (max-width: 480px) {
          .menu-container {
            padding: 24px 16px;
          }

          .menu-content h1 {
            font-size: 28px;
            margin-bottom: 6px;
          }

          .menu-subtitle {
            margin-bottom: 28px;
          }

          .product-grid {
            grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
            gap: 16px;
          }

          .product-card {
            border-radius: 12px;
          }

          .product-image-wrapper {
            height: 140px;
          }

          .product-content {
            padding: 14px;
            gap: 10px;
          }

          .product-card h3 {
            font-size: 14px;
          }

          .product-card p {
            font-size: 12px;
            min-height: 32px;
          }

          .price {
            font-size: 16px;
          }

          .btn-add {
            padding: 9px 12px;
            font-size: 10px;
          }

          .product-footer {
            gap: 8px;
          }

          .quantity-selector {
            gap: 5px;
            padding: 4px;
          }

          .qty-btn {
            width: 24px;
            height: 24px;
            font-size: 12px;
          }

          .qty-display {
            font-size: 12px;
          }

          .stock-info {
            font-size: 10px;
          }

          .out-of-stock-badge {
            font-size: 10px;
            padding: 5px 10px;
          }
        }
      `}</style>

      <div className="menu-container">
        <div className="menu-content">
          <h1>Our Menu</h1>
          <p className="menu-subtitle">Discover our finest selection of premium café offerings</p>
          
          {isLoading ? (
            <div className="loading-text">✨ Loading our delicious menu...</div>
          ) : (
            <>
              {/* Coffee & Pastries Section */}
              <h2 style={{ marginTop: 8, marginBottom: 12 }}>Coffee & Pastries</h2>
              <div className="product-grid">
                {coffeeProducts.map((product) => {
                  const isOutOfStock = product.stock === 0;
                  const currentQty = getProductQuantity(product.id, product.stock);
                  return (
                    <div key={product.id} className="product-card">
                      <div className="product-image-wrapper">
                        <img 
                          src={
                            product.image_url ||
                            nameToImage[(product.name || '').toLowerCase().trim()] ||
                            'https://via.placeholder.com/260x200?text=' + encodeURIComponent(product.name)
                          }
                          alt={product.name} 
                          loading="lazy" 
                        />
                        {isOutOfStock && (
                          <div className="product-status" style={{ background: 'linear-gradient(135deg, rgba(231, 76, 60, 0.9), rgba(192, 57, 43, 0.8))' }}>Out of Stock</div>
                        )}
                      </div>
                      <div className="product-content">
                        <h3>{product.name}</h3>
                        <p>{product.description}</p>
                        
                        {isOutOfStock ? (
                          <div style={{ textAlign: 'center' }}>
                            <div className="out-of-stock-badge">Out of Stock</div>
                          </div>
                        ) : (
                          <>
                            <div className="stock-info">
                              Available: {product.stock} {product.stock === 1 ? 'item' : 'items'}
                            </div>
                            <div className="quantity-selector">
                              <button 
                                className="qty-btn"
                                onClick={() => handleQuantityChange(product.id, currentQty - 1, product.stock)}
                                disabled={currentQty <= 1}
                              >
                                −
                              </button>
                              <span className="qty-display">{currentQty}</span>
                              <button 
                                className="qty-btn"
                                onClick={() => handleQuantityChange(product.id, currentQty + 1, product.stock)}
                                disabled={currentQty >= product.stock}
                              >
                                +
                              </button>
                            </div>
                          </>
                        )}
                        
                        <div className="product-footer">
                          <span className="price">{formatCurrencyPHP(product.price)}</span>
                          <button 
                            onClick={() => handleAddToCart(product)}
                            className="btn-add"
                            disabled={isOutOfStock}
                          >
                            {isOutOfStock ? 'Unavailable' : 'Add to Cart'}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Cookies Section */}
              {cookieProducts && cookieProducts.length > 0 && (
                <>
                  <h2 style={{ marginTop: 36, marginBottom: 12 }}>Cookies</h2>
                  <div className="product-grid">
                    {cookieProducts.map((product) => {
                      const isOutOfStock = product.stock === 0;
                      const currentQty = getProductQuantity(product.id, product.stock);
                      return (
                        <div key={product.id} className="product-card">
                          <div className="product-image-wrapper">
                            <img 
                              src={
                                product.image_url ||
                                nameToImage[(product.name || '').toLowerCase().trim()] ||
                                'https://via.placeholder.com/260x200?text=' + encodeURIComponent(product.name)
                              }
                              alt={product.name} 
                              loading="lazy" 
                            />
                            {isOutOfStock && (
                              <div className="product-status" style={{ background: 'linear-gradient(135deg, rgba(231, 76, 60, 0.9), rgba(192, 57, 43, 0.8))' }}>Out of Stock</div>
                            )}
                          </div>
                          <div className="product-content">
                            <h3>{product.name}</h3>
                            <p>{product.description}</p>
                            
                            {isOutOfStock ? (
                              <div style={{ textAlign: 'center' }}>
                                <div className="out-of-stock-badge">Out of Stock</div>
                              </div>
                            ) : (
                              <>
                                <div className="stock-info">
                                  Available: {product.stock} {product.stock === 1 ? 'item' : 'items'}
                                </div>
                                <div className="quantity-selector">
                                  <button 
                                    className="qty-btn"
                                    onClick={() => handleQuantityChange(product.id, currentQty - 1, product.stock)}
                                    disabled={currentQty <= 1}
                                  >
                                    −
                                  </button>
                                  <span className="qty-display">{currentQty}</span>
                                  <button 
                                    className="qty-btn"
                                    onClick={() => handleQuantityChange(product.id, currentQty + 1, product.stock)}
                                    disabled={currentQty >= product.stock}
                                  >
                                    +
                                  </button>
                                </div>
                              </>
                            )}
                            
                            <div className="product-footer">
                              <span className="price">{formatCurrencyPHP(product.price)}</span>
                              <button 
                                onClick={() => handleAddToCart(product)}
                                className="btn-add"
                                disabled={isOutOfStock}
                              >
                                {isOutOfStock ? 'Unavailable' : 'Add to Cart'}
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
};;

export default Menu;
