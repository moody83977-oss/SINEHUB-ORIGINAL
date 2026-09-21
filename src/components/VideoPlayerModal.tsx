import React, { useState, useEffect } from 'react';
import { X, ExternalLink, Share2, Play, Film, Server, Zap } from 'lucide-react';
import { Movie } from '../types';

interface VideoPlayerModalProps {
  movie: Movie | null;
  onClose: () => void;
}

export const VideoPlayerModal: React.FC<VideoPlayerModalProps> = ({ movie, onClose }) => {
  const [driveId, setDriveId] = useState<string | null>(null);
  const [activeServer, setActiveServer] = useState<'drive' | 'direct' | 'preview'>('drive');

  useEffect(() => {
    if (!movie?.videoUrl) {
      setDriveId(null);
      return;
    }

    const url = movie.videoUrl.trim();
    if (url.includes('drive.google.com')) {
      const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/) || url.match(/id=([a-zA-Z0-9_-]+)/);
      if (match && match[1]) {
        setDriveId(match[1]);
      } else {
        setDriveId(null);
      }
    } else {
      setDriveId(null);
    }
  }, [movie]);

  if (!movie) return null;

  const url = movie.videoUrl.trim();
  const isYouTube = url.includes('youtube.com') || url.includes('youtu.be');
  let youtubeEmbed = '';
  if (isYouTube) {
    let id = '';
    if (url.includes('youtu.be')) {
      id = url.split('/').pop()?.split('?')[0] || '';
    } else {
      try {
        id = new URL(url).searchParams.get('v') || '';
      } catch {
        id = url.split('v=')[1]?.split('&')[0] || '';
      }
    }
    youtubeEmbed = `https://www.youtube.com/embed/${id}?autoplay=1`;
  }

  const drivePreviewUrl = driveId ? `https://drive.google.com/file/d/${driveId}/preview` : url;
  const driveDirectAppUrl = driveId ? `https://drive.google.com/file/d/${driveId}/view?usp=sharing` : url;
  const driveDownloadStreamUrl = driveId ? `https://drive.google.com/uc?id=${driveId}&export=download` : url;

  return (
    <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-2 sm:p-4">
      <div className="relative w-full max-w-5xl bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[95vh]">
        {/* Top bar */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-800 bg-neutral-950">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 text-xs font-bold border border-amber-500/20">
              {movie.quality || '1080p HD'}
            </span>
            <h2 className="text-white font-bold text-xs sm:text-base truncate max-w-[160px] sm:max-w-md">
              {movie.title}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            {driveId && (
              <a
                href={driveDirectAppUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 text-neutral-950 text-xs font-black hover:bg-amber-400 transition-colors shadow-sm"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Panoorin sa Phone</span>
              </a>
            )}
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-neutral-800 hover:bg-neutral-700 flex items-center justify-center text-neutral-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Streaming Servers Selector */}
        {driveId && (
          <div className="flex items-center gap-2 px-4 py-2 bg-neutral-950/80 border-b border-neutral-800 text-xs overflow-x-auto">
            <span className="text-neutral-500 flex items-center gap-1 shrink-0">
              <Server className="w-3.5 h-3.5" /> Server:
            </span>
            <button
              onClick={() => setActiveServer('drive')}
              className={`px-3 py-1 rounded-md font-semibold transition-colors shrink-0 flex items-center gap-1 ${
                activeServer === 'drive'
                  ? 'bg-amber-500 text-neutral-950'
                  : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
              }`}
            >
              <Zap className="w-3 h-3" /> Mobile High-Speed (Recommended)
            </button>
            <button
              onClick={() => setActiveServer('preview')}
              className={`px-3 py-1 rounded-md font-semibold transition-colors shrink-0 ${
                activeServer === 'preview'
                  ? 'bg-amber-500 text-neutral-950'
                  : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
              }`}
            >
              Web Embedded (Laptop)
            </button>
          </div>
        )}

        {/* Video Player Box */}
        <div className="relative w-full bg-black aspect-video flex items-center justify-center overflow-hidden">
          {isYouTube ? (
            <iframe
              src={youtubeEmbed}
              title={movie.title}
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
              allowFullScreen
            />
          ) : driveId ? (
            <div className="relative w-full h-full flex flex-col items-center justify-center">
              {activeServer === 'preview' ? (
                <iframe
                  src={drivePreviewUrl}
                  title={movie.title}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                  allowFullScreen
                />
              ) : (
                /* Mobile High-Speed Server with Instant Direct Player */
                <div className="flex flex-col items-center justify-center text-center p-6 w-full h-full bg-gradient-to-b from-neutral-900 via-neutral-950 to-black">
                  <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500 mb-3 shadow-lg shadow-amber-500/10">
                    <Film className="w-8 h-8" />
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-white mb-1">{movie.title}</h3>
                  <p className="text-xs text-neutral-400 mb-5 max-w-sm">
                    Ang pelikulang ito ay naka-1080p HD. I-tap ang button sa ibaba upang buksan sa official media player ng cellphone nang walang loading lag:
                  </p>

                  <div className="flex flex-col sm:flex-row gap-3 w-full max-w-sm">
                    <a
                      href={driveDirectAppUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 py-3 px-4 bg-amber-500 hover:bg-amber-400 active:scale-95 text-neutral-950 font-black text-sm rounded-xl flex items-center justify-center gap-2 shadow-xl shadow-amber-500/30 transition-transform"
                    >
                      <Play className="w-4 h-4 fill-current" />
                      <span>BUKSAN AT I-PLAY</span>
                    </a>
                    <a
                      href={driveDownloadStreamUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-3 px-4 bg-neutral-800 hover:bg-neutral-700 active:scale-95 text-neutral-200 font-semibold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-transform"
                    >
                      <span>Direct Link</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <video
              controls
              autoPlay
              src={url}
              className="w-full h-full"
            />
          )}
        </div>

        {/* Movie Details */}
        <div className="p-4 sm:p-5 overflow-y-auto bg-neutral-900 flex-1">
          <div className="flex items-center justify-between gap-2">
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-white">{movie.title}</h3>
              {movie.tagline && <p className="text-xs text-amber-500 italic">{movie.tagline}</p>}
            </div>
            <button
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                alert('Na-kopyang link ng pelikula!');
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-xs font-semibold text-neutral-300 transition-colors"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>I-share</span>
            </button>
          </div>

          <div className="mt-3">
            <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Buod</h4>
            <p className="mt-1 text-xs sm:text-sm text-neutral-300 leading-relaxed">{movie.description || 'Walang buod.'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayerModal;
