import React, { useState, useRef, Suspense } from 'react';
import {
  FaSearch,
  FaCamera,
  FaShoppingCart,
  FaStar,
} from 'react-icons/fa';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF, Grid, Stats, Html } from '@react-three/drei';
import './App.css';

// 3D Model Viewer Component
function ModelViewer({ modelPath }) {
  function Model() {
    const { scene } = useGLTF(modelPath);
    
    // Adjust these values to properly position and scale your model
    // scene.position.set(0, 0, 0);  // Reset position first
    // scene.scale.set(0.5, 0.5, 0.5);  // Reduce size by half
    
    // If model is still too large or positioned incorrectly, try:
    scene.position.set(0, 0, 0);  // Adjust Y position if needed
    scene.scale.set(0.01, 0.01, 0.01);  // Make even smaller if needed
    
    return <primitive object={scene} />;
  }

  return (
    <div className="model-canvas">
      <Canvas 
        camera={{ 
          position: [0, 1, 5],  // Adjusted camera position (raised Y value)
          near: 0.1,
          far: 100,
          fov: 45
        }} 
        style={{ height: '600px', width: '100%' }}
      >
        <ambientLight intensity={1.0} />  {/* Increased light */}
        <directionalLight 
          position={[5, 10, 5]}  // Higher light position
          intensity={1.5} 
          castShadow
        />
        <Grid 
          infiniteGrid
          cellSize={1}
          cellThickness={0.6}
          sectionSize={2}
          fadeDistance={20}
        />
        <axesHelper args={[3]} />
        <Stats />
        
        <Suspense fallback={
          <Html center>
            <div className="loading-text">Loading 3D model...</div>
          </Html>
        }>
          <Model />
        </Suspense>
        <OrbitControls 
          minDistance={1}
          maxDistance={15}  // Increased max zoom distance
          enablePan={true}
          enableZoom={true}
          target={[0, 0.5, 0]}  // Focus point slightly above center
        />
      </Canvas>
    </div>
  );
}

function App() {
  const [products] = useState([
    {
      id: 1,
      name: 'Wireless Bluetooth Headphones',
      price: 59.99,
      rating: 4,
      image: 'https://m.media-amazon.com/images/I/71jlppwxjmL._AC_UL320_.jpg',
      description: 'Noise cancelling over-ear headphones with 30hr battery life',
      modelPath: 'models/dress_3_la_dame_a_la_licorne.glb'
    },
    {
      id: 2,
      name: 'Smart Watch Fitness Tracker',
      price: 89.99,
      rating: 5,
      image: 'https://m.media-amazon.com/images/I/61S0a7x2yaL._AC_UL320_.jpg',
      description: 'Heart rate monitor, waterproof, 1.4" color touchscreen',
      modelPath: 'models/dress_3_la_dame_a_la_licorne.glb'
    },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const fileInputRef = useRef(null);

  const handleCameraClick = () => {
    fileInputRef.current.click();
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      alert(`Image "${file.name}" uploaded successfully!`);
    }
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleProductClick = (product) => {
    setSelectedProduct(product);
  };

  const goBack = () => {
    setSelectedProduct(null);
  };

   if (selectedProduct) {
    return (
      <div className="product-detail">
        <button className="back-button" onClick={goBack}>← Back to Products</button>
        <div className="detail-container">
          <div className="model-section" style={{ width: '75%' }}>
            {selectedProduct.modelPath ? (
              <ModelViewer modelPath={selectedProduct.modelPath} />
            ) : (
              <div className="model-placeholder">
                🖼️ 3D Model Not Available
              </div>
            )}
          </div>
          <div className="info-section" style={{ width: '25%', padding: '20px' }}>
            <h2 style={{ fontSize: '24px', marginBottom: '15px' }}>{selectedProduct.name}</h2>
            <div className="product-rating" style={{ marginBottom: '15px' }}>
              {Array(selectedProduct.rating).fill().map((_, i) => (
                <FaStar key={i} color="#FFA41C" size={20} />
              ))}
            </div>
            <p className="product-description" style={{ marginBottom: '20px', fontSize: '16px' }}>
              {selectedProduct.description}
            </p>
            <p className="product-price" style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '25px' }}>
              ${selectedProduct.price.toFixed(2)}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button 
                className="add-to-cart" 
                style={{
                  padding: '12px',
                  backgroundColor: '#FFD814',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '16px'
                }}
              >
                Add to Cart
              </button>
              <button 
                className="buy-now" 
                style={{
                  padding: '12px',
                  backgroundColor: '#FFA41C',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '16px'
                }}
              >
                Buy Now
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="header">
        <div className="header__logo">
          <span className="logo__text">Amazon</span>
        </div>

        <div className="header__search">
          <input
            type="text"
            className="search__input"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button className="search__button">
            <FaSearch />
          </button>
          <div className="search__camera" onClick={handleCameraClick}>
            <FaCamera />
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="image/*"
              style={{ display: 'none' }}
            />
          </div>
        </div>

        <div className="header__nav">
          <div className="nav__item">
            <span className="nav__line1">Hello, Sign in</span>
            <span className="nav__line2">Account & Lists</span>
          </div>
          <div className="nav__item">
            <span className="nav__line1">Returns</span>
            <span className="nav__line2">& Orders</span>
          </div>
          <div className="nav__item">
            <div className="nav__cart">
              <FaShoppingCart size={28} />
              <span className="cart__count">0</span>
            </div>
          </div>
        </div>
      </header>

      <div className="banner">
        <img
          src="https://m.media-amazon.com/images/I/61jovjd+f9L._SX3000_.jpg"
          alt="Amazon Banner"
          className="banner__image"
        />
      </div>

      <div className="product-grid">
        {filteredProducts.map(product => (
          <div key={product.id} className="product-card">
            <img src={product.image} alt={product.name} className="product-image" />
            <div className="product-info">
              <h3 className="product-name">{product.name}</h3>
              <div className="product-rating">
                {Array(product.rating).fill().map((_, i) => (
                  <FaStar key={i} color="#FFA41C" />
                ))}
              </div>
              <p className="product-description">{product.description}</p>
              <p className="product-price">${product.price.toFixed(2)}</p>
              <button className="add-to-cart">Add to Cart</button>
              <button className="buy-now">Buy Now</button>
              <button 
                className="view-details" 
                onClick={() => handleProductClick(product)}
              >
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;