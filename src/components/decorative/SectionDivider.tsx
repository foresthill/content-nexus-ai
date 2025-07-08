'use client';

interface SectionDividerProps {
  variant?: 'wave' | 'geometric' | 'organic';
  color?: 'blue' | 'purple' | 'green' | 'gradient';
  direction?: 'up' | 'down';
}

export default function SectionDivider({ 
  variant = 'wave', 
  color = 'gradient', 
  direction = 'down' 
}: SectionDividerProps) {
  const getColorClass = () => {
    switch (color) {
      case 'blue':
        return 'text-blue-500';
      case 'purple':
        return 'text-purple-500';
      case 'green':
        return 'text-green-500';
      default:
        return 'text-blue-500';
    }
  };

  const WavePattern = () => (
    <svg
      viewBox="0 0 1200 120"
      preserveAspectRatio="none"
      className={`w-full h-16 ${direction === 'up' ? 'rotate-180' : ''}`}
    >
      <defs>
        <linearGradient id="waveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.8" />
          <stop offset="50%" stopColor="#8B5CF6" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#EC4899" stopOpacity="0.8" />
        </linearGradient>
      </defs>
      <path
        d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,101.3C672,75,768,53,864,58.7C960,64,1056,96,1152,112L1200,120L1200,0L1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z"
        fill="url(#waveGradient)"
        className="animate-pulse"
        style={{ animationDuration: '4s' }}
      />
      <path
        d="M0,64L48,74.7C96,85,192,107,288,101.3C384,96,480,64,576,58.7C672,53,768,75,864,90.7C960,107,1056,117,1152,112L1200,107L1200,0L1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z"
        fill="url(#waveGradient)"
        opacity="0.7"
        className="animate-pulse"
        style={{ animationDuration: '6s', animationDelay: '1s' }}
      />
    </svg>
  );

  const GeometricPattern = () => (
    <div className={`w-full h-16 relative overflow-hidden ${direction === 'up' ? 'rotate-180' : ''}`}>
      <svg viewBox="0 0 1200 120" className="w-full h-full">
        <defs>
          <linearGradient id="geoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#10B981" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.8" />
          </linearGradient>
        </defs>
        <polygon
          points="0,120 200,0 400,120 600,0 800,120 1000,0 1200,120 1200,0 0,0"
          fill="url(#geoGradient)"
          className="animate-pulse"
        />
        <polygon
          points="100,120 300,20 500,120 700,20 900,120 1100,20 1200,120 1200,0 0,0 0,120"
          fill="url(#geoGradient)"
          opacity="0.6"
          className="animate-pulse"
          style={{ animationDelay: '2s' }}
        />
      </svg>
    </div>
  );

  const OrganicPattern = () => (
    <div className={`w-full h-20 relative overflow-hidden ${direction === 'up' ? 'rotate-180' : ''}`}>
      <svg viewBox="0 0 1200 120" className="w-full h-full">
        <defs>
          <radialGradient id="organicGradient">
            <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#EF4444" stopOpacity="0.7" />
          </radialGradient>
        </defs>
        <path
          d="M0,60 Q100,20 200,60 T400,60 Q500,100 600,60 T800,60 Q900,20 1000,60 T1200,60 L1200,0 L0,0 Z"
          fill="url(#organicGradient)"
          className="animate-pulse"
          style={{ animationDuration: '5s' }}
        />
        <circle cx="150" cy="40" r="8" fill="url(#organicGradient)" className="animate-bounce" style={{ animationDelay: '1s', animationDuration: '3s' }} />
        <circle cx="350" cy="60" r="6" fill="url(#organicGradient)" className="animate-bounce" style={{ animationDelay: '2s', animationDuration: '2.5s' }} />
        <circle cx="550" cy="35" r="10" fill="url(#organicGradient)" className="animate-bounce" style={{ animationDelay: '0.5s', animationDuration: '3.5s' }} />
        <circle cx="750" cy="55" r="7" fill="url(#organicGradient)" className="animate-bounce" style={{ animationDelay: '1.5s', animationDuration: '2.8s' }} />
        <circle cx="950" cy="45" r="9" fill="url(#organicGradient)" className="animate-bounce" style={{ animationDelay: '3s', animationDuration: '3.2s' }} />
      </svg>
    </div>
  );

  const renderPattern = () => {
    switch (variant) {
      case 'geometric':
        return <GeometricPattern />;
      case 'organic':
        return <OrganicPattern />;
      default:
        return <WavePattern />;
    }
  };

  return (
    <div className="relative w-full">
      {renderPattern()}
      {/* 装飾的なパーティクル */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-2 left-1/4 w-2 h-2 bg-white rounded-full opacity-60 animate-ping" style={{ animationDelay: '1s' }} />
        <div className="absolute top-4 right-1/3 w-1.5 h-1.5 bg-white rounded-full opacity-70 animate-ping" style={{ animationDelay: '2s' }} />
        <div className="absolute bottom-2 left-1/2 w-2.5 h-2.5 bg-white rounded-full opacity-50 animate-ping" style={{ animationDelay: '0.5s' }} />
        <div className="absolute top-3 right-1/4 w-1 h-1 bg-white rounded-full opacity-80 animate-ping" style={{ animationDelay: '3s' }} />
      </div>
    </div>
  );
}