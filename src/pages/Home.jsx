import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/themaine3dmodel'
import ProductCard from '../components/ProductCard'
import ImageUpload from '../components/ImageUpload'

const Home = () => {
  const [products, setProducts] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  const recognizeProducts = async (imageFile) => {
    setIsLoading(true)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    // Mock data
    const mockProducts = [
      {
        id: '1',
        name: 'Floral Summer Dress',
        price: 29.99,
        image: 'https://via.placeholder.com/300x400/FFC0CB/FFFFFF?text=Floral+Dress',
        rating: 4.5,
        colors: ['pink', 'white', 'blue'],
        discount: 20,
        originalPrice: 37.49
      },
      {
        id: '2',
        name: 'Denim Jacket',
        price: 45.99,
        image: 'https://via.placeholder.com/300x400/4682B4/FFFFFF?text=Denim+Jacket',
        rating: 4,
        colors: ['blue', 'black']
      }
    ]
    
    setProducts(mockProducts)
    setIsLoading(false)
  }

  return (
    <div className="app">
      <Header />
      
      <main className="main-content">
        <ImageUpload onUpload={recognizeProducts} isLoading={isLoading} />
        
        {isLoading && (
          <div className="loading-indicator">
            <div className="spinner"></div>
            <p>Analyzing your image...</p>
          </div>
        )}
        
        <div className="product-grid">
          {products.map(product => (
            <ProductCard 
              key={product.id} 
              product={product} 
              onClick={() => navigate(`/product/${product.id}`)}
            />
          ))}
        </div>
      </main>
    </div>
  )
}

export default Home;