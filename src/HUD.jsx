

export function HUD({
  isPlaying,
  onTogglePlay,
  onReset,
  speed,
  onSpeedChange,
  currentIndex,
  total = 41,
  onJumpTo,
}) {
  return (
    <div className="video-ui">
      {/* Bottom Controls */}
      <div className="video-bottom-bar">
        {/* Scrubber */}
        <div className="progress-container" onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const clamp = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
          onJumpTo(Math.min(total - 1, Math.floor(clamp * total)));
        }}>
          <div className="progress-bg">
            <div 
              className="progress-fill" 
              style={{ width: `${(currentIndex / Math.max(1, total - 1)) * 100}%` }} 
            />
          </div>
        </div>
        
        <div className="controls-row">
          <div className="controls-left">
            <button className="icon-btn" onClick={onTogglePlay} title={isPlaying ? "Pause" : "Play"}>
              {isPlaying ? '⏸' : '▶'}
            </button>
            <button className="icon-btn restart-btn" onClick={onReset} title="Restart (R)">
              ↺
            </button>
            <span className="time-display">
              {String(currentIndex + 1).padStart(2, '0')} / {total}
            </span>
          </div>

          <div className="controls-right">
             <div className="speed-control">
              <label>Speed</label>
              <input
                type="range"
                className="speed-slider"
                min="0.5"
                max="4"
                step="0.1"
                value={speed}
                onChange={e => onSpeedChange(Number(e.target.value))}
              />
              <span className="speed-val">{speed.toFixed(1)}x</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
