import React, { useState, useEffect } from 'react';
import { X, ExternalLink, Share2, Play, RefreshCw } from 'lucide-react';
import { Movie } from '../types';

interface VideoPlayerModalProps {
  movie: Movie | null;
  onClose: () => void;
}

export const VideoPlayerModal: React.FC<VideoPlayerModalProps> = ({ movie, onClose }) => {
  const [driveId, setDriveId] = useState<string | null>(null);
  const [playerMode, setPlayerMode] = useState<'embed' | 'direct'>('embed');

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
  const driveDirectStreamUrl = driveId ? `https://drive.google.com/uc?export=download&id=${driveId}` : url;
  const driveTabUrl = driveId ? `https://drive.google.com/file/d/${driveId}/view` : url;

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
            {driveId && (
              <a
                href={driveTabUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 text-neutral-950 text-xs font-bold hover:bg-amber-400 transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Panoorin sa Google Drive</span>
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

        {/* Video Area */}
        <div className="relative w-full bg-black aspect-video flex items-center justify-center">
          {driveId && playerMode === 'direct' ? (
            <video
              controls
              autoPlay
              src={driveDirectStreamUrl}
              className="w-full h-full"
            />
          ) : isYouTube ? (
            <iframe
              src={youtubeEmbed}
              title={movie.title}
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
              allowFullScreen
            />
          ) : (
            <iframe
              src={drivePreviewUrl}
              title={movie.title}
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
              allowFullScreen
            />
          )}
        </div>

        {/* Mode Selector for Google Drive */}
        {driveId && (
          <div className="bg-neutral-950 px-5 py-2.5 border-b border-neutral-800 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2 text-neutral-400">
              <span>Streaming Option:</span>
              <button
                onClick={() => setPlayerMode('embed')}
                className={`px-2.5 py-1 rounded-md font-semibold transition-colors ${
                  playerMode === 'embed'
                    ? 'bg-amber-500 text-neutral-950'
                    : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                }`}
              >
                Drive Preview
              </button>
              <button
                onClick={() => setPlayerMode('direct')}
                className={`px-2.5 py-1 rounded-md font-semibold transition-colors ${
                  playerMode === 'direct'
                    ? 'bg-amber-500 text-neutral-950'
                    : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                }`}
              >
                Direct Stream
              </button>
            </div>

            <span className="text-[11px] text-amber-500/80">
              Kapag mabagal mag-process si Drive, i-click ang <b>"Panoorin sa Google Drive"</b> sa itaas.
            </span>
          </div>
        )}

        {/* Details Footer */}
        <div className="p-5 overflow-y-auto bg-neutral-900 flex-1">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-bold text-white">{movie.title}</h3>
              {movie.tagline && <p className="text-xs text-amber-500 italic mt-0.5">{movie.tagline}</p>}
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
