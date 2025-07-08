import React, { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Mesh } from 'three'

interface ChairProps {
  position: [number, number, number]
  rotation?: [number, number, number]
  color?: string
}

export default function Chair({ position, rotation = [0, 0, 0], color = '#8B4513' }: ChairProps) {
  const chairRef = useRef<Mesh>(null)

  useFrame((state) => {
    if (chairRef.current) {
      chairRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.1
    }
  })

  return (
    <group position={position} rotation={rotation}>
      {/* 座面 */}
      <mesh ref={chairRef} position={[0, 0.4, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.8, 0.08, 0.8]} />
        <meshStandardMaterial color={color} roughness={0.3} />
      </mesh>
      
      {/* 背もたれ */}
      <mesh position={[0, 0.8, -0.35]} castShadow receiveShadow>
        <boxGeometry args={[0.8, 0.8, 0.08]} />
        <meshStandardMaterial color={color} roughness={0.3} />
      </mesh>
      
      {/* 脚部 - 前左 */}
      <mesh position={[-0.3, 0.15, 0.3]} castShadow receiveShadow>
        <cylinderGeometry args={[0.04, 0.04, 0.3]} />
        <meshStandardMaterial color={color} roughness={0.3} />
      </mesh>
      
      {/* 脚部 - 前右 */}
      <mesh position={[0.3, 0.15, 0.3]} castShadow receiveShadow>
        <cylinderGeometry args={[0.04, 0.04, 0.3]} />
        <meshStandardMaterial color={color} roughness={0.3} />
      </mesh>
      
      {/* 脚部 - 後左 */}
      <mesh position={[-0.3, 0.15, -0.3]} castShadow receiveShadow>
        <cylinderGeometry args={[0.04, 0.04, 0.3]} />
        <meshStandardMaterial color={color} roughness={0.3} />
      </mesh>
      
      {/* 脚部 - 後右 */}
      <mesh position={[0.3, 0.15, -0.3]} castShadow receiveShadow>
        <cylinderGeometry args={[0.04, 0.04, 0.3]} />
        <meshStandardMaterial color={color} roughness={0.3} />
      </mesh>
    </group>
  )
}