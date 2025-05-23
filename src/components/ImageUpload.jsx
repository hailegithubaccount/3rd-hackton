import { useRef } from 'react'
import { FaCamera, FaUpload } from 'react-icons/fa'

const ImageUpload = ({ onUpload, isLoading }) => {
  const fileInputRef = useRef(null)

  const handleUploadClick = () => {
    fileInputRef.current.click()
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      onUpload(file)
    }
  }

  return (
    <div className="image-upload-container">
      <div className="upload-box" onClick={handleUploadClick}>
        <div className="upload-icon">
          {isLoading ? <FaUpload /> : <FaCamera />}
        </div>
        <p className="upload-text">
          {isLoading ? 'Processing...' : 'Upload outfit photo to find similar items'}
        </p>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          style={{ display: 'none' }}
          disabled={isLoading}
        />
      </div>
    </div>
  )
}

export default ImageUpload