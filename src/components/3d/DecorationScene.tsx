'use client'

import React, { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment, ContactShadows } from '@react-three/drei'
import Chair from './Chair'
import Plant from './Plant'

function Scene() {
  return (
    <>
      {/* 環境照明 */}
      <Environment preset="apartment" />
      
      {/* 追加の照明 */}
      <ambientLight intensity={0.4} />
      <directionalLight
        position={[5, 10, 5]}
        intensity={1}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={50}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
      />
      
      {/* 床面 */}
      <mesh position={[0, -0.01, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#f0f0f0" roughness={0.1} />
      </mesh>
      
      {/* 接触影 */}
      <ContactShadows 
        position={[0, 0, 0]} 
        opacity={0.4} 
        scale={10} 
        blur={2} 
        far={4} 
      />
      
      {/* 椅子を複数配置 */}
      <Chair position={[-2, 0, 0]} rotation={[0, Math.PI / 4, 0]} color="#8B4513" />
      <Chair position={[2, 0, 2]} rotation={[0, -Math.PI / 6, 0]} color="#A0522D" />
      <Chair position={[0, 0, -3]} rotation={[0, Math.PI / 2, 0]} color="#D2691E" />
      
      {/* 植物を複数配置 */}
      <Plant position={[-4, 0, -2]} scale={1.2} />
      <Plant position={[4, 0, -1]} rotation={[0, Math.PI / 3, 0]} scale={0.8} />
      <Plant position={[1, 0, 4]} rotation={[0, -Math.PI / 4, 0]} scale={1.0} />
      <Plant position={[-1, 0, 3]} rotation={[0, Math.PI / 2, 0]} scale={1.1} />
      
      {/* 追加のデコレーション - 花瓶 */}
      <mesh position={[3, 0.3, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.15, 0.2, 0.6]} />
        <meshStandardMaterial color="#4169E1" roughness={0.1} metalness={0.2} />
      </mesh>
      
      {/* 小さなテーブル */}
      <group position={[-3, 0, 2]}>
        <mesh position={[0, 0.4, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.6, 0.6, 0.05]} />
          <meshStandardMaterial color="#8B4513" roughness={0.3} />
        </mesh>
        <mesh position={[0, 0.2, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.05, 0.05, 0.4]} />
          <meshStandardMaterial color="#8B4513" roughness={0.3} />
        </mesh>
      </group>
      
      {/* カメラコントロール */}
      <OrbitControls 
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minDistance={3}
        maxDistance={15}
        target={[0, 1, 0]}
      />
    </>
  )
}

export default function DecorationScene() {
  return (
    <div className="w-full h-screen bg-gradient-to-b from-sky-200 to-sky-100">
      <Canvas
        shadows
        camera={{ position: [8, 6, 8], fov: 50 }}
        gl={{ antialias: true }}
      >
        <Suspense fallback={null}>
          <Scene />
        </Suspense>
      </Canvas>
      
      {/* コントロール説明 */}
      <div className="absolute top-4 left-4 bg-white/80 backdrop-blur-sm rounded-lg p-4 shadow-lg">
        <h3 className="font-bold text-lg mb-2 text-gray-800">3Dデコレーション</h3>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• マウスドラッグ: 視点回転</li>
          <li>• ホイール: ズーム</li>
          <li>• 右クリック+ドラッグ: パン</li>
        </ul>
      </div>
    </div>
  )
}