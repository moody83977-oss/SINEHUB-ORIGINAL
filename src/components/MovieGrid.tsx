import React from 'react';
import { SlidersHorizontal, Upload, Sparkles, Film, ArrowUpDown } from 'lucide-react';
import { Movie, SortOption } from '../types';
import { MovieCard } from './MovieCard';
import { GENRE_LIST } from '../data/defaultMovies';

interface MovieGridProps {
  movies: Movie[];
  selectedGenre: string;
  onSelectGenre: (genre: string) => void;
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  onPlay: (movie: Movie) => void;
  onSelectMovie: (movie: Movie) => void;
  watchlistIds: Set<string>;
  onToggleWatchlist: (movie: Movie) => void;
  onDeleteMovie: (movie: Movie) => void;
  onEditMovie: (movie: Movie) => void;
  onOpenUpload: () => void;
  language: 'tl' | 'en';
  userMoviesCount: number;
}

export const MovieGrid: React.FC<MovieGridProps> = ({
  movies,
  selectedGenre,
  onSelectGenre,
  sortBy,
  onSortChange,
  onPlay,
  onSelectMovie,
  watchlistIds,
  onToggleWatchlist,
  onDeleteMovie,
  onEditMovie,
  onOpenUpload,
  language,
  userMoviesCount
}) => {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Category Tabs & Sort Filter Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-800 pb-5">
        {/* Genre Pill List */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none no-scrollbar">
          {GENRE_LIST.map((genre) => {
            const isSelected = selectedGenre === genre;
            const isMyUploadsTab = genre === 'Aking Uploads';

            return (
              <button
                key={genre}
                onClick={() => onSelectGenre(genre)}
                className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-amber-400 text-neutral-950 shadow-md shadow-amber-400/20 scale-105'
                    : 'bg-neutral-900 text-neutral-300 hover:bg-neutral-800 hover:text-white border border-neutral-800'
                }`}
              >
                {isMyUploadsTab && <Sparkles className="w-3.5 h-3.5 text-rose-400" />}
                <span>
                  {genre === 'Aking Uploads' 
                    ? (language === 'tl' ? 'Aking Uploads' : 'My Uploads')
                    : genre === 'Lahat (All)'
                    ? (language === 'tl' ? 'Lahat ng Pelikula' : 'All Movies')
                    : genre
                  }
                </span>
                {isMyUploadsTab && userMoviesCount > 0 && (
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                    isSelected ? 'bg-neutral-950 text-amber-400' : 'bg-rose-500 text-white'
                  }`}>
                    {userMoviesCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Sort Dropdown */}
        <div className="flex items-center gap-3 self-end md:self-center flex-shrink-0">
          <div className="flex items-center gap-2 text-xs text-neutral-400">
            <ArrowUpDown className="w-3.5 h-3.5 text-amber-400" />
            <span>{language === 'tl' ? 'Ayusin ayon sa:' : 'Sort by:'}</span>
            <select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value as SortOption)}
              className="bg-neutral-900 border border-neutral-700/80 rounded-lg text-neutral-200 text-xs py-1.5 px-2.5 focus:outline-none focus:border-amber-500 cursor-pointer"
            >
              <option value="featured">{language === 'tl' ? 'Tampok (Featured)' : 'Featured'}</option>
              <option value="newest">{language === 'tl' ? 'Pinakabago (Newest)' : 'Newest'}</option>
              <option value="rating">{language === 'tl' ? 'Mataas ang Rating' : 'Highest Rated'}</option>
              <option value="duration">{language === 'tl' ? 'Haba ng Pelikula' : 'Duration'}</option>
              <option value="title">{language === 'tl' ? 'Pamagat (A-Z)' : 'Title (A-Z)'}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Movies Grid / Content */}
      {movies.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
          {movies.map((movie) => (
            <MovieCard
              key={movie.id}
              movie={movie}
              onPlay={onPlay}
              onSelectMovie={onSelectMovie}
              isInWatchlist={watchlistIds.has(movie.id)}
              onToggleWatchlist={onToggleWatchlist}
              onDeleteMovie={onDeleteMovie}
              onEditMovie={onEditMovie}
              language={language}
            />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="py-20 flex flex-col items-center justify-center text-center px-4 bg-neutral-900/30 rounded-2xl border border-neutral-800/60">
          <div className="w-16 h-16 rounded-2xl bg-neutral-800/80 flex items-center justify-center text-amber-400 mb-4 shadow-inner">
            <Film className="w-8 h-8 opacity-70" />
          </div>
          <h3 className="text-lg font-bold text-white mb-1 font-['Cinzel',serif]">
            {language === 'tl' ? 'Walang nahanap na pelikula' : 'No movies found'}
          </h3>
          <p className="text-sm text-neutral-400 max-w-md mb-6">
            {selectedGenre === 'Aking Uploads'
              ? (language === 'tl'
                  ? 'Wala ka pang na-upload na sariling orihinal na pelikula. Simulan na ang pag-upload gamit ang button sa ibaba!'
                  : "You haven't uploaded any original films yet. Start sharing your creations!")
              : (language === 'tl'
                  ? 'Subukang magpalit ng genre o tanggalin ang search filter para makakita ng iba pang pelikula.'
                  : 'Try selecting a different genre or clearing your search filter.')
            }
          </p>

          <div className="flex items-center gap-3">
            {selectedGenre !== 'Lahat (All)' && (
              <button
                onClick={() => onSelectGenre('Lahat (All)')}
                className="px-4 py-2 rounded-lg bg-neutral-800 text-neutral-300 hover:text-white text-xs font-semibold transition-colors"
              >
                {language === 'tl' ? 'Ipakita Lahat' : 'Show All'}
              </button>
            )}
            <button
              onClick={onOpenUpload}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-neutral-950 text-xs font-bold shadow-md shadow-amber-500/20 transition-all"
            >
              <Upload className="w-4 h-4" />
              <span>{language === 'tl' ? 'Mag-upload ng Pelikula' : 'Upload Original Movie'}</span>
            </button>
          </div>
        </div>
      )}
    </section>
  );
};
