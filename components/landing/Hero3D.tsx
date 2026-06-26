'use client'

import { useRef, Suspense } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Float, Environment, ContactShadows, MeshDistortMaterial } from '@react-three/drei'
import * as THREE from 'three'

// A stylized floating dumbbell built from primitives
function Dumbbell() {
  const groupRef = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (!groupRef.current) return
    // Gentle rotation following pointer X
    const t = state.clock.getElapsedTime()
    groupRef.current.rotation.y = t * 0.3
    groupRef.current.rotation.z = Math.sin(t * 0.4) * 0.08
  })

  const barColor = '#E2E8F0'
  const weightColor = '#22C55E'

  return (
    <group ref={groupRef} scale={1.1}>
      {/* Bar */}
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.16, 0.16, 3.2, 32]} />
        <meshStandardMaterial color={barColor} metalness={0.9} roughness={0.2} />
      </mesh>

      {/* Left weights (outer) */}
      <mesh position={[-1.6, 0, 0]}>
        <cylinderGeometry args={[0.75, 0.75, 0.5, 48]} />
        <meshStandardMaterial color={weightColor} metalness={0.6} roughness={0.25} />
      </mesh>
      {/* Left weights (inner) */}
      <mesh position={[-1.15, 0, 0]}>
        <cylinderGeometry args={[0.6, 0.6, 0.45, 48]} />
        <meshStandardMaterial color={weightColor} metalness={0.6} roughness={0.25} />
      </mesh>

      {/* Right weights (outer) */}
      <mesh position={[1.6, 0, 0]}>
        <cylinderGeometry args={[0.75, 0.75, 0.5, 48]} />
        <meshStandardMaterial color={weightColor} metalness={0.6} roughness={0.25} />
      </mesh>
      {/* Right weights (inner) */}
      <mesh position={[1.15, 0, 0]}>
        <cylinderGeometry args={[0.6, 0.6, 0.45, 48]} />
        <meshStandardMaterial color={weightColor} metalness={0.6} roughness={0.25} />
      </mesh>

      {/* End caps */}
      {[-1.85, 1.85].map((x, i) => (
        <mesh key={i} position={[x, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.2, 0.2, 0.15, 32]} />
          <meshStandardMaterial color={barColor} metalness={0.9} roughness={0.2} />
        </mesh>
      ))}
    </group>
  )
}

// Small orbiting spheres for atmosphere
function OrbitingSpheres() {
  const ref = useRef<THREE.Group>(null)
  useFrame((state) => {
    if (!ref.current) return
    ref.current.rotation.y = state.clock.getElapsedTime() * 0.15
  })

  const spheres = [
    { pos: [2.8, 1.2, -1] as const, scale: 0.18, color: '#22C55E' },
    { pos: [-2.6, -1.4, -0.5] as const, scale: 0.14, color: '#4ADE80' },
    { pos: [2.2, -1.6, 0.8] as const, scale: 0.12, color: '#16A34A' },
    { pos: [-2.9, 0.8, 0.3] as const, scale: 0.1, color: '#22C55E' },
  ]

  return (
    <group ref={ref}>
      {spheres.map((s, i) => (
        <Float key={i} speed={2 + i * 0.3} rotationIntensity={1} floatIntensity={1.5}>
          <mesh position={s.pos} scale={s.scale}>
            <sphereGeometry args={[1, 32, 32]} />
            <MeshDistortMaterial
              color={s.color}
              distort={0.3}
              speed={2}
              emissive={s.color}
              emissiveIntensity={0.2}
            />
          </mesh>
        </Float>
      ))}
    </group>
  )
}

export function Hero3D() {
  return (
    <Canvas
      camera={{ position: [0, 0.5, 6], fov: 45 }}
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true }}
      style={{ width: '100%', height: '100%' }}
    >
      <Suspense fallback={null}>
        {/* Lighting */}
        <ambientLight intensity={0.4} />
        <directionalLight position={[5, 8, 5]} intensity={1.5} color="#ffffff" />
        <pointLight position={[-5, -3, -5]} intensity={0.8} color="#22C55E" />
        <spotLight position={[0, 6, 3]} intensity={1} angle={0.4} penumbra={1} color="#4ADE80" />

        {/* Main dumbbell floating */}
        <Float speed={1.5} rotationIntensity={0.3} floatIntensity={0.8}>
          <Dumbbell />
        </Float>

        {/* Atmosphere */}
        <OrbitingSpheres />

        {/* Environment for realistic reflections */}
        <Environment preset="city" />

        {/* Soft shadow */}
        <ContactShadows
          position={[0, -2.2, 0]}
          opacity={0.4}
          scale={10}
          blur={2.5}
          far={4}
          color="#22C55E"
        />
      </Suspense>
    </Canvas>
  )
}
