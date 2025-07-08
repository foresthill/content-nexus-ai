'use client';

export default function HeroIllustration() {
  return (
    <div className="relative w-full h-full flex items-center justify-center p-8">
      <svg
        width="400"
        height="300"
        viewBox="0 0 400 300"
        className="w-full h-full max-w-lg animate-float"
      >
        <defs>
          <linearGradient id="heroGradient1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3B82F6" />
            <stop offset="100%" stopColor="#8B5CF6" />
          </linearGradient>
          <linearGradient id="heroGradient2" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#10B981" />
            <stop offset="100%" stopColor="#06B6D4" />
          </linearGradient>
          <linearGradient id="heroGradient3" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F59E0B" />
            <stop offset="100%" stopColor="#EF4444" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge> 
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* 背景の円 */}
        <circle cx="200" cy="150" r="120" fill="url(#heroGradient1)" opacity="0.1" className="animate-pulse" />
        
        {/* メインのデバイス */}
        <rect x="100" y="80" width="200" height="140" rx="15" fill="white" stroke="url(#heroGradient1)" strokeWidth="3" filter="url(#glow)" />
        
        {/* 画面 */}
        <rect x="110" y="90" width="180" height="100" rx="8" fill="url(#heroGradient1)" opacity="0.8" />
        
        {/* コンテンツライン */}
        <rect x="120" y="100" width="100" height="4" rx="2" fill="white" opacity="0.9" />
        <rect x="120" y="110" width="140" height="4" rx="2" fill="white" opacity="0.7" />
        <rect x="120" y="120" width="80" height="4" rx="2" fill="white" opacity="0.5" />
        
        {/* チャート表現 */}
        <rect x="120" y="140" width="15" height="30" rx="2" fill="url(#heroGradient2)" className="animate-pulse" style={{ animationDelay: '0.5s' }} />
        <rect x="140" y="150" width="15" height="20" rx="2" fill="url(#heroGradient2)" className="animate-pulse" style={{ animationDelay: '1s' }} />
        <rect x="160" y="135" width="15" height="35" rx="2" fill="url(#heroGradient2)" className="animate-pulse" style={{ animationDelay: '1.5s' }} />
        <rect x="180" y="145" width="15" height="25" rx="2" fill="url(#heroGradient2)" className="animate-pulse" style={{ animationDelay: '2s' }} />
        
        {/* 浮遊する要素 */}
        <circle cx="80" cy="100" r="12" fill="url(#heroGradient2)" className="animate-bounce" style={{ animationDelay: '1s', animationDuration: '3s' }} />
        <circle cx="320" cy="120" r="10" fill="url(#heroGradient3)" className="animate-bounce" style={{ animationDelay: '2s', animationDuration: '2.5s' }} />
        <circle cx="90" cy="200" r="8" fill="url(#heroGradient1)" className="animate-bounce" style={{ animationDelay: '0.5s', animationDuration: '3.5s' }} />
        <circle cx="310" cy="210" r="14" fill="url(#heroGradient2)" className="animate-bounce" style={{ animationDelay: '1.5s', animationDuration: '2.8s' }} />
        
        {/* AI要素 */}
        <g className="animate-pulse" style={{ animationDuration: '2s' }}>
          <circle cx="250" cy="110" r="6" fill="url(#heroGradient3)" />
          <circle cx="260" cy="115" r="4" fill="url(#heroGradient3)" opacity="0.8" />
          <circle cx="255" cy="125" r="5" fill="url(#heroGradient3)" opacity="0.9" />
        </g>
        
        {/* 接続線 */}
        <path d="M250 110 Q270 120 280 110" stroke="url(#heroGradient3)" strokeWidth="2" fill="none" opacity="0.6" className="animate-pulse" />
        <path d="M255 125 Q275 135 285 125" stroke="url(#heroGradient3)" strokeWidth="2" fill="none" opacity="0.6" className="animate-pulse" style={{ animationDelay: '1s' }} />
        
        {/* 装飾的な星 */}
        <g className="animate-spin" style={{ animationDuration: '10s' }}>
          <polygon points="50,50 55,60 65,60 57,67 60,77 50,72 40,77 43,67 35,60 45,60" fill="url(#heroGradient3)" opacity="0.7" />
        </g>
        <g className="animate-spin" style={{ animationDuration: '15s', animationDirection: 'reverse' }}>
          <polygon points="350,60 353,66 359,66 354,70 356,76 350,73 344,76 346,70 341,66 347,66" fill="url(#heroGradient2)" opacity="0.8" />
        </g>
        
        {/* データフロー */}
        <g className="animate-pulse" style={{ animationDuration: '3s' }}>
          <circle cx="120" cy="250" r="3" fill="url(#heroGradient1)" />
          <circle cx="140" cy="250" r="3" fill="url(#heroGradient1)" opacity="0.8" />
          <circle cx="160" cy="250" r="3" fill="url(#heroGradient1)" opacity="0.6" />
          <circle cx="180" cy="250" r="3" fill="url(#heroGradient1)" opacity="0.4" />
          <circle cx="200" cy="250" r="3" fill="url(#heroGradient1)" opacity="0.2" />
        </g>
      </svg>
      
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}