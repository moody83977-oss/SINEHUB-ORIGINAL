import React, { useState, useEffect } from 'react';
import { X, ExternalLink, Share2, Film } from 'lucide-react';
import { Movie } from '../types';

interface VideoPlayerModalProps {
  movie: Movie | null;
  onClose: () => void;
}

export const VideoPlayerModal: React.FC<VideoPlayerModalProps> = ({ movie, onClose }) => {
  const [embedUrl, setEmbedUrl] = useState('');
  const [rawDriveUrl, setRawDriveUrl] = useState('');

  useEffect(() => {
    if (!movie?.videoUrl) {
      setEmbedUrl('');
      setRawDriveUrl('');
      return;
    }

    const url = movie.videoUrl.trim();

    // Google Drive
    if (url.includes('drive.google.com')) {
      const idMatch = url.match(/\/d\/([a-zA-Z0-9_-]+)/) || url.match(/id=([a-zA-Z0-9_-]+)/);
      if (idMatch && idMatch[1]) {
        setEmbedUrl(`https://drive.google.com/file/d/${idMatch[1]}/preview`);
        setRawDriveUrl(`https://drive.google.com/file/d/${idMatch[1]}/view`);
      } else {
        setEmbedUrl(url);
        setRawDriveUrl(url);
      }
      return;
    }

    // YouTube
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      let videoId = '';
      if (url.includes('youtu.be')) {
        videoId = url.split('/').pop()?.split('?')[0] || '';
      } else {
        try {
          videoId = new URL(url).searchParams.get('v') || '';
        } catch {
          videoId = url.split('v=')[1]?.split('&')[0] || '';
        }
      }
      if (videoId) {
        setEmbedUrl(`https://www.youtube.com/embed/${videoId}?autoplay=1`);
      } else {
        setEmbedUrl(url);
      }
      setRawDriveUrl('');
      return;
    }

    setEmbedUrl(url);
    setRawDriveUrl('');
  }, [movie]);

  if (!movie) return null;

  const isDirectVideo = Boolean(movie.videoUrl?.match(/\.(mp4|webm|ogg)$/i));

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-2 sm:p-4">
      <div className="relative w-full max-w-5xl bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[95vh]">
        {/* Top bar */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-neutral-800 bg-neutral-950">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 text-xs font-bold border border-amber-500/20">
              {movie.quality || '1080p HD'}
            </span>
            <h2 className="text-white font-bold text-sm sm:text-base truncate max-w-md">
              {movie.title}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            {rawDriveUrl && (
              <a
                href={rawDriveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-amber-400 text-xs font-semibold transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Buksan sa Google Drive</span>
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

        {/* Player Area */}
        <div className="relative w-full bg-black aspect-video flex items-center justify-center">
          {isDirectVideo ? (
            <video
              controls
              autoPlay
              src={movie.videoUrl}
              className="w-full h-full"
            />
          ) : (
            <iframe
              src={embedUrl}
              title={movie.title}
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
              allowFullScreen
            />
          )}
        </div>

        {/* Video Details */}
        <div className="p-5 overflow-y-auto bg-neutral-900 flex-1">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-bold text-white">{movie.title}</h3>
              {movie.tagline && <p className="text-xs text-amber-500 italic mt-0.5">{movie.tagline}</p>}
            </div>
            <div className="flex items-center gap-2">
              {rawDriveUrl && (
                <a
                  href={rawDriveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="sm:hidden flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 text-amber-400 text-xs font-semibold"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Buksan sa Drive</span>
                </a>
              )}
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
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 p-3 bg-neutral-950/60 rounded-xl border border-neutral-800 text-xs">
            <div>
              <span className="text-neutral-500 block">Direktor</span>
              <span className="text-neutral-200 font-semibold">{movie.director || 'Hindi tinukoy'}</span>
            </div>
            <div>
              <span className="text-neutral-500 block">Genre</span>
              <span className="text-neutral-200 font-semibold">{movie.genre || 'Pelikula'}</span>
            </div>
            <div>
              <span className="text-neutral-500 block">Taon</span>
              <span className="text-neutral-200 font-semibold">{movie.year || 2024}</span>
            </div>
            <div>
              <span className="text-neutral-500 block">Rating</span>
              <span className="text-amber-400 font-semibold">{movie.rating || 5.0} / 5.0</span>
            </div>
          </div>

          <div className="mt-4">
            <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Buod (Synopsis)</h4>
            <p className="mt-1.5 text-sm text-neutral-300 leading-relaxed">{movie.description || 'Walang buod na inilagay.'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayerModal;
