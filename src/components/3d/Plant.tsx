import React, { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Mesh } from 'three'

interface PlantProps {
  position: [number, number, number]
  rotation?: [number, number, number]
  scale?: number
}

export default function Plant({ position, rotation = [0, 0, 0], scale = 1 }: PlantProps) {
  const leavesRef = useRef<Mesh>(null)
  const stemRef = useRef<Mesh>(null)

  useFrame((state) => {
    if (leavesRef.current) {
      leavesRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.05
    }
    if (stemRef.current) {
      stemRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.8) * 0.02
    }
  })

  return (
    <group position={position} rotation={rotation} scale={scale}>
      {/* 植木鉢 */}
      <mesh position={[0, 0.15, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.25, 0.3, 0.3]} />
        <meshStandardMaterial color="#8B4513" roughness={0.8} />
      </mesh>
      
      {/* 土 */}
      <mesh position={[0, 0.28, 0]} receiveShadow>
        <cylinderGeometry args={[0.24, 0.24, 0.02]} />
        <meshStandardMaterial color="#654321" roughness={0.9} />
      </mesh>
      
      {/* 茎 */}
      <mesh ref={stemRef} position={[0, 0.6, 0]} castShadow>
        <cylinderGeometry args={[0.02, 0.03, 0.6]} />
        <meshStandardMaterial color="#228B22" roughness={0.6} />
      </mesh>
      
      {/* 葉っぱ群 */}
      <group ref={leavesRef} position={[0, 0.8, 0]}>
        {/* 中央の大きな葉 */}
        <mesh position={[0, 0.2, 0]} castShadow>
          <sphereGeometry args={[0.3, 8, 6]} />
          <meshStandardMaterial color="#32CD32" roughness={0.4} />
        </mesh>
        
        {/* 左の葉 */}
        <mesh position={[-0.3, 0.1, 0.1]} rotation={[0, 0, 0.5]} castShadow>
          <sphereGeometry args={[0.2, 8, 6]} />
          <meshStandardMaterial color="#228B22" roughness={0.4} />
        </mesh>
        
        {/* 右の葉 */}
        <mesh position={[0.3, 0.1, -0.1]} rotation={[0, 0, -0.5]} castShadow>
          <sphereGeometry args={[0.2, 8, 6]} />
          <meshStandardMaterial color="#228B22" roughness={0.4} />
        </mesh>
        
        {/* 後ろの葉 */}
        <mesh position={[0, 0.05, -0.25]} rotation={[0.3, 0, 0]} castShadow>
          <sphereGeometry args={[0.18, 8, 6]} />
          <meshStandardMaterial color="#32CD32" roughness={0.4} />
        </mesh>
        
        {/* 前の小さな葉 */}
        <mesh position={[0.1, 0, 0.3]} rotation={[-0.3, 0.2, 0]} castShadow>
          <sphereGeometry args={[0.15, 8, 6]} />
          <meshStandardMaterial color="#90EE90" roughness={0.4} />
        </mesh>
      </group>
    </group>
  )
}