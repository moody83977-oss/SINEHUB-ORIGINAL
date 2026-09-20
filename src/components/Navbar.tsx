import React, { useState } from 'react';
import { Film, Upload, Search, Bookmark, Video, Sparkles, Globe, X } from 'lucide-react';

interface NavbarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onOpenUpload: () => void;
  onOpenStudio: () => void;
  onOpenWatchlist: () => void;
  userMoviesCount: number;
  watchlistCount: number;
  language: 'tl' | 'en';
  onToggleLanguage: () => void;
  onShowAllMovies: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  searchQuery,
  onSearchChange,
  onOpenUpload,
  onOpenStudio,
  onOpenWatchlist,
  userMoviesCount,
  watchlistCount,
  language,
  onToggleLanguage,
  onShowAllMovies
}) => {
  const [searchFocused, setSearchFocused] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full bg-neutral-950/85 backdrop-blur-md border-b border-neutral-800/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4">
        {/* Brand & Logo */}
        <div 
          onClick={onShowAllMovies}
          className="flex items-center gap-3 cursor-pointer group select-none flex-shrink-0"
          id="sinehub-logo-brand"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 via-rose-600 to-red-600 flex items-center justify-center text-white shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform duration-200">
            <Film className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-extrabold tracking-tight text-white font-['Cinzel',serif]">
                SINE<span className="text-amber-400">HUB</span>
              </span>
              <span className="px-1.5 py-0.5 text-[10px] uppercase font-bold tracking-wider rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                ORIGINALS
              </span>
            </div>
            <p className="text-[11px] text-neutral-400 leading-none">
              {language === 'tl' ? 'Pelikulang Orihinal at Indie' : 'Original & Indie Cinema'}
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="flex-1 max-w-md hidden md:block">
          <div className={`relative transition-all duration-200 ${searchFocused ? 'scale-[1.01]' : ''}`}>
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              type="text"
              id="sinehub-search-input"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              placeholder={language === 'tl' ? 'Maghanap ng pelikula, direktor, o genre...' : 'Search movies, directors, or genres...'}
              className="w-full bg-neutral-900/90 text-sm text-neutral-100 placeholder-neutral-500 pl-10 pr-9 py-2 rounded-full border border-neutral-700/70 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/50 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white"
                title="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Language Toggle */}
          <button
            onClick={onToggleLanguage}
            id="btn-language-toggle"
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-neutral-300 hover:text-white bg-neutral-900/80 hover:bg-neutral-800 rounded-lg border border-neutral-800 transition-colors"
            title={language === 'tl' ? 'Lumipat sa Ingles' : 'Switch to Tagalog'}
          >
            <Globe className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-semibold">{language === 'tl' ? 'FIL' : 'ENG'}</span>
          </button>

          {/* Watchlist */}
          <button
            onClick={onOpenWatchlist}
            id="btn-watchlist"
            className="relative flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-neutral-200 hover:text-white bg-neutral-900/80 hover:bg-neutral-800 rounded-lg border border-neutral-800 transition-colors"
          >
            <Bookmark className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline">
              {language === 'tl' ? 'Watchlist' : 'Watchlist'}
            </span>
            {watchlistCount > 0 && (
              <span className="bg-amber-500 text-neutral-950 text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                {watchlistCount}
              </span>
            )}
          </button>

          {/* Creator Studio / My Uploads */}
          <button
            onClick={onOpenStudio}
            id="btn-creator-studio"
            className="relative flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-neutral-200 hover:text-white bg-neutral-900/80 hover:bg-neutral-800 rounded-lg border border-neutral-800 transition-colors"
            title={language === 'tl' ? 'Tingnan ang iyong mga in-upload na pelikula' : 'View your uploaded original films'}
          >
            <Video className="w-4 h-4 text-rose-400" />
            <span className="hidden sm:inline">
              {language === 'tl' ? 'Aking Pelikula' : 'My Movies'}
            </span>
            {userMoviesCount > 0 && (
              <span className="bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                {userMoviesCount}
              </span>
            )}
          </button>

          {/* Upload Button */}
          <button
            onClick={onOpenUpload}
            id="btn-upload-movie-header"
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-neutral-950 bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 hover:from-amber-300 hover:to-amber-400 rounded-lg shadow-md shadow-amber-500/20 hover:shadow-amber-500/35 transition-all transform active:scale-95"
          >
            <Upload className="w-4 h-4 text-neutral-950" />
            <span>
              {language === 'tl' ? 'Mag-upload ng Pelikula' : 'Upload Movie'}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Search Bar */}
      <div className="px-4 pb-3 md:hidden">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            type="text"
            id="sinehub-search-input-mobile"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={language === 'tl' ? 'Maghanap ng pelikula...' : 'Search movies...'}
            className="w-full bg-neutral-900 text-sm text-neutral-100 placeholder-neutral-500 pl-10 pr-9 py-2 rounded-full border border-neutral-700/70 focus:outline-none focus:border-amber-500"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
