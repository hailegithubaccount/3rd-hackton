import { Link } from 'react-router-dom'
import { FaStar, FaRegStar, FaHeart } from 'react-icons/fa'

const ProductCard = ({ product, onClick }) => {
  const renderRating = () => {
    const stars = []
    const fullStars = Math.floor(product.rating || 4)
    const hasHalfStar = (product.rating || 4) % 1 >= 0.5

    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(<FaStar key={i} className="star filled" />)
      } else if (i === fullStars + 1 && hasHalfStar) {
        stars.push(<FaStar key={i} className="star half-filled" />)
      } else {
        stars.push(<FaRegStar key={i} className="star" />)
      }
    }

    return stars
  }

  return (
    <div className="product-card" onClick={onClick}>
      <div className="product-image-container">
        <img 
          src={product.image} 
          alt={product.name} 
          className="product-image"
        />
        <button className="wishlist-button">
          <FaHeart />
        </button>
        {product.discount && (
          <span className="discount-badge">-{product.discount}%</span>
        )}
      </div>
      
      <div className="product-info">
        <h3 className="product-title">{product.name}</h3>
        <div className="product-rating">
          {renderRating()}
          <span className="rating-count">({product.reviewCount || 124})</span>
        </div>
        <div className="product-pricing">
          <span className="current-price">${product.price.toFixed(2)}</span>
          {product.originalPrice && (
            <span className="original-price">${product.originalPrice.toFixed(2)}</span>
          )}
        </div>
      </div>
    </div>
  )
}

export default ProductCard;