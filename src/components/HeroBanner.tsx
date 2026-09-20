import React from 'react';
import { Play, Info, Bookmark, BookmarkCheck, Sparkles, Film, Star, Clock } from 'lucide-react';
import { Movie } from '../types';
import { formatDuration } from '../utils/formatters';

interface HeroBannerProps {
  movie: Movie | null;
  onPlay: (movie: Movie) => void;
  onSelectMovie: (movie: Movie) => void;
  isInWatchlist: boolean;
  onToggleWatchlist: (movie: Movie) => void;
  language: 'tl' | 'en';
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  movie,
  onPlay,
  onSelectMovie,
  isInWatchlist,
  onToggleWatchlist,
  language
}) => {
  if (!movie) return null;

  const backdrop = movie.backdropUrl || movie.posterUrl;

  return (
    <div className="relative w-full h-[520px] sm:h-[580px] lg:h-[640px] overflow-hidden bg-neutral-950 select-none">
      {/* Background Image with Dark Vignette Gradients */}
      <div 
        className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 transform scale-105"
        style={{ backgroundImage: `url(${backdrop})` }}
      >
        {/* Gradients to blend into dark cinema interface */}
        <div className="absolute inset-0 bg-gradient-to-r from-neutral-950 via-neutral-950/80 to-transparent w-full md:w-3/4" />
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/40 to-transparent" />
        <div className="absolute inset-0 bg-radial-at-c from-transparent via-neutral-950/30 to-neutral-950/90" />
      </div>

      {/* Content Container */}
      <div className="relative max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8 flex flex-col justify-end pb-12 sm:pb-16 z-10">
        <div className="max-w-2xl space-y-4">
          {/* Badges / Spotlight indicator */}
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
            {movie.isUserUploaded ? (
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 backdrop-blur-sm">
                <Sparkles className="w-3.5 h-3.5 text-rose-400" />
                {language === 'tl' ? 'Aking Bagong Pelikulang Orihinal' : 'Your New Original Film'}
              </span>
            ) : (
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 backdrop-blur-sm">
                <Film className="w-3.5 h-3.5 text-amber-400" />
                {language === 'tl' ? 'Tampok na Pelikulang Indie' : 'Featured Indie Premiere'}
              </span>
            )}

            <span className="px-2 py-0.5 rounded bg-neutral-800/80 text-neutral-300 border border-neutral-700/60">
              {movie.releaseYear}
            </span>

            <span className="px-2 py-0.5 rounded bg-neutral-800/80 text-neutral-300 border border-neutral-700/60">
              {movie.ageRating}
            </span>

            <span className="flex items-center gap-1 text-neutral-300">
              <Clock className="w-3.5 h-3.5 text-neutral-400" />
              {formatDuration(movie.durationMinutes, language)}
            </span>

            {movie.videoResolution && (
              <span className="px-1.5 py-0.5 rounded text-[11px] font-bold bg-amber-400 text-neutral-950">
                {movie.videoResolution}
              </span>
            )}

            <div className="flex items-center gap-1 text-amber-400 ml-1">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span className="text-white font-bold">{movie.averageRating.toFixed(1)}</span>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight font-['Cinzel',serif] drop-shadow-md">
            {movie.title}
          </h1>

          {/* Tagline or Director info */}
          <p className="text-sm sm:text-base text-amber-300/90 font-medium italic">
            {movie.tagline || (language === 'tl' ? `Direksyon ni ${movie.director}` : `Directed by ${movie.director}`)}
          </p>

          {/* Synopsis preview */}
          <p className="text-sm sm:text-base text-neutral-300 line-clamp-3 leading-relaxed max-w-xl">
            {movie.synopsis}
          </p>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => onPlay(movie)}
              id="hero-play-button"
              className="flex items-center gap-2.5 px-6 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold text-sm sm:text-base shadow-lg shadow-amber-500/25 transition-all transform active:scale-95"
            >
              <Play className="w-5 h-5 fill-neutral-950 text-neutral-950" />
              <span>{language === 'tl' ? 'Panoorin Ngayon' : 'Play Movie'}</span>
            </button>

            <button
              onClick={() => onSelectMovie(movie)}
              id="hero-details-button"
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-neutral-900/80 hover:bg-neutral-800 text-white font-semibold text-sm sm:text-base border border-neutral-700/80 backdrop-blur-sm transition-colors"
            >
              <Info className="w-5 h-5 text-neutral-300" />
              <span>{language === 'tl' ? 'Mga Detalye' : 'Details & Crew'}</span>
            </button>

            <button
              onClick={() => onToggleWatchlist(movie)}
              id="hero-watchlist-button"
              className="flex items-center gap-2 px-4 py-3 rounded-xl bg-neutral-900/80 hover:bg-neutral-800 text-white text-sm sm:text-base border border-neutral-700/80 backdrop-blur-sm transition-colors"
              title={isInWatchlist ? 'Remove from Watchlist' : 'Add to Watchlist'}
            >
              {isInWatchlist ? (
                <>
                  <BookmarkCheck className="w-5 h-5 text-amber-400" />
                  <span className="hidden sm:inline text-xs font-semibold text-amber-400">
                    {language === 'tl' ? 'Naka-save' : 'Saved'}
                  </span>
                </>
              ) : (
                <>
                  <Bookmark className="w-5 h-5 text-neutral-300" />
                  <span className="hidden sm:inline text-xs font-semibold">
                    {language === 'tl' ? 'I-save' : 'Watchlist'}
                  </span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
