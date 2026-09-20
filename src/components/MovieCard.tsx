import React, { useState } from 'react';
import { Play, Bookmark, BookmarkCheck, Star, Clock, Sparkles, Trash2, Edit3 } from 'lucide-react';
import { Movie } from '../types';
import { formatDuration } from '../utils/formatters';

interface MovieCardProps {
  movie: Movie;
  onPlay: (movie: Movie) => void;
  onSelectMovie: (movie: Movie) => void;
  isInWatchlist: boolean;
  onToggleWatchlist: (movie: Movie) => void;
  onDeleteMovie?: (movie: Movie) => void;
  onEditMovie?: (movie: Movie) => void;
  language: 'tl' | 'en';
}

export const MovieCard: React.FC<MovieCardProps> = ({
  movie,
  onPlay,
  onSelectMovie,
  isInWatchlist,
  onToggleWatchlist,
  onDeleteMovie,
  onEditMovie,
  language
}) => {
  const [imgError, setImgError] = useState(false);

  // Fallback poster generator if image fails
  const posterSource = !imgError && movie.posterUrl 
    ? movie.posterUrl 
    : 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=600&q=80';

  return (
    <div 
      className="group relative flex flex-col bg-neutral-900/60 rounded-xl overflow-hidden border border-neutral-800/80 hover:border-amber-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-amber-500/10 hover:-translate-y-1 select-none"
      id={`movie-card-${movie.id}`}
    >
      {/* Poster Media Box */}
      <div 
        onClick={() => onSelectMovie(movie)}
        className="relative aspect-[2/3] w-full overflow-hidden bg-neutral-950 cursor-pointer"
      >
        <img
          src={posterSource}
          alt={movie.title}
          onError={() => setImgError(true)}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />

        {/* Gradient shadow overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-transparent to-black/30 opacity-70 group-hover:opacity-90 transition-opacity" />

        {/* Top Badges */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between gap-1 z-10">
          {movie.isUserUploaded ? (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/90 text-white shadow-md backdrop-blur-md">
              <Sparkles className="w-3 h-3" />
              {language === 'tl' ? 'Aking Upload' : 'My Upload'}
            </span>
          ) : (
            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-neutral-900/80 text-neutral-300 border border-neutral-700 backdrop-blur-md">
              {movie.releaseYear}
            </span>
          )}

          <div className="flex items-center gap-1.5">
            {movie.videoResolution && (
              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-400 text-neutral-950">
                {movie.videoResolution.split(' ')[0]}
              </span>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleWatchlist(movie);
              }}
              className="p-1.5 rounded-full bg-neutral-900/80 hover:bg-neutral-800 text-neutral-200 hover:text-amber-400 border border-neutral-700/80 transition-colors"
              title={isInWatchlist ? 'Remove from Watchlist' : 'Add to Watchlist'}
            >
              {isInWatchlist ? (
                <BookmarkCheck className="w-3.5 h-3.5 text-amber-400" />
              ) : (
                <Bookmark className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        </div>

        {/* Quick Play Hover Button */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-neutral-950/40">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onPlay(movie);
            }}
            className="w-12 h-12 rounded-full bg-amber-400 hover:bg-amber-300 text-neutral-950 flex items-center justify-center shadow-lg shadow-amber-500/30 transform group-hover:scale-110 transition-transform active:scale-95"
            title={language === 'tl' ? 'Panoorin agad' : 'Quick play'}
          >
            <Play className="w-5 h-5 fill-neutral-950 text-neutral-950 ml-0.5" />
          </button>
        </div>

        {/* Bottom Poster Info (Duration & Rating) */}
        <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-[11px] text-neutral-300 font-medium">
          <span className="flex items-center gap-1 bg-black/60 px-2 py-0.5 rounded backdrop-blur-xs">
            <Clock className="w-3 h-3 text-neutral-400" />
            {formatDuration(movie.durationMinutes, language)}
          </span>
          <span className="flex items-center gap-1 bg-black/60 px-2 py-0.5 rounded text-amber-400 font-bold backdrop-blur-xs">
            <Star className="w-3 h-3 fill-amber-400" />
            {movie.averageRating.toFixed(1)}
          </span>
        </div>
      </div>

      {/* Info Block */}
      <div className="p-3.5 flex flex-col flex-1 justify-between gap-2">
        <div>
          <div className="flex items-center gap-1 text-[11px] text-amber-400 font-medium mb-1 truncate">
            {movie.genre.slice(0, 2).join(' • ')}
          </div>
          <h3 
            onClick={() => onSelectMovie(movie)}
            className="text-sm font-bold text-neutral-100 group-hover:text-amber-400 line-clamp-1 cursor-pointer transition-colors"
            title={movie.title}
          >
            {movie.title}
          </h3>
          <p className="text-xs text-neutral-400 truncate mt-0.5">
            {language === 'tl' ? `Direksyon: ${movie.director}` : `Dir: ${movie.director}`}
          </p>
        </div>

        {/* Card Footer / Actions */}
        <div className="pt-2 border-t border-neutral-800/80 flex items-center justify-between">
          <button
            onClick={() => onPlay(movie)}
            className="text-xs font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1 transition-colors"
          >
            <Play className="w-3.5 h-3.5 fill-amber-400" />
            <span>{language === 'tl' ? 'Panoorin' : 'Play'}</span>
          </button>

          {/* User movie actions if uploaded by creator */}
          {movie.isUserUploaded && (
            <div className="flex items-center gap-1">
              {onEditMovie && (
                <button
                  onClick={() => onEditMovie(movie)}
                  className="p-1 text-neutral-400 hover:text-neutral-200 transition-colors"
                  title={language === 'tl' ? 'I-edit ang detalye' : 'Edit details'}
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
              )}
              {onDeleteMovie && (
                <button
                  onClick={() => onDeleteMovie(movie)}
                  className="p-1 text-neutral-400 hover:text-rose-400 transition-colors"
                  title={language === 'tl' ? 'Burahin' : 'Delete'}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
