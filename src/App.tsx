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
import { getAllMoviesFromDB, deleteMovieFromDB, deleteMediaBlob } from './utils/db';

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

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Load user uploaded movies from IndexedDB and local storage on mount
  useEffect(() => {
    async function loadSavedData() {
      try {
        const savedDbMovies = await getAllMoviesFromDB();
        if (savedDbMovies && savedDbMovies.length > 0) {
          // Combine user uploaded movies with default showcase movies
          setMovies((prev) => {
            const combined = [...savedDbMovies, ...DEFAULT_MOVIES];
            // Remove duplicates by ID
            const seen = new Set();
            return combined.filter((m) => {
              if (seen.has(m.id)) return false;
              seen.add(m.id);
              return true;
            });
          });
        }

        // Load saved watchlist
        const savedWatchlist = localStorage.getItem('sinehub_watchlist');
        if (savedWatchlist) {
          setWatchlistIds(new Set(JSON.parse(savedWatchlist)));
        }

        // Load saved reviews
        const savedReviews = localStorage.getItem('sinehub_reviews');
        if (savedReviews) {
          setReviews((prev) => ({
            ...prev,
            ...JSON.parse(savedReviews)
          }));
        }
      } catch (err) {
        console.error('Error loading initial data from DB:', err);
      }
    }

    loadSavedData();
  }, []);

  // Save watchlist to localStorage whenever it changes
  const toggleWatchlist = (movie: Movie) => {
    setWatchlistIds((prev) => {
      const next = new Set(prev);
      if (next.has(movie.id)) {
        next.delete(movie.id);
        showToast(language === 'tl' ? `Inalis ang "${movie.title}" sa Watchlist` : `Removed "${movie.title}" from Watchlist`);
      } else {
        next.add(movie.id);
        showToast(language === 'tl' ? `Naidagdag ang "${movie.title}" sa Watchlist` : `Added "${movie.title}" to Watchlist`);
      }
      localStorage.setItem('sinehub_watchlist', JSON.stringify(Array.from(next)));
      return next;
    });
  };

  // Add review handler
  const handleAddReview = (movieId: string, newReviewData: Omit<Review, 'id' | 'movieId' | 'date'>) => {
    const newReview: Review = {
      id: 'rev_' + Date.now().toString(36),
      movieId,
      author: newReviewData.author,
      rating: newReviewData.rating,
      comment: newReviewData.comment,
      date: language === 'tl' ? 'Kani-kanina lang' : 'Just now'
    };

    setReviews((prev) => {
      const existing = prev[movieId] || [];
      const updated = [newReview, ...existing];
      const nextReviews = { ...prev, [movieId]: updated };
      localStorage.setItem('sinehub_reviews', JSON.stringify(nextReviews));
      return nextReviews;
    });

    // Recalculate movie average rating
    setMovies((prev) =>
      prev.map((m) => {
        if (m.id === movieId) {
          const movieRevs = [newReview, ...(reviews[movieId] || [])];
          const avg = movieRevs.reduce((acc, r) => acc + r.rating, 0) / movieRevs.length;
          return {
            ...m,
            averageRating: Math.round(avg * 10) / 10,
            totalReviews: movieRevs.length
          };
        }
        return m;
      })
    );

    showToast(language === 'tl' ? 'Naipasa ang iyong review!' : 'Your review has been submitted!');
  };

  // Movie uploaded or edited handler
  const handleMovieUploaded = (movie: Movie) => {
    setMovies((prev) => {
      const existsIndex = prev.findIndex((m) => m.id === movie.id);
      if (existsIndex >= 0) {
        const copy = [...prev];
        copy[existsIndex] = movie;
        return copy;
      } else {
        return [movie, ...prev];
      }
    });

    showToast(language === 'tl' ? `Tagumpay na nai-publish ang "${movie.title}"!` : `Successfully published "${movie.title}"!`);
  };

  // Delete movie handler
  const handleConfirmDeleteMovie = async (movie: Movie) => {
    try {
      await deleteMovieFromDB(movie.id);
      if (movie.videoBlobKey) {
        await deleteMediaBlob(movie.videoBlobKey);
      }
      if (movie.posterBlobKey) {
        await deleteMediaBlob(movie.posterBlobKey);
      }

      setMovies((prev) => prev.filter((m) => m.id !== movie.id));
      setMovieToDelete(null);
      if (activeMovieForDetails?.id === movie.id) {
        setActiveMovieForDetails(null);
      }
      showToast(language === 'tl' ? `Nabura ang pelikulang "${movie.title}".` : `Deleted movie "${movie.title}".`);
    } catch (err) {
      console.error('Failed to delete movie:', err);
      showToast('Error deleting movie.');
    }
  };

  // Filtered & Sorted movies
  const userMovies = useMemo(() => movies.filter((m) => m.isUserUploaded), [movies]);

  const filteredMovies = useMemo(() => {
    let result = [...movies];

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (m) =>
          m.title.toLowerCase().includes(q) ||
          m.director.toLowerCase().includes(q) ||
          m.genre.some((g) => g.toLowerCase().includes(q)) ||
          m.cast.some((c) => c.toLowerCase().includes(q)) ||
          m.synopsis.toLowerCase().includes(q)
      );
    }

    // Genre filter
    if (selectedGenre === 'Aking Uploads') {
      result = result.filter((m) => m.isUserUploaded);
    } else if (selectedGenre !== 'Lahat (All)') {
      result = result.filter((m) => m.genre.some((g) => g.toLowerCase() === selectedGenre.toLowerCase()));
    }

    // Sorting
    if (sortBy === 'newest') {
      result.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());
    } else if (sortBy === 'rating') {
      result.sort((a, b) => b.averageRating - a.averageRating);
    } else if (sortBy === 'duration') {
      result.sort((a, b) => b.durationMinutes - a.durationMinutes);
    } else if (sortBy === 'title') {
      result.sort((a, b) => a.title.localeCompare(b.title));
    }

    return result;
  }, [movies, searchQuery, selectedGenre, sortBy]);

  // Featured spotlight movie for hero banner
  const spotlightMovie = useMemo(() => {
    // If user has uploaded any movie, spotlight their newest upload!
    const myNewest = movies.find((m) => m.isUserUploaded);
    if (myNewest) return myNewest;
    return movies[0] || null;
  }, [movies]);

  const watchlistMovies = useMemo(
    () => movies.filter((m) => watchlistIds.has(m.id)),
    [movies, watchlistIds]
  );

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-['Plus_Jakarta_Sans',sans-serif] selection:bg-amber-400 selection:text-neutral-950">
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed top-20 right-4 z-50 px-4 py-3 bg-amber-400 text-neutral-950 font-bold text-xs rounded-xl shadow-xl shadow-amber-400/20 flex items-center gap-2 animate-in fade-in slide-in-from-top-4 duration-300">
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Navbar */}
      <Navbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onOpenUpload={() => {
          setMovieToEdit(null);
          setIsUploadOpen(true);
        }}
        onOpenStudio={() => setIsStudioOpen(true)}
        onOpenWatchlist={() => setIsWatchlistOpen(true)}
        userMoviesCount={userMovies.length}
        watchlistCount={watchlistIds.size}
        language={language}
        onToggleLanguage={() => setLanguage((l) => (l === 'tl' ? 'en' : 'tl'))}
        onShowAllMovies={() => {
          setSelectedGenre('Lahat (All)');
          setSearchQuery('');
        }}
      />

      {/* Cinematic Hero Spotlight (Only when not actively filtering by search) */}
      {!searchQuery && (
        <HeroBanner
          movie={spotlightMovie}
          onPlay={(m) => setActiveMovieForPlayer(m)}
          onSelectMovie={(m) => setActiveMovieForDetails(m)}
          isInWatchlist={spotlightMovie ? watchlistIds.has(spotlightMovie.id) : false}
          onToggleWatchlist={toggleWatchlist}
          language={language}
        />
      )}

      {/* Movie Catalog Grid & Categories */}
      <main className="flex-1">
        <MovieGrid
          movies={filteredMovies}
          selectedGenre={selectedGenre}
          onSelectGenre={setSelectedGenre}
          sortBy={sortBy}
          onSortChange={setSortBy}
          onPlay={(m) => setActiveMovieForPlayer(m)}
          onSelectMovie={(m) => setActiveMovieForDetails(m)}
          watchlistIds={watchlistIds}
          onToggleWatchlist={toggleWatchlist}
          onDeleteMovie={(m) => setMovieToDelete(m)}
          onEditMovie={(m) => {
            setMovieToEdit(m);
            setIsUploadOpen(true);
          }}
          onOpenUpload={() => {
            setMovieToEdit(null);
            setIsUploadOpen(true);
          }}
          language={language}
          userMoviesCount={userMovies.length}
        />
      </main>

      {/* Footer */}
      <Footer
        onOpenUpload={() => {
          setMovieToEdit(null);
          setIsUploadOpen(true);
        }}
        language={language}
      />

      {/* Modals & Overlays */}
      {/* 1. Video Player Modal */}
      {activeMovieForPlayer && (
        <VideoPlayerModal
          movie={activeMovieForPlayer}
          onClose={() => setActiveMovieForPlayer(null)}
          language={language}
        />
      )}

      {/* 2. Movie Details & Reviews Modal */}
      {activeMovieForDetails && (
        <MovieDetailModal
          movie={activeMovieForDetails}
          onClose={() => setActiveMovieForDetails(null)}
          onPlay={(m) => {
            setActiveMovieForDetails(null);
            setActiveMovieForPlayer(m);
          }}
          isInWatchlist={watchlistIds.has(activeMovieForDetails.id)}
          onToggleWatchlist={toggleWatchlist}
          reviews={reviews[activeMovieForDetails.id] || []}
          onAddReview={handleAddReview}
          onEditMovie={(m) => {
            setActiveMovieForDetails(null);
            setMovieToEdit(m);
            setIsUploadOpen(true);
          }}
          onDeleteMovie={(m) => {
            setActiveMovieForDetails(null);
            setMovieToDelete(m);
          }}
          language={language}
        />
      )}

      {/* 3. Upload Original Movie Modal */}
      <UploadMovieModal
        isOpen={isUploadOpen}
        onClose={() => {
          setIsUploadOpen(false);
          setMovieToEdit(null);
        }}
        onMovieUploaded={handleMovieUploaded}
        movieToEdit={movieToEdit}
        language={language}
      />

      {/* 4. Creator Studio Modal */}
      <CreatorStudioModal
        isOpen={isStudioOpen}
        onClose={() => setIsStudioOpen(false)}
        movies={movies}
        onPlay={(m) => setActiveMovieForPlayer(m)}
        onOpenUpload={() => {
          setMovieToEdit(null);
          setIsUploadOpen(true);
        }}
        onEditMovie={(m) => {
          setMovieToEdit(m);
          setIsUploadOpen(true);
        }}
        onDeleteMovie={(m) => setMovieToDelete(m)}
        language={language}
      />

      {/* 5. Watchlist Modal */}
      <WatchlistModal
        isOpen={isWatchlistOpen}
        onClose={() => setIsWatchlistOpen(false)}
        watchlistMovies={watchlistMovies}
        onPlay={(m) => setActiveMovieForPlayer(m)}
        onRemoveFromWatchlist={toggleWatchlist}
        onSelectMovie={(m) => setActiveMovieForDetails(m)}
        language={language}
      />

      {/* 6. Delete Confirmation Modal */}
      <DeleteConfirmModal
        movie={movieToDelete}
        onClose={() => setMovieToDelete(null)}
        onConfirmDelete={handleConfirmDeleteMovie}
        language={language}
      />
    </div>
  );
}
