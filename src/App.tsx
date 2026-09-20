import React, { useState, useEffect, useMemo } from 'react';
import { Navbar } from './components/Navbar';
import { HeroBanner } from './components/HeroBanner';
import { MovieGrid } from './components/MovieGrid';
import { UploadMovieModal } from './components/UploadMovieModal';
import { VideoPlayerModal } from './components/VideoPlayerModal';
import { MovieDetailModal } from './components/MovieDetailModal';
import { CreatorStudioModal } from './components/CreatorStudioModal';
import { WatchlistModal } from './components/WatchlistModal';
import { DeleteConfirmModal } from './components/DeleteConfirmModal';
import { Footer } from './components/Footer';

import { Movie, Review, SortOption } from './types';
import { DEFAULT_MOVIES, INITIAL_REVIEWS } from './data/defaultMovies';
import { getAllMoviesFromDB, saveMovieToDB, deleteMovieFromDB, deleteMediaBlob } from './utils/db';

export default function App() {
  // Movies list state
  const [movies, setMovies] = useState<Movie[]>(DEFAULT_MOVIES);
  const [reviews, setReviews] = useState<Record<string, Review[]>>(INITIAL_REVIEWS);
  const [watchlistIds, setWatchlistIds] = useState<Set<string>>(new Set());

  // Filter & Search states
  const [selectedGenre, setSelectedGenre] = useState<string>('Lahat (All)');
  const [sortBy, setSortBy] = useState<SortOption>('featured');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [language, setLanguage] = useState<'tl' | 'en'>('tl');

  // Modal states
  const [activeMovieForPlayer, setActiveMovieForPlayer] = useState<Movie | null>(null);
  const [activeMovieForDetails, setActiveMovieForDetails] = useState<Movie | null>(null);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isStudioOpen, setIsStudioOpen] = useState(false);
  const [isWatchlistOpen, setIsWatchlistOpen] = useState(false);
  const [movieToEdit, setMovieToEdit] = useState<Movie | null>(null);
  const [movieToDelete, setMovieToDelete] = useState<Movie | null>(null);

  // Toast Notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Load custom user movies from IndexedDB
  useEffect(() => {
    loadCustomMovies();
    loadSavedWatchlist();
  }, []);

  const loadCustomMovies = async () => {
    try {
      const customMovies = await getAllMoviesFromDB();
      if (customMovies && customMovies.length > 0) {
        setMovies((prev) => {
          const existingIds = new Set(customMovies.map((m) => m.id));
          const filteredDefaults = DEFAULT_MOVIES.filter((m) => !existingIds.has(m.id));
          return [...customMovies, ...filteredDefaults];
        });
      }
    } catch (err) {
      console.error('Failed to load movies from IndexedDB:', err);
    }
  };

  const loadSavedWatchlist = () => {
    try {
      const saved = localStorage.getItem('sinehub_watchlist');
      if (saved) {
        setWatchlistIds(new Set(JSON.parse(saved)));
      }
    } catch (e) {
      console.error('Failed to load watchlist:', e);
    }
  };

  // Save a movie (new or edit)
  const handleSaveMovie = async (movie: Movie) => {
    try {
      await saveMovieToDB(movie);
    } catch (err) {
      console.error('Failed to persist movie to IndexedDB:', err);
    }

    setMovies((prev) => {
      const idx = prev.findIndex((m) => m.id === movie.id);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = movie;
        return updated;
      } else {
        return [movie, ...prev];
      }
    });
    showToast(movieToEdit ? 'Matagumpay na na-edit ang pelikula!' : 'Matagumpay na na-upload ang pelikula!');
    setMovieToEdit(null);
  };

  const handleDeleteMovie = async (movie: Movie) => {
    try {
      await deleteMovieFromDB(movie.id);
      if (movie.videoBlobId) await deleteMediaBlob(movie.videoBlobId);
      if (movie.posterBlobId) await deleteMediaBlob(movie.posterBlobId);

      setMovies((prev) => prev.filter((m) => m.id !== movie.id));
      showToast('Nai-delete na ang pelikula.');
    } catch (err) {
      console.error('Failed to delete movie:', err);
      showToast('Nagkaroon ng error sa pag-delete.');
    } finally {
      setMovieToDelete(null);
    }
  };

  const toggleWatchlist = (movieId: string) => {
    setWatchlistIds((prev) => {
      const updated = new Set(prev);
      if (updated.has(movieId)) {
        updated.delete(movieId);
        showToast('Inalis sa Watchlist.');
      } else {
        updated.add(movieId);
        showToast('Idinagdag sa iyong Watchlist! ★');
      }
      try {
        localStorage.setItem('sinehub_watchlist', JSON.stringify(Array.from(updated)));
      } catch (e) {
        console.error('Failed to save watchlist:', e);
      }
      return updated;
    });
  };

  const handleAddReview = (movieId: string, review: Review) => {
    setReviews((prev) => {
      const existing = prev[movieId] || [];
      const updatedReviews = [review, ...existing];
      const newRating = Number(
        (updatedReviews.reduce((sum, r) => sum + r.rating, 0) / updatedReviews.length).toFixed(1)
      );

      setMovies((prevMovies) =>
        prevMovies.map((m) => (m.id === movieId ? { ...m, rating: newRating } : m))
      );

      return {
        ...prev,
        [movieId]: updatedReviews,
      };
    });
    showToast('Salamat sa iyong pagsusuri (Review)!');
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Filter & Sort movies
  const filteredMovies = useMemo(() => {
    let result = [...movies];

    if (selectedGenre !== 'Lahat (All)') {
      result = result.filter((m) => m.genre.toLowerCase() === selectedGenre.toLowerCase());
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (m) =>
          m.title.toLowerCase().includes(q) ||
          m.director.toLowerCase().includes(q) ||
          m.genre.toLowerCase().includes(q) ||
          m.description.toLowerCase().includes(q)
      );
    }

    result.sort((a, b) => {
      if (sortBy === 'rating') {
        const rA = typeof a.rating === 'number' ? a.rating : 4.0;
        const rB = typeof b.rating === 'number' ? b.rating : 4.0;
        return rB - rA;
      }
      if (sortBy === 'newest') {
        return (b.year || 2024) - (a.year || 2024);
      }
      return (b.isOriginal ? 1 : 0) - (a.isOriginal ? 1 : 0);
    });

    return result;
  }, [movies, selectedGenre, searchQuery, sortBy]);

  const featuredMovie = useMemo(() => {
    return movies.find((m) => m.isFeatured) || movies[0];
  }, [movies]);

  const myUploadedMovies = useMemo(() => {
    return movies.filter((m) => m.isUserUploaded);
  }, [movies]);

  const watchlistMovies = useMemo(() => {
    return movies.filter((m) => watchlistIds.has(m.id));
  }, [movies, watchlistIds]);

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans selection:bg-amber-500 selection:text-black">
      {/* Toast alert */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-amber-500 text-neutral-950 font-bold px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-bounce border border-amber-300">
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Navigation Header */}
      <Navbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onOpenUpload={() => {
          setMovieToEdit(null);
          setIsUploadOpen(true);
        }}
        onOpenStudio={() => setIsStudioOpen(true)}
        onOpenWatchlist={() => setIsWatchlistOpen(true)}
        watchlistCount={watchlistIds.size}
        myMoviesCount={myUploadedMovies.length}
        language={language}
        onToggleLanguage={() => setLanguage((prev) => (prev === 'tl' ? 'en' : 'tl'))}
      />

      {/* Main Hero Showcase */}
      {featuredMovie && !searchQuery && (
        <HeroBanner
          movie={featuredMovie}
          onWatch={(movie) => setActiveMovieForPlayer(movie)}
          onShowDetails={(movie) => setActiveMovieForDetails(movie)}
          isWatchlisted={watchlistIds.has(featuredMovie.id)}
          onToggleWatchlist={() => toggleWatchlist(featuredMovie.id)}
        />
      )}

      {/* Catalog & Grid Section */}
      <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10">
        <MovieGrid
          movies={filteredMovies}
          selectedGenre={selectedGenre}
          onSelectGenre={setSelectedGenre}
          sortBy={sortBy}
          onSortChange={setSortBy}
          onWatchMovie={(movie) => setActiveMovieForPlayer(movie)}
          onSelectMovie={(movie) => setActiveMovieForDetails(movie)}
          watchlistIds={watchlistIds}
          onToggleWatchlist={toggleWatchlist}
          onEditMovie={(movie) => {
            setMovieToEdit(movie);
            setIsUploadOpen(true);
          }}
          onDeleteMovie={(movie) => setMovieToDelete(movie)}
          onOpenUpload={() => {
            setMovieToEdit(null);
            setIsUploadOpen(true);
          }}
          searchQuery={searchQuery}
        />
      </main>

      {/* Footer */}
      <Footer />

      {/* MODALS */}
      {/* Upload & Edit Modal */}
      <UploadMovieModal
        isOpen={isUploadOpen}
        onClose={() => {
          setIsUploadOpen(false);
          setMovieToEdit(null);
        }}
        onSaveMovie={handleSaveMovie}
        editingMovie={movieToEdit}
      />

      {/* Creator Studio Modal */}
      <CreatorStudioModal
        isOpen={isStudioOpen}
        onClose={() => setIsStudioOpen(false)}
        uploadedMovies={myUploadedMovies}
        onWatch={(movie) => setActiveMovieForPlayer(movie)}
        onEdit={(movie) => {
          setIsStudioOpen(false);
          setMovieToEdit(movie);
          setIsUploadOpen(true);
        }}
        onDelete={(movie) => {
          setMovieToDelete(movie);
        }}
        onOpenUpload={() => {
          setIsStudioOpen(false);
          setMovieToEdit(null);
          setIsUploadOpen(true);
        }}
      />

      {/* Watchlist Modal */}
      <WatchlistModal
        isOpen={isWatchlistOpen}
        onClose={() => setIsWatchlistOpen(false)}
        watchlistMovies={watchlistMovies}
        onWatch={(movie) => setActiveMovieForPlayer(movie)}
        onRemove={(movieId) => toggleWatchlist(movieId)}
      />

      {/* Movie Details Modal */}
      {activeMovieForDetails && (
        <MovieDetailModal
          movie={activeMovieForDetails}
          reviews={reviews[activeMovieForDetails.id] || []}
          onClose={() => setActiveMovieForDetails(null)}
          onWatch={() => {
            const m = activeMovieForDetails;
            setActiveMovieForDetails(null);
            setActiveMovieForPlayer(m);
          }}
          isWatchlisted={watchlistIds.has(activeMovieForDetails.id)}
          onToggleWatchlist={() => toggleWatchlist(activeMovieForDetails.id)}
          onAddReview={(review) => handleAddReview(activeMovieForDetails.id, review)}
        />
      )}

      {/* Video Player Modal */}
      {activeMovieForPlayer && (
        <VideoPlayerModal
          movie={activeMovieForPlayer}
          onClose={() => setActiveMovieForPlayer(null)}
        />
      )}

      {/* Delete Confirmation Modal */}
      {movieToDelete && (
        <DeleteConfirmModal
          movie={movieToDelete}
          onClose={() => setMovieToDelete(null)}
          onConfirm={() => handleDeleteMovie(movieToDelete)}
        />
      )}
    </div>
  );
}
