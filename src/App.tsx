import React, { useState } from 'react';
import { Film, Sparkles, Search, PlusCircle, Play, Star } from 'lucide-react';
import { UploadMovieModal } from './components/UploadMovieModal';
import { VideoPlayerModal } from './components/VideoPlayerModal';
import { Movie } from './types';

const GENRES = [
  'Lahat (All)',
  'Aksyon (Action)',
  'Drama',
  'Katatakutan (Horror)',
  'Komedya (Comedy)',
  'Romansa (Romance)',
  'Sci-Fi',
  'Misteryo (Mystery)',
];

const INITIAL_MOVIES: Movie[] = [
  {
    id: 'sample-1',
    title: 'Heneral Luna',
    tagline: 'Bayan o sarili?',
    description: 'Ang kwento ng isa sa pinakamatapang na heneral ng rebolusyong Pilipino laban sa pwersang Amerikano.',
    director: 'Jerrold Tarog',
    year: 2015,
    genre: 'Drama',
    duration: '118 min',
    rating: 4.9,
    quality: '1080p Full HD',
    posterUrl: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=800&q=80',
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    isOriginal: true,
  },
  {
    id: 'sample-2',
    title: 'Goyo: Ang Batang Heneral',
    tagline: 'Ang pinakabatang heneral sa kasaysayan.',
    description: 'Ang paglalakbay at huling laban ni Gregorio del Pilar sa Tirad Pass.',
    director: 'Jerrold Tarog',
    year: 2018,
    genre: 'Drama',
    duration: '155 min',
    rating: 4.8,
    quality: '1080p Full HD',
    posterUrl: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=800&q=80',
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    isOriginal: true,
  }
];

export default function App() {
  const [movies, setMovies] = useState<Movie[]>(() => {
    try {
      const saved = localStorage.getItem('sinehub_movies_list');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error(e);
    }
    return INITIAL_MOVIES;
  });

  const [selectedGenre, setSelectedGenre] = useState('Lahat (All)');
  const [searchQuery, setSearchQuery] = useState('');
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [playingMovie, setPlayingMovie] = useState<Movie | null>(null);

  const handleSaveMovie = (newMovie: Movie) => {
    const updated = [newMovie, ...movies.filter((m) => m.id !== newMovie.id)];
    setMovies(updated);
    try {
      localStorage.setItem('sinehub_movies_list', JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  };

  const filteredMovies = movies.filter((m) => {
    const matchesGenre =
      selectedGenre === 'Lahat (All)' || (m.genre && m.genre.toLowerCase().includes(selectedGenre.toLowerCase()));
    const matchesSearch =
      (m.title && m.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (m.director && m.director.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (m.genre && m.genre.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesGenre && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-neutral-950 text-white flex flex-col font-sans">
      {/* Navbar */}
      <nav className="h-16 bg-neutral-900 border-b border-neutral-800 sticky top-0 z-40 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500 text-neutral-950 flex items-center justify-center font-black shadow-lg shadow-amber-500/20">
            <Film className="w-5 h-5" />
          </div>
          <span className="text-xl font-black text-white font-cinzel tracking-wider">
            SINE<span className="text-amber-500">HUB</span>
          </span>
        </div>

        <div className="flex-1 max-w-md mx-4 hidden sm:block">
          <div className="relative">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Maghanap ng pelikula..."
              className="w-full bg-neutral-800/90 text-sm text-white placeholder-neutral-500 rounded-xl pl-9 pr-4 py-2 border border-neutral-700 focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        <button
          onClick={() => setIsUploadOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold rounded-xl text-xs sm:text-sm transition-all"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Mag-upload</span>
        </button>
      </nav>

      {/* Hero Header */}
      <div className="relative py-10 px-4 sm:px-6 lg:px-8 border-b border-neutral-800 bg-gradient-to-b from-amber-500/10 via-neutral-950 to-neutral-950">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 text-xs font-semibold mb-3 border border-amber-500/20">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Libreng Manood • Walang Ads</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-black text-white font-cinzel tracking-wide">
              Maligayang Pagdating sa <span className="text-amber-500">SineHub</span>
            </h1>
            <p className="mt-2 text-sm md:text-base text-neutral-400 max-w-xl">
              I-paste ang Google Drive o YouTube links ng paborito mong pelikula at mag-stream agad!
            </p>
          </div>

          <button
            onClick={() => setIsUploadOpen(true)}
            className="flex items-center gap-2.5 px-6 py-3 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold rounded-xl shadow-xl shadow-amber-500/20 transition-all"
          >
            <Film className="w-5 h-5" />
            <span>Mag-upload ng Pelikula</span>
          </button>
        </div>
      </div>

      {/* Genre Filter Bar */}
      <div className="border-b border-neutral-800/80 bg-neutral-950 sticky top-16 z-30 px-4 sm:px-6 lg:px-8 py-3">
        <div className="max-w-7xl mx-auto flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {GENRES.map((g) => (
            <button
              key={g}
              onClick={() => setSelectedGenre(g)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedGenre === g
                  ? 'bg-amber-500 text-neutral-950 shadow-md'
                  : 'bg-neutral-900 text-neutral-400 hover:text-white hover:bg-neutral-800 border border-neutral-800'
              }`}
            >
              {g}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
          {filteredMovies.map((movie) => {
            const safeRating = typeof movie.rating === 'number' ? movie.rating.toFixed(1) : '5.0';
            return (
              <div
                key={movie.id}
                onClick={() => setPlayingMovie(movie)}
                className="group relative bg-neutral-900 rounded-2xl overflow-hidden border border-neutral-800 hover:border-amber-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-amber-500/10 cursor-pointer flex flex-col"
              >
                <div className="relative aspect-[2/3] w-full overflow-hidden bg-neutral-950">
                  <img
                    src={movie.posterUrl || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=800&q=80'}
                    alt={movie.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/20 to-transparent opacity-80" />
                  <div className="absolute top-3 left-3 bg-neutral-900/80 backdrop-blur-md px-2.5 py-1 rounded-md text-[10px] font-bold text-amber-400 border border-amber-500/30">
                    {movie.quality || '1080p Full HD'}
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-14 h-14 rounded-full bg-amber-500 text-neutral-950 flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
                      <Play className="w-6 h-6 fill-current translate-x-0.5" />
                    </div>
                  </div>
                </div>

                <div className="p-4 flex flex-col flex-1 justify-between">
                  <div>
                    <span className="text-[11px] font-semibold text-amber-500 uppercase tracking-wider">
                      {movie.genre}
                    </span>
                    <h3 className="font-bold text-white text-base mt-1 line-clamp-1 group-hover:text-amber-400 transition-colors">
                      {movie.title}
                    </h3>
                    <p className="text-xs text-neutral-400 mt-1 line-clamp-2">
                      {movie.description}
                    </p>
                  </div>

                  <div className="flex items-center justify-between text-xs text-neutral-400 mt-4 pt-3 border-t border-neutral-800/80">
                    <div className="flex items-center gap-1 text-amber-400 font-bold">
                      <Star className="w-3.5 h-3.5 fill-current" />
                      <span>{safeRating}</span>
                    </div>
                    <span>{movie.year}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* Modals */}
      <UploadMovieModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onSaveMovie={handleSaveMovie}
      />

      <VideoPlayerModal movie={playingMovie} onClose={() => setPlayingMovie(null)} />
    </div>
  );
}

export { App };
