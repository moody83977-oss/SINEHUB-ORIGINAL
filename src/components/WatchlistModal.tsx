import React from 'react';
import { X, Bookmark, Play, Trash2, Clock } from 'lucide-react';
import { Movie } from '../types';
import { formatDuration } from '../utils/formatters';

interface WatchlistModalProps {
  isOpen: boolean;
  onClose: () => void;
  watchlistMovies: Movie[];
  onPlay: (movie: Movie) => void;
  onRemoveFromWatchlist: (movie: Movie) => void;
  onSelectMovie: (movie: Movie) => void;
  language: 'tl' | 'en';
}

export const WatchlistModal: React.FC<WatchlistModalProps> = ({
  isOpen,
  onClose,
  watchlistMovies,
  onPlay,
  onRemoveFromWatchlist,
  onSelectMovie,
  language
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6">
      <div className="relative w-full max-w-2xl bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden my-8 select-none">
        {/* Header */}
        <div className="px-6 py-5 border-b border-neutral-800 flex items-center justify-between bg-neutral-950/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <Bookmark className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-white font-['Cinzel',serif]">
                {language === 'tl' ? 'Aking Watchlist' : 'My Watchlist'}
              </h2>
              <p className="text-xs text-neutral-400">
                {watchlistMovies.length} {language === 'tl' ? 'na pelikulang naka-save' : 'movies saved to watch'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-white p-2 rounded-lg hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-3 max-h-[70vh] overflow-y-auto">
          {watchlistMovies.length > 0 ? (
            watchlistMovies.map((movie) => (
              <div
                key={movie.id}
                className="p-3 rounded-xl bg-neutral-950/60 border border-neutral-800/80 flex items-center justify-between gap-4 hover:border-neutral-700 transition-colors"
              >
                <div 
                  onClick={() => {
                    onClose();
                    onSelectMovie(movie);
                  }}
                  className="flex items-center gap-3 cursor-pointer flex-1 min-w-0"
                >
                  <img
                    src={movie.posterUrl}
                    alt={movie.title}
                    className="w-12 h-16 object-cover rounded-lg bg-neutral-800 flex-shrink-0"
                  />
                  <div className="min-w-0">
                    <h4 className="text-sm font-bold text-white truncate hover:text-amber-400 transition-colors font-['Cinzel',serif]">
                      {movie.title}
                    </h4>
                    <p className="text-xs text-neutral-400 truncate">
                      {movie.director} • {movie.genre.slice(0, 2).join(', ')}
                    </p>
                    <p className="text-[11px] text-neutral-500 flex items-center gap-1 mt-0.5">
                      <Clock className="w-3 h-3" />
                      {formatDuration(movie.durationMinutes, language)} • {movie.releaseYear}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => {
                      onClose();
                      onPlay(movie);
                    }}
                    className="p-2 rounded-lg bg-amber-400 hover:bg-amber-300 text-neutral-950 text-xs font-bold flex items-center gap-1 transition-colors"
                    title={language === 'tl' ? 'Panoorin' : 'Play'}
                  >
                    <Play className="w-3.5 h-3.5 fill-neutral-950" />
                    <span className="hidden sm:inline text-xs">Play</span>
                  </button>

                  <button
                    onClick={() => onRemoveFromWatchlist(movie)}
                    className="p-2 rounded-lg text-neutral-400 hover:text-rose-400 hover:bg-neutral-800 transition-colors"
                    title={language === 'tl' ? 'Alisin sa watchlist' : 'Remove from watchlist'}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 text-neutral-400 space-y-2">
              <Bookmark className="w-8 h-8 mx-auto opacity-40 text-amber-400" />
              <p className="text-sm font-semibold">
                {language === 'tl' ? 'Walang laman ang iyong watchlist' : 'Your watchlist is currently empty'}
              </p>
              <p className="text-xs text-neutral-500">
                {language === 'tl'
                  ? 'I-click ang bookmark icon sa alinmang pelikula upang i-save ito rito.'
                  : 'Click the bookmark icon on any movie to save it for later.'
                }
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
