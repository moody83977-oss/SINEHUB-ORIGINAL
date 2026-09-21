import React, { useState, useEffect } from 'react';
import { X, ExternalLink, Share2, Play, Film, Smartphone, Monitor } from 'lucide-react';
import { Movie } from '../types';

interface VideoPlayerModalProps {
  movie: Movie | null;
  onClose: () => void;
}

export const VideoPlayerModal: React.FC<VideoPlayerModalProps> = ({ movie, onClose }) => {
  const [driveId, setDriveId] = useState<string | null>(null);

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
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 text-neutral-950 text-xs font-bold hover:bg-amber-400 transition-colors shadow-sm"
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
              {/* Desktop view: Iframe */}
              <iframe
                src={drivePreviewUrl}
                title={movie.title}
                className="hidden sm:block w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                allowFullScreen
              />

              {/* Mobile View: Dedicated Smooth Cinema Card (No Google Docs bug) */}
              <div className="flex sm:hidden flex-col items-center justify-center text-center p-6 w-full h-full bg-gradient-to-b from-neutral-900 via-neutral-950 to-black">
                <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500 mb-3 shadow-lg shadow-amber-500/10">
                  <Film className="w-8 h-8" />
                </div>
                <h3 className="text-base font-bold text-white mb-1">{movie.title}</h3>
                <p className="text-xs text-neutral-400 mb-4 max-w-xs">
                  I-tap ang button sa ibaba upang i-play ang pelikula nang maayos at walang error sa iyong cellphone:
                </p>

                <a
                  href={driveDirectAppUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full max-w-xs py-3.5 px-6 bg-amber-500 hover:bg-amber-400 active:scale-95 text-neutral-950 font-black text-sm rounded-xl flex items-center justify-center gap-2 shadow-xl shadow-amber-500/30 transition-transform"
                >
                  <Play className="w-5 h-5 fill-current" />
                  <span>PANOORIN NGAYON (PLAY)</span>
                </a>
              </div>
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

        {/* Action Strip */}
        {driveId && (
          <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2.5 flex items-center justify-between gap-2 text-xs text-amber-400">
            <span className="truncate">Tugma sa lahat ng Android, iPhone at Computer:</span>
            <a
              href={driveDirectAppUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold underline shrink-0 hover:text-amber-300 flex items-center gap-1"
            >
              <span>Buksan sa Fullscreen</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        )}

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
