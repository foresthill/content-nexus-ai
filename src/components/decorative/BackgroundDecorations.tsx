'use client';

import { useEffect, useState } from 'react';

export default function BackgroundDecorations() {
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; delay: number }>>([]);

  useEffect(() => {
    // パーティクルを生成
    const newParticles = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 5,
    }));
    setParticles(newParticles);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* 背景グラデーション */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 opacity-60" />
      
      {/* 幾何学的パターン */}
      <div className="absolute inset-0">
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 1200 800"
          className="absolute inset-0 opacity-20"
        >
          <defs>
            <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
              <path
                d="M 60 0 L 0 0 0 60"
                fill="none"
                stroke="url(#gradient1)"
                strokeWidth="1"
                opacity="0.3"
              />
            </pattern>
            <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3B82F6" />
              <stop offset="100%" stopColor="#8B5CF6" />
            </linearGradient>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* 浮遊する装飾要素 */}
      <div className="absolute inset-0">
        {/* 大きな円形 */}
        <div className="absolute top-20 right-20 w-96 h-96 bg-gradient-to-r from-blue-200 to-indigo-200 rounded-full opacity-20 animate-pulse" />
        <div className="absolute bottom-20 left-20 w-80 h-80 bg-gradient-to-r from-purple-200 to-pink-200 rounded-full opacity-20 animate-pulse" style={{ animationDelay: '2s' }} />
        
        {/* 中型の装飾 */}
        <div className="absolute top-1/3 left-1/4 w-32 h-32 bg-gradient-to-r from-yellow-200 to-orange-200 rounded-full opacity-30 animate-bounce" style={{ animationDelay: '1s', animationDuration: '4s' }} />
        <div className="absolute bottom-1/3 right-1/4 w-24 h-24 bg-gradient-to-r from-green-200 to-blue-200 rounded-full opacity-30 animate-bounce" style={{ animationDelay: '3s', animationDuration: '3s' }} />
      </div>

      {/* パーティクル */}
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute w-2 h-2 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full opacity-60 animate-ping"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            animationDelay: `${particle.delay}s`,
            animationDuration: '3s',
          }}
        />
      ))}

      {/* 装飾的なSVG要素 */}
      <div className="absolute top-10 left-10 opacity-30">
        <svg width="120" height="120" viewBox="0 0 120 120" className="animate-spin" style={{ animationDuration: '20s' }}>
          <circle
            cx="60"
            cy="60"
            r="50"
            fill="none"
            stroke="url(#decorativeGradient)"
            strokeWidth="2"
            strokeDasharray="10 5"
          />
          <defs>
            <linearGradient id="decorativeGradient">
              <stop offset="0%" stopColor="#3B82F6" />
              <stop offset="50%" stopColor="#8B5CF6" />
              <stop offset="100%" stopColor="#EC4899" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      <div className="absolute bottom-10 right-10 opacity-30">
        <svg width="100" height="100" viewBox="0 0 100 100" className="animate-pulse">
          <polygon
            points="50,10 80,80 20,80"
            fill="none"
            stroke="url(#decorativeGradient2)"
            strokeWidth="2"
          />
          <defs>
            <linearGradient id="decorativeGradient2">
              <stop offset="0%" stopColor="#10B981" />
              <stop offset="100%" stopColor="#3B82F6" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* 流れるような装飾線 */}
      <div className="absolute inset-0">
        <svg width="100%" height="100%" className="opacity-20">
          <defs>
            <linearGradient id="flowingGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="transparent" />
              <stop offset="50%" stopColor="#3B82F6" />
              <stop offset="100%" stopColor="transparent" />
              <animateTransform
                attributeName="gradientTransform"
                type="translate"
                values="-100 0;100 0;-100 0"
                dur="4s"
                repeatCount="indefinite"
              />
            </linearGradient>
          </defs>
          <path
            d="M0,400 Q300,200 600,400 T1200,400"
            stroke="url(#flowingGradient)"
            strokeWidth="3"
            fill="none"
          />
          <path
            d="M0,500 Q400,300 800,500 T1200,500"
            stroke="url(#flowingGradient)"
            strokeWidth="2"
            fill="none"
            opacity="0.7"
          />
        </svg>
      </div>
    </div>
  );
}