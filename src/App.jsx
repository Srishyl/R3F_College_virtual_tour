import { useState, useCallback, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';
import { HUD } from './HUD';
import { SlideshowScene } from './SlideshowScene';

const TOTAL = 41;
const IMAGE_URLS = Array.from({ length: TOTAL }, (_, i) => {
  const n = String(i + 1).padStart(4, '0');
  return `/college/IMG_4071_${n}.jpg`;
});

function LoadingScreen({ visible, progress }) {
  return (
    <div className={`loading-overlay${!visible ? ' hidden' : ''}`}>
      <div className="loading-logo">COLLEGE</div>
      <div className="loading-subtitle">Virtual Campus Tour</div>
      <div className="loading-bar-wrap">
        <div className="loading-bar" style={{ width: `${progress}%` }} />
      </div>
      <div className="loading-status">
        {visible ? `Loading Textures: ${Math.round(progress)}%` : 'Ready!'}
      </div>
    </div>
  );
}

export default function App() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(0.5); 
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [showHUD, setShowHUD] = useState(false);

  // Preloading
  useEffect(() => {
    let loaded = 0;
    const toLoad = IMAGE_URLS;
    if (toLoad.length === 0) {
      setLoading(false);
      return;
    }
    toLoad.forEach(url => {
      const img = new Image();
      img.src = url;
      const onDone = () => {
        loaded++;
        setProgress((loaded / toLoad.length) * 100);
        if (loaded === toLoad.length) {
          setTimeout(() => {
            setLoading(false);
            setTimeout(() => {
              setShowHUD(true);
              setIsPlaying(true);
            }, 600);
          }, 300);
        }
      };
      img.onload = onDone;
      img.onerror = onDone;
    });
  }, []);

  // Video loop progression
  useEffect(() => {
    if (!isPlaying) return;
    
    // 3 seconds per image at 1x speed.
    const duration = 3000 / speed;
    const timer = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % TOTAL);
    }, duration);
    
    return () => clearInterval(timer);
  }, [isPlaying, speed]);

  const handleJumpTo = useCallback((idx) => {
    setCurrentIndex(idx);
  }, []);

  const handleReset = useCallback(() => {
    setIsPlaying(false);
    handleJumpTo(0);
  }, [handleJumpTo]);

  // Keyboard shortcuts
  useEffect(() => {
    const onKey = (e) => {
      if (e.code === 'Space') { e.preventDefault(); setIsPlaying(p => !p); }
      if (e.code === 'ArrowRight') handleJumpTo(Math.min(currentIndex + 1, TOTAL - 1));
      if (e.code === 'ArrowLeft')  handleJumpTo(Math.max(currentIndex - 1, 0));
      if (e.code === 'KeyR')       handleReset();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [currentIndex, handleJumpTo, handleReset]);

  return (
    <>
      <LoadingScreen visible={loading} progress={progress} />

      <Canvas
        camera={{ position: [0, 0, 5], fov: 50 }}
        gl={{
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          outputColorSpace: THREE.SRGBColorSpace,
        }}
        style={{ position: 'absolute', inset: 0, zIndex: 0 }}
      >
        <SlideshowScene imageUrls={IMAGE_URLS} currentIndex={currentIndex} />
      </Canvas>

      {showHUD && (
        <HUD
          isPlaying={isPlaying}
          onTogglePlay={() => setIsPlaying(p => !p)}
          onReset={handleReset}
          speed={speed}
          onSpeedChange={setSpeed}
          currentIndex={currentIndex}
          total={TOTAL}
          onJumpTo={handleJumpTo}
        />
      )}
    </>
  );
}
