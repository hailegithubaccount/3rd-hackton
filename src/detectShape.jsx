import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { FaCamera, FaUpload, FaExchangeAlt, FaStop, FaPlay } from 'react-icons/fa';

function DetectShape() {
  const [mode, setMode] = useState('upload'); // 'upload' or 'realtime'
  const [image, setImage] = useState(null);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isLive, setIsLive] = useState(false);
  const [facingMode, setFacingMode] = useState('user');
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const fileInputRef = useRef(null);

  // Toggle between upload and realtime modes
  const switchMode = (newMode) => {
    if (newMode === mode) return;
    
    // Clean up camera if switching from realtime
    if (mode === 'realtime' && isLive) {
      stopCamera();
      setIsLive(false);
    }
    
    setMode(newMode);
    setImage(null);
    setResults(null);
    setError(null);
  };

  // Camera controls
  const toggleCamera = async () => {
    if (isLive) {
      stopCamera();
    } else {
      await startCamera();
    }
    setIsLive(!isLive);
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      });
      
      videoRef.current.srcObject = stream;
      streamRef.current = stream;
      videoRef.current.play();
    } catch (err) {
      setError("Camera access denied: " + err.message);
      setIsLive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  const switchCamera = () => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
  };

  // Image upload handler
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  // Capture frame from video
  const captureFrame = () => {
    if (!videoRef.current) return null;
    
    const canvas = canvasRef.current;
    const video = videoRef.current;
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    return canvas.toDataURL('image/jpeg', 0.8);
  };

  // Analyze image/frame
  const analyzeImage = async (imageData) => {
    setLoading(true);
    try {
      const response = await axios.post('http://localhost:5000/analyze', {
        image: imageData
      });
      setResults(response.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || "Analysis failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Auto-analysis in realtime mode
  useEffect(() => {
    let interval;
    if (isLive && mode === 'realtime') {
      interval = setInterval(() => {
        const frame = captureFrame();
        if (frame) analyzeImage(frame);
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [isLive, mode]);

  // Clean up camera on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        stopCamera();
      }
    };
  }, []);

  // Restart camera when facing mode changes
  useEffect(() => {
    if (isLive) {
      stopCamera();
      startCamera();
    }
  }, [facingMode]);

  return (
    <div style={styles.container}>
      <h1 style={styles.header}>Body Shape Analyzer</h1>
      
      {/* Mode selector */}
      <div style={styles.modeSelector}>
        <button 
          onClick={() => switchMode('upload')}
          style={{
            ...styles.modeButton,
            ...(mode === 'upload' ? styles.activeMode : {})
          }}
        >
          <FaUpload style={styles.modeIcon} />
          Upload Image
        </button>
        <button 
          onClick={() => switchMode('realtime')}
          style={{
            ...styles.modeButton,
            ...(mode === 'realtime' ? styles.activeMode : {})
          }}
        >
          <FaCamera style={styles.modeIcon} />
          Real-Time
        </button>
      </div>
      
      {/* Upload mode content */}
      {mode === 'upload' && (
        <div style={styles.uploadContainer}>
          <div style={styles.uploadBox} onClick={() => fileInputRef.current.click()}>
            {image ? (
              <img src={image} alt="Uploaded" style={styles.uploadedImage} />
            ) : (
              <div style={styles.uploadPrompt}>
                <FaUpload size={48} color="#7f8c8d" />
                <p>Click to upload an image</p>
              </div>
            )}
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleImageUpload}
              accept="image/*"
              style={styles.fileInput}
            />
          </div>
          
          <button 
            onClick={() => analyzeImage(image)}
            disabled={!image || loading}
            style={{
              ...styles.analyzeButton,
              opacity: (!image || loading) ? 0.6 : 1,
              cursor: (!image || loading) ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'Analyzing...' : 'Analyze Image'}
          </button>
        </div>
      )}
      
      {/* Realtime mode content */}
      {mode === 'realtime' && (
        <div style={styles.realtimeContainer}>
          <div style={styles.cameraContainer}>
            <video 
              ref={videoRef} 
              style={{ 
                ...styles.video, 
                display: isLive ? 'block' : 'none',
                transform: facingMode === 'user' ? 'scaleX(-1)' : 'none'
              }}
              playsInline
            />
            
            {!isLive && (
              <div style={styles.cameraPlaceholder}>
                <FaCamera size={64} color="#7f8c8d" />
                <p>Camera is off</p>
              </div>
            )}
            
            <canvas ref={canvasRef} style={{ display: 'none' }} />
          </div>
          
          <div style={styles.cameraControls}>
            <button 
              onClick={toggleCamera}
              style={{
                ...styles.cameraButton,
                backgroundColor: isLive ? '#e74c3c' : '#2ecc71'
              }}
            >
              {isLive ? <FaStop /> : <FaPlay />}
              {isLive ? ' Stop' : ' Start'}
            </button>
            
            {isLive && (
              <button 
                onClick={switchCamera}
                style={styles.cameraButton}
                disabled={!isLive}
              >
                <FaExchangeAlt />
                Switch
              </button>
            )}
            
            {isLive && (
              <button 
                onClick={() => analyzeImage(captureFrame())}
                style={styles.cameraButton}
                disabled={!isLive || loading}
              >
                {loading ? 'Analyzing...' : 'Analyze Now'}
              </button>
            )}
          </div>
        </div>
      )}
      
      {/* Error display */}
      {error && (
        <div style={styles.errorContainer}>
          <p style={styles.errorText}>{error}</p>
        </div>
      )}

      {/* Results display */}
      {results && !results.error && (
        <div style={styles.resultsContainer}>
          <h2 style={styles.resultsHeader}>Analysis Results</h2>
          
          <div style={styles.resultsGrid}>
            {/* Measurements */}
            <div style={styles.measurementsPanel}>
              <h3 style={styles.sectionHeader}>Body Measurements</h3>
              <div style={styles.measurementList}>
                {Object.entries(results.measurements).map(([key, value]) => (
                  <div key={key} style={styles.measurementItem}>
                    <span style={styles.measurementLabel}>
                      {key.charAt(0).toUpperCase() + key.slice(1)}:
                    </span>
                    <span style={styles.measurementValue}>{value} cm</span>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Body shape */}
            <div style={styles.shapePanel}>
              <h3 style={styles.sectionHeader}>Your Body Shape</h3>
              <div style={{
                ...styles.shapeBadge,
                backgroundColor: getShapeColor(results.body_shape)
              }}>
                {results.body_shape}
              </div>
              <p style={styles.shapeDescription}>
                {getShapeDescription(results.body_shape)}
              </p>
            </div>
            
            {/* Recommendations */}
            <div style={styles.recommendationsPanel}>
              <h3 style={styles.sectionHeader}>Recommended Styles</h3>
              <ul style={styles.recommendationsList}>
                {results.recommendations.map((item, i) => (
                  <li key={i} style={styles.recommendationItem}>
                    <span style={styles.bulletPoint}>•</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          {/* Annotated image */}
          {results.annotated_image && (
            <div style={styles.annotationContainer}>
              <h3 style={styles.sectionHeader}>Pose Detection</h3>
              <img 
                src={results.annotated_image} 
                alt="Pose landmarks" 
                style={styles.annotatedImage}
              />
              <p style={styles.annotationNote}>
                Key points detected by our analysis system
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Helper functions
function getShapeDescription(shape) {
  const descriptions = {
    'Hourglass': 'Balanced shoulders and hips with a clearly defined waist',
    'Apple': 'Broader shoulders and waist compared to hips',
    'Pear': 'Hips wider than shoulders with a defined waist',
    'Rectangle': 'Shoulders, waist and hips are similar in width',
    'Inverted Triangle': 'Shoulders significantly wider than hips'
  };
  return descriptions[shape] || 'Your unique body proportions';
}

function getShapeColor(shape) {
  const colors = {
    'Hourglass': '#9b59b6',
    'Apple': '#e74c3c',
    'Pear': '#3498db',
    'Rectangle': '#2ecc71',
    'Inverted Triangle': '#f39c12'
  };
  return colors[shape] || '#7f8c8d';
}

// Styles
const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    minHeight: '100vh',
    padding: '20px',
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    backgroundColor: '#f8f9fa',
    color: '#2c3e50'
  },
  header: {
    fontSize: '2.5rem',
    fontWeight: '600',
    marginBottom: '30px',
    textAlign: 'center',
    color: '#2c3e50'
  },
  modeSelector: {
    display: 'flex',
    gap: '15px',
    marginBottom: '30px',
    justifyContent: 'center',
    width: '100%'
  },
  modeButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 24px',
    backgroundColor: '#ecf0f1',
    border: 'none',
    borderRadius: '50px',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: '500',
    transition: 'all 0.3s ease',
    boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
  },
  activeMode: {
    backgroundColor: '#3498db',
    color: 'white',
    boxShadow: '0 4px 8px rgba(52,152,219,0.3)'
  },
  modeIcon: {
    fontSize: '1.2rem'
  },
  uploadContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%',
    maxWidth: '600px',
    marginBottom: '30px'
  },
  uploadBox: {
    width: '100%',
    height: '400px',
    border: '2px dashed #bdc3c7',
    borderRadius: '10px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    cursor: 'pointer',
    overflow: 'hidden',
    backgroundColor: 'white',
    marginBottom: '20px',
    transition: 'all 0.3s ease',
    ':hover': {
      borderColor: '#3498db'
    }
  },
  uploadedImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover'
  },
  uploadPrompt: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    color: '#7f8c8d'
  },
  fileInput: {
    display: 'none'
  },
  analyzeButton: {
    padding: '12px 30px',
    backgroundColor: '#3498db',
    color: 'white',
    border: 'none',
    borderRadius: '50px',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: '500',
    transition: 'all 0.3s ease',
    boxShadow: '0 2px 5px rgba(52,152,219,0.3)',
    ':hover': {
      backgroundColor: '#2980b9'
    }
  },
  realtimeContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%',
    maxWidth: '800px',
    marginBottom: '30px'
  },
  cameraContainer: {
    position: 'relative',
    width: '100%',
    aspectRatio: '16/9',
    borderRadius: '10px',
    overflow: 'hidden',
    backgroundColor: '#2c3e50',
    marginBottom: '20px',
    boxShadow: '0 4px 10px rgba(0,0,0,0.2)'
  },
  video: {
    width: '100%',
    height: '100%',
    objectFit: 'cover'
  },
  cameraPlaceholder: {
    position: 'absolute',
    top: '0',
    left: '0',
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    color: '#ecf0f1',
    backgroundColor: 'rgba(0,0,0,0.3)'
  },
  cameraControls: {
    display: 'flex',
    gap: '15px',
    justifyContent: 'center',
    flexWrap: 'wrap'
  },
  cameraButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 20px',
    backgroundColor: '#3498db',
    color: 'white',
    border: 'none',
    borderRadius: '50px',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: '500',
    transition: 'all 0.3s ease',
    boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
    ':hover': {
      opacity: '0.9'
    },
    ':disabled': {
      opacity: '0.6',
      cursor: 'not-allowed'
    }
  },
  errorContainer: {
    backgroundColor: '#e74c3c',
    color: 'white',
    padding: '15px 25px',
    borderRadius: '8px',
    marginBottom: '20px',
    maxWidth: '600px',
    width: '100%',
    textAlign: 'center'
  },
  errorText: {
    margin: '0',
    fontSize: '1rem'
  },
  resultsContainer: {
    backgroundColor: 'white',
    borderRadius: '10px',
    padding: '30px',
    boxShadow: '0 5px 15px rgba(0,0,0,0.1)',
    width: '100%',
    maxWidth: '1000px',
    marginBottom: '30px'
  },
  resultsHeader: {
    fontSize: '1.8rem',
    fontWeight: '600',
    marginBottom: '25px',
    textAlign: 'center',
    color: '#2c3e50'
  },
  resultsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '25px',
    marginBottom: '30px'
  },
  measurementsPanel: {
    backgroundColor: '#f8f9fa',
    borderRadius: '8px',
    padding: '20px'
  },
  shapePanel: {
    backgroundColor: '#f8f9fa',
    borderRadius: '8px',
    padding: '20px',
    textAlign: 'center'
  },
  recommendationsPanel: {
    backgroundColor: '#f8f9fa',
    borderRadius: '8px',
    padding: '20px'
  },
  sectionHeader: {
    fontSize: '1.3rem',
    fontWeight: '600',
    marginBottom: '15px',
    color: '#34495e',
    borderBottom: '2px solid #ecf0f1',
    paddingBottom: '10px'
  },
  measurementList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  measurementItem: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '12px',
    backgroundColor: 'white',
    borderRadius: '6px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
  },
  measurementLabel: {
    fontWeight: '500',
    color: '#7f8c8d'
  },
  measurementValue: {
    fontWeight: '600',
    color: '#2c3e50'
  },
  shapeBadge: {
    display: 'inline-block',
    padding: '12px 25px',
    borderRadius: '50px',
    fontSize: '1.2rem',
    fontWeight: '600',
    color: 'white',
    marginBottom: '15px',
    boxShadow: '0 3px 6px rgba(0,0,0,0.1)'
  },
  shapeDescription: {
    color: '#7f8c8d',
    fontStyle: 'italic',
    lineHeight: '1.6'
  },
  recommendationsList: {
    listStyleType: 'none',
    paddingLeft: '0',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  },
  recommendationItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '12px',
    backgroundColor: 'white',
    borderRadius: '6px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    lineHeight: '1.5'
  },
  bulletPoint: {
    color: '#2ecc71',
    fontWeight: 'bold',
    fontSize: '1.5rem'
  },
  annotationContainer: {
    textAlign: 'center',
    marginTop: '30px'
  },
  annotatedImage: {
    maxWidth: '100%',
    borderRadius: '8px',
    border: '1px solid #ecf0f1',
    boxShadow: '0 3px 6px rgba(0,0,0,0.1)',
    marginBottom: '10px'
  },
  annotationNote: {
    color: '#7f8c8d',
    fontSize: '0.9rem'
  }
};

export default DetectShape;