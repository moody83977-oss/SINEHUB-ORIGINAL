import React, { useState, useEffect } from 'react';
import { X, ExternalLink, Share2, Film, MonitorPlay, Maximize2 } from 'lucide-react';
import { Movie } from '../types';

interface VideoPlayerModalProps {
  movie: Movie | null;
  onClose: () => void;
}

export const VideoPlayerModal: React.FC<VideoPlayerModalProps> = ({ movie, onClose }) => {
  const [embedUrl, setEmbedUrl] = useState<string>('');
  const [directUrl, setDirectUrl] = useState<string>('');
  const [isDirectVideo, setIsDirectVideo] = useState<boolean>(false);

  useEffect(() => {
    if (!movie?.videoUrl) {
      setEmbedUrl('');
      setDirectUrl('');
      setIsDirectVideo(false);
      return;
    }

    let url = movie.videoUrl.trim();
    setDirectUrl(url);

    // 1. YouTube
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
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
      setEmbedUrl(`https://www.youtube.com/embed/${id}?autoplay=1`);
      setIsDirectVideo(false);
      return;
    }

    // 2. Byse / ByseSukior (bysesukior.com, byse.tv, etc.)
    if (url.includes('byse') || url.includes('sukior')) {
      // Convert /d/ or /f/ to /e/ embed
      const id = url.split('/').pop()?.split('?')[0] || '';
      url = `https://bysesukior.com/e/${id}`;
      setEmbedUrl(url);
      setDirectUrl(url);
      setIsDirectVideo(false);
      return;
    }

    // 3. Streamwish
    if (url.includes('streamwish') || url.includes('wish') || url.includes('swish')) {
      if (!url.includes('/e/')) {
        const id = url.split('/').pop()?.split('?')[0] || '';
        url = `https://streamwish.to/e/${id}`;
      }
      setEmbedUrl(url);
      setIsDirectVideo(false);
      return;
    }

    // 4. DoodStream
    if (url.includes('dood') || url.includes('ds2play')) {
      if (!url.includes('/e/')) {
        const id = url.split('/').pop()?.split('?')[0] || '';
        url = `https://dood.to/e/${id}`;
      }
      setEmbedUrl(url);
      setIsDirectVideo(false);
      return;
    }

    // 5. Filemoon
    if (url.includes('filemoon')) {
      if (!url.includes('/e/')) {
        const id = url.split('/').pop()?.split('?')[0] || '';
        url = `https://filemoon.sx/e/${id}`;
      }
      setEmbedUrl(url);
      setIsDirectVideo(false);
      return;
    }

    // 6. Direct MP4 / WebM
    if (url.match(/\.(mp4|webm|m4v)(\?.*)?$/i)) {
      setIsDirectVideo(true);
      setEmbedUrl(url);
      return;
    }

    // Default Embed
    setEmbedUrl(url);
    setIsDirectVideo(false);
  }, [movie]);

  if (!movie) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-2 sm:p-4">
      <div className="relative w-full max-w-5xl bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[95vh]">
        {/* Top Header */}
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
            {directUrl && (
              <a
                href={directUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-bold transition-colors"
              >
                <Maximize2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Fullscreen</span>
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

        {/* Video Player Frame */}
        <div className="relative w-full bg-black aspect-video flex items-center justify-center overflow-hidden">
          {isDirectVideo ? (
            <video
              controls
              autoPlay
              src={embedUrl}
              className="w-full h-full"
            />
          ) : embedUrl ? (
            <iframe
              src={embedUrl}
              title={movie.title}
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
              allowFullScreen
            />
          ) : (
            <div className="text-neutral-500 text-sm flex items-center gap-2">
              <Film className="w-5 h-5" /> Walang video link na nakalagay.
            </div>
          )}
        </div>

        {/* Stream Banner */}
        <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2.5 flex items-center justify-between gap-2 text-xs text-amber-400">
          <span className="truncate flex items-center gap-1.5">
            <MonitorPlay className="w-4 h-4 shrink-0" />
            <span>Mabilis na Cinema Stream: Tugma sa Cellphone, Laptop at TV</span>
          </span>
          {directUrl && (
            <a
              href={directUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold underline shrink-0 hover:text-amber-300 flex items-center gap-1"
            >
              <span>Buksan sa Fullscreen</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>

        {/* Movie Info */}
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
