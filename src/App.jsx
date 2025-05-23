import React, { useState, useRef, Suspense } from 'react';
import {
  FaSearch,
  FaCamera,
  FaShoppingCart,
  FaStar,
  FaTshirt
} from 'react-icons/fa';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF, Grid, Stats, Html } from '@react-three/drei';
import { useNavigate } from 'react-router-dom';
import './App.css';

// Products grouped by image filename
const productsByImage = {
  'dress (2).png': [
    {
      id: 2, 
      name: 'Midnight Elegance',
      price: 4000,
      rating: 5,
      image: 'assets/dress4.png',
      description: 'A timeless gown perfect for formal events.',
      modelPath: 'models/dress_3_la_dame_a_la_licorne.glb'
    },
    {
      id: 5, 
      name: 'Sunset Radiance',
      price: 3500,
      rating: 5,
    image: 'assets/shopping.webp',
      description: 'A radiant gown inspired by golden sunsets.',
      modelPath: 'models/dress_3_la_dame_a_la_licorne.glb'
    }
  ],

  'dress.png': [
    {
      id: 3, 
      name: 'Classic Gray Suit',
      price: 7000,
      rating: 5,
     image: 'assets/download.png',
      description: 'A sharp, classic gray suit for business or formal events.',
      modelPath: 'models/dress.glb'
    },
    {
      id: 4, 
      name: 'Modern Slim-Fit Suit',
      price: 8500,
      rating: 5,
      image: 'assets/images.png',
      description: 'Tailored gray slim-fit suit designed for a modern silhouette.',
      modelPath: 'models/metaretail_outfit.glb'
    }
  ]
};

// 3D Model Viewer Component
function ModelViewer({ modelPath }) {
  function Model() {
    const { scene } = useGLTF(modelPath);

    scene.position.set(0, 0, 0);
    scene.scale.set(0.01, 0.01, 0.01);

    return <primitive object={scene} />;
  }

  return (
    <div className="model-canvas">
      <Canvas
        camera={{
          position: [0, 1, 5],
          near: 0.1,
          far: 100,
          fov: 45
        }}
        style={{ height: '600px', width: '100%' }}
      >
        <ambientLight intensity={1.0} />
        <directionalLight position={[5, 10, 5]} intensity={1.5} castShadow />
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
          maxDistance={15}
          enablePan={true}
          enableZoom={true}
          target={[0, 0.5, 0]}
        />
      </Canvas>
    </div>
  );
}

function App() {
  const navigate = useNavigate();
  // Flatten all products into one array for search & display
  const allProducts = Object.values(productsByImage).flat();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);

  // For image upload feature
  const [uploadedImage, setUploadedImage] = useState(null);
  const [matchedProducts, setMatchedProducts] = useState([]);

  const fileInputRef = useRef(null);

  const handleCameraClick = () => {
    fileInputRef.current.click();
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const fileName = file.name.toLowerCase(); // lowercase to be safe

      setUploadedImage(URL.createObjectURL(file));

      // Find products by filename key (case insensitive)
      const foundProducts = productsByImage[fileName] || [];
      setMatchedProducts(foundProducts);
      setSelectedProduct(null);  // Reset detailed view on new upload
      setSearchTerm('');  // Clear search when image uploaded
    }
  };

  // Filter products by search term
  const filteredProducts = allProducts.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // If uploaded image has matches, override the display with those matched products
  const productsToShow = uploadedImage ? matchedProducts : filteredProducts;

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
          <span className="logo__text">Snap & Shop</span>
        </div>

        <div className="header__search">
          <input
            type="text"
            className="search__input"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setUploadedImage(null); // Clear image upload on search
              setMatchedProducts([]);
            }}
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
          <div className="nav__item" onClick={() => navigate('/detect-shape')} style={{ cursor: 'pointer' }}>
            <div className="nav__line1" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <FaTshirt size={18} />
              <span>Body Shape</span>
            </div>
            <div className="nav__line2">Analyzer</div>
          </div>
          <div className="nav__item">
            <div className="nav__cart">
              <FaShoppingCart size={28} />
              <span className="cart__count">0</span>
            </div>
          </div>
        </div>
      </header>

   <div class="banner">
  <img
    src="https://images.unsplash.com/photo-1662894312921-67eabc246633?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
    alt="New Banner"
    class="banner__image"
  />
  <div class="banner__text">Welcome to Our Fashion Store</div>
</div>



      {uploadedImage && (
        <div style={{ textAlign: 'center', marginBottom: '15px' }}>
          <h3>Uploaded Image Preview:</h3>
          <img src={uploadedImage} alt="Uploaded preview" style={{ maxHeight: '200px' }} />
          {matchedProducts.length === 0 && (
            <p>No matching products found for this image.</p>
          )}
        </div>
      )}

      <div className="product-grid">
        {productsToShow.length === 0 && (
          <p style={{ padding: '20px' }}>No products found.</p>
        )}
        {productsToShow.map(product => (
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
              <p className="product-price">{product.price.toFixed(2)} birr</p>
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