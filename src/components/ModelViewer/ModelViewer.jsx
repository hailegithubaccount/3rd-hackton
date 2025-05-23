import React, { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, useGLTF } from '@react-three/drei'

function Model() {
  const { scene } = useGLTF('/models/dress_3_la_dame_a_la_licorne.glb') // Adjust the path if needed
  return <primitive object={scene} scale={1.5} />
}

export default function ModelViewer() {
  return (
    <Canvas camera={{ position: [0, 2, 5], fov: 50 }}>
      <ambientLight intensity={0.6} />
      <directionalLight position={[3, 2, 5]} />
      <Suspense fallback={null}>
        <Model />
      </Suspense>
      <OrbitControls />
    </Canvas>
  )
}
