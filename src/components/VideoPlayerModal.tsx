import React, { useState, useRef, useEffect } from 'react';
import { 
  X, Play, Pause, RotateCcw, RotateCw, Volume2, VolumeX, 
  Maximize, Minimize, Settings, Sparkles, Clock, AlertCircle
} from 'lucide-react';
import { Movie } from '../types';
import { getMediaBlob } from '../utils/db';

interface VideoPlayerModalProps {
  movie: Movie | null;
  onClose: () => void;
  language: 'tl' | 'en';
}

export const VideoPlayerModal: React.FC<VideoPlayerModalProps> = ({
  movie,
  onClose,
  language
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.9);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [videoSrc, setVideoSrc] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Load video source (from IndexedDB blob if available, or direct URL)
  useEffect(() => {
    let objectUrlToRevoke: string | null = null;
    let isCancelled = false;

    async function loadVideo() {
      if (!movie) return;
      setIsLoading(true);
      setHasError(false);

      try {
        if (movie.videoBlobKey) {
          const blob = await getMediaBlob(movie.videoBlobKey);
          if (blob && !isCancelled) {
            const url = URL.createObjectURL(blob);
            objectUrlToRevoke = url;
            setVideoSrc(url);
            setIsLoading(false);
            return;
          }
        }

        // Fallback to videoUrl
        if (!isCancelled) {
          setVideoSrc(movie.videoUrl || '');
          setIsLoading(false);
        }
      } catch (err) {
        console.error('Failed to load video:', err);
        if (!isCancelled) {
          setVideoSrc(movie.videoUrl || '');
          setIsLoading(false);
        }
      }
    }

    loadVideo();

    return () => {
      isCancelled = true;
      if (objectUrlToRevoke) {
        URL.revokeObjectURL(objectUrlToRevoke);
      }
    };
  }, [movie]);

  // Handle controls auto-hide after mouse inactivity
  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
        setShowSpeedMenu(false);
      }
    }, 3000);
  };

  useEffect(() => {
    return () => {
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    };
  }, [isPlaying]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!movie) return;
      if (e.code === 'Space') {
        e.preventDefault();
        togglePlay();
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        skip(-10);
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        skip(10);
      } else if (e.code === 'KeyM') {
        e.preventDefault();
        toggleMute();
      } else if (e.code === 'KeyF') {
        e.preventDefault();
        toggleFullscreen();
      } else if (e.code === 'Escape') {
        if (isFullscreen) {
          document.exitFullscreen?.();
        } else {
          onClose();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [movie, isPlaying, isMuted, isFullscreen]);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play().catch(console.error);
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const skip = (seconds: number) => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = Math.max(0, Math.min(videoRef.current.duration, videoRef.current.currentTime + seconds));
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    setCurrentTime(videoRef.current.currentTime);
  };

  const handleLoadedMetadata = () => {
    if (!videoRef.current) return;
    setDuration(videoRef.current.duration);
    setIsLoading(false);
    videoRef.current.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const targetTime = Number(e.target.value);
    setCurrentTime(targetTime);
    if (videoRef.current) {
      videoRef.current.currentTime = targetTime;
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVol = Number(e.target.value);
    setVolume(newVol);
    if (videoRef.current) {
      videoRef.current.volume = newVol;
      videoRef.current.muted = newVol === 0;
      setIsMuted(newVol === 0);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    const nextMuted = !isMuted;
    videoRef.current.muted = nextMuted;
    setIsMuted(nextMuted);
  };

  const setSpeed = (rate: number) => {
    setPlaybackSpeed(rate);
    if (videoRef.current) {
      videoRef.current.playbackRate = rate;
    }
    setShowSpeedMenu(false);
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(console.error);
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(console.error);
      setIsFullscreen(false);
    }
  };

  const formatVideoTime = (seconds: number) => {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  if (!movie) return null;

  return (
    <div 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="fixed inset-0 z-50 bg-black flex items-center justify-center select-none overflow-hidden"
    >
      {/* Top Bar Overlay */}
      <div 
        className={`absolute top-0 inset-x-0 p-4 sm:p-6 bg-gradient-to-b from-black/90 via-black/40 to-transparent flex items-center justify-between z-30 transition-opacity duration-300 ${
          showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="flex items-center gap-3 max-w-xl">
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-neutral-900/80 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-700 transition-colors"
            title="Bumalik (Close)"
          >
            <X className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-extrabold text-white truncate font-['Cinzel',serif]">
                {movie.title}
              </h2>
              {movie.isUserUploaded && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500 text-white">
                  Original
                </span>
              )}
            </div>
            <p className="text-xs text-neutral-400 truncate">
              {language === 'tl' ? `Direksyon ni ${movie.director}` : `Directed by ${movie.director}`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {movie.videoResolution && (
            <span className="px-2 py-0.5 rounded text-xs font-bold bg-amber-400/90 text-neutral-950">
              {movie.videoResolution}
            </span>
          )}
        </div>
      </div>

      {/* Main Video Element */}
      <div 
        onClick={togglePlay}
        className="w-full h-full flex items-center justify-center cursor-pointer relative"
      >
        {videoSrc ? (
          <video
            ref={videoRef}
            src={videoSrc}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onEnded={() => setIsPlaying(false)}
            onError={() => {
              setHasError(true);
              setIsLoading(false);
            }}
            playsInline
            className="max-h-full max-w-full object-contain"
          />
        ) : (
          <div className="text-center text-neutral-400 space-y-3">
            <AlertCircle className="w-10 h-10 mx-auto text-amber-400" />
            <p className="text-sm">Walang available na video stream.</p>
          </div>
        )}

        {/* Loading Spinner */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
            <div className="w-12 h-12 border-4 border-amber-400 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* Error notification */}
        {hasError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 text-white p-6 space-y-4">
            <AlertCircle className="w-12 h-12 text-rose-500" />
            <h3 className="text-lg font-bold">Hindi ma-load ang video</h3>
            <p className="text-xs text-neutral-400 max-w-md text-center">
              Maaaring unavailable ang remote stream o kailangan ng supported video codec.
            </p>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-xs font-semibold rounded-lg"
            >
              Isara
            </button>
          </div>
        )}
      </div>

      {/* Bottom Controls Bar Overlay */}
      <div 
        className={`absolute bottom-0 inset-x-0 p-4 sm:p-6 bg-gradient-to-t from-black/95 via-black/60 to-transparent z-30 transition-opacity duration-300 space-y-3 ${
          showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Timeline Slider */}
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-neutral-300 min-w-12 text-right">
            {formatVideoTime(currentTime)}
          </span>
          <div className="relative flex-1 group/slider py-1">
            <input
              type="range"
              min={0}
              max={duration || 100}
              step={0.1}
              value={currentTime}
              onChange={handleSeek}
              className="w-full h-1.5 bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-amber-400 group-hover/slider:h-2 transition-all"
            />
          </div>
          <span className="text-xs font-mono text-neutral-400 min-w-12">
            {formatVideoTime(duration)}
          </span>
        </div>

        {/* Action Controls Row */}
        <div className="flex items-center justify-between">
          {/* Left: Play, Skip, Volume */}
          <div className="flex items-center gap-3 sm:gap-4">
            <button
              onClick={togglePlay}
              className="p-2 rounded-full bg-amber-400 hover:bg-amber-300 text-neutral-950 transition-transform active:scale-95"
              title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
            >
              {isPlaying ? <Pause className="w-5 h-5 fill-neutral-950" /> : <Play className="w-5 h-5 fill-neutral-950 ml-0.5" />}
            </button>

            <button
              onClick={() => skip(-10)}
              className="p-1.5 text-neutral-300 hover:text-white transition-colors"
              title="Skip -10s"
            >
              <RotateCcw className="w-5 h-5" />
            </button>

            <button
              onClick={() => skip(10)}
              className="p-1.5 text-neutral-300 hover:text-white transition-colors"
              title="Skip +10s"
            >
              <RotateCw className="w-5 h-5" />
            </button>

            {/* Volume */}
            <div className="flex items-center gap-2 group/volume">
              <button
                onClick={toggleMute}
                className="p-1.5 text-neutral-300 hover:text-white transition-colors"
                title="Mute (M)"
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="w-5 h-5 text-rose-400" />
                ) : (
                  <Volume2 className="w-5 h-5" />
                )}
              </button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-16 sm:w-20 h-1 bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-amber-400"
              />
            </div>
          </div>

          {/* Right: Speed, Theater, Fullscreen */}
          <div className="flex items-center gap-2 sm:gap-3 relative">
            {/* Speed Control */}
            <div className="relative">
              <button
                onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                className="px-2 py-1 rounded text-xs font-semibold text-neutral-300 hover:text-white bg-neutral-800/80 border border-neutral-700"
              >
                {playbackSpeed}x
              </button>

              {showSpeedMenu && (
                <div className="absolute bottom-full right-0 mb-2 py-1 bg-neutral-900 border border-neutral-800 rounded-lg shadow-xl flex flex-col min-w-20 z-40">
                  {[0.5, 0.75, 1, 1.25, 1.5, 2].map((spd) => (
                    <button
                      key={spd}
                      onClick={() => setSpeed(spd)}
                      className={`px-3 py-1.5 text-xs text-left hover:bg-neutral-800 ${
                        playbackSpeed === spd ? 'text-amber-400 font-bold' : 'text-neutral-300'
                      }`}
                    >
                      {spd}x
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Fullscreen Button */}
            <button
              onClick={toggleFullscreen}
              className="p-1.5 text-neutral-300 hover:text-white transition-colors"
              title="Fullscreen (F)"
            >
              {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
