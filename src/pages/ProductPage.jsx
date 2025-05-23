import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import ProductViewer from '../components/ProductViewer'

const ProductPage = () => {
  const { id } = useParams()
  const [product, setProduct] = useState(null)
  const [selectedSize, setSelectedSize] = useState('')

  useEffect(() => {
    // Fetch product data based on ID
    const mockProduct = {
      id: '1',
      name: 'Floral Summer Dress',
      price: 29.99,
      image: 'https://via.placeholder.com/300x400/FFC0CB/FFFFFF?text=Floral+Dress',
      rating: 4.5,
      market: 'Fashion Market',
      bodyType: 'Slim Fit',
      colors: ['pink', 'white', 'blue'],
      sizes: ['S', 'M', 'L', 'XL'],
      description: 'Lightweight floral print dress perfect for summer occasions with comfortable stretch fabric.',
      material: '95% Polyester, 5% Spandex',
      care: 'Machine wash cold, hang to dry',
      location: 'Warehouse: Los Angeles, CA'
    }
    setProduct(mockProduct)
    setSelectedSize(mockProduct.sizes[0])
  }, [id])

  if (!product) return <div className="loading">Loading...</div>

  return (
    <div className="product-page">
      <div className="product-viewer-container">
        <ProductViewer product={product} />
        
        <div className="product-details">
          <h1>{product.name}</h1>
          <div className="price">${product.price}</div>
          
          <div className="section">
            <h3>Colors</h3>
            <p>Selected: {product.colors[0]}</p>
          </div>
          
          <div className="section">
            <h3>Sizes</h3>
            <div className="size-options">
              {product.sizes.map(size => (
                <button
                  key={size}
                  className={`size-option ${selectedSize === size ? 'active' : ''}`}
                  onClick={() => setSelectedSize(size)}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
          
          <div className="section">
            <h3>Description</h3>
            <p>{product.description}</p>
          </div>
          
          <div className="section">
            <h3>Details</h3>
            <ul>
              <li><strong>Material:</strong> {product.material}</li>
              <li><strong>Care:</strong> {product.care}</li>
              <li><strong>Body Type:</strong> {product.bodyType}</li>
              <li><strong>Location:</strong> {product.location}</li>
              <li><strong>Market:</strong> {product.market}</li>
            </ul>
          </div>
          
          <button className="add-to-cart">Add to Cart</button>
          <button className="buy-now">Buy Now</button>
        </div>
      </div>
    </div>
  )
}

export default ProductPage