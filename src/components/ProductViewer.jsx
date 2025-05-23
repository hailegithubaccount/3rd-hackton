import { useRef, useState, Suspense } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Environment, useGLTF } from '@react-three/drei'
import * as THREE from 'three'

const Model = ({ color = 'pink' }) => {
  const group = useRef()
  
  useFrame(() => {
    group.current.rotation.y += 0.005
  })

  // Simple dress model
  return (
    <group ref={group}>
      <mesh position={[0, 0.5, 0]}>
        <cylinderGeometry args={[0.5, 0.7, 0.3, 32]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh position={[0, -0.2, 0]}>
        <cylinderGeometry args={[0.7, 1, 0.8, 32]} />
        <meshStandardMaterial color={color} />
      </mesh>
    </group>
  )
}

const ProductViewer = ({ product }) => {
  const [selectedColor, setSelectedColor] = useState(product.colors[0])

  return (
    <div className="product-viewer">
      <div className="model-container">
        <Canvas camera={{ position: [0, 0, 2.5], fov: 45 }}>
          <ambientLight intensity={0.5} />
          <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />
          <pointLight position={[-10, -10, -10]} />
          
          <Suspense fallback={null}>
            <Model color={selectedColor.toLowerCase()} />
          </Suspense>
          
          <OrbitControls 
            enableZoom={true}
            enablePan={true}
            minPolarAngle={Math.PI / 6}
            maxPolarAngle={Math.PI / 2}
          />
          <Environment preset="city" />
        </Canvas>
      </div>
      
      <div className="viewer-controls">
        <div className="color-options">
          {product.colors.map(color => (
            <button
              key={color}
              className={`color-option ${selectedColor === color ? 'active' : ''}`}
              style={{ backgroundColor: color.toLowerCase() }}
              onClick={() => setSelectedColor(color)}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export default ProductViewer;