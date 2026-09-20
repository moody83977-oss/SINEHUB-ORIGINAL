import React, { useState } from 'react';
import { 
  X, Play, Bookmark, BookmarkCheck, Star, Clock, 
  Sparkles, Calendar, Globe, Award, Shield, User, MessageSquare, Send, Edit3, Trash2
} from 'lucide-react';
import { Movie, Review } from '../types';
import { formatDuration } from '../utils/formatters';

interface MovieDetailModalProps {
  movie: Movie | null;
  onClose: () => void;
  onPlay: (movie: Movie) => void;
  isInWatchlist: boolean;
  onToggleWatchlist: (movie: Movie) => void;
  reviews: Review[];
  onAddReview: (movieId: string, review: Omit<Review, 'id' | 'movieId' | 'date'>) => void;
  onEditMovie?: (movie: Movie) => void;
  onDeleteMovie?: (movie: Movie) => void;
  language: 'tl' | 'en';
}

export const MovieDetailModal: React.FC<MovieDetailModalProps> = ({
  movie,
  onClose,
  onPlay,
  isInWatchlist,
  onToggleWatchlist,
  reviews,
  onAddReview,
  onEditMovie,
  onDeleteMovie,
  language
}) => {
  const [userRating, setUserRating] = useState(5);
  const [authorName, setAuthorName] = useState('');
  const [commentText, setCommentText] = useState('');
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  if (!movie) return null;

  const movieReviews = reviews.filter((r) => r.movieId === movie.id);
  const backdrop = movie.backdropUrl || movie.posterUrl;

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    onAddReview(movie.id, {
      author: authorName.trim() || (language === 'tl' ? 'Manonood' : 'Audience Member'),
      rating: userRating,
      comment: commentText.trim()
    });

    setCommentText('');
    setAuthorName('');
    setReviewSubmitted(true);
    setTimeout(() => setReviewSubmitted(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6">
      <div className="relative w-full max-w-4xl bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden my-6 select-none">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-black/70 hover:bg-neutral-800 text-white border border-neutral-700 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Hero Backdrop Banner */}
        <div className="relative h-64 sm:h-80 w-full overflow-hidden bg-neutral-950">
          <img
            src={backdrop}
            alt={movie.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 via-neutral-900/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-neutral-900/90 via-transparent to-transparent" />

          {/* Overlaid Title & Quick Action */}
          <div className="absolute bottom-6 left-6 right-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="space-y-1.5 max-w-xl">
              <div className="flex flex-wrap items-center gap-2">
                {movie.isUserUploaded && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500 text-white flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    {language === 'tl' ? 'Orihinal na Likha' : 'Original Film'}
                  </span>
                )}
                <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-neutral-800/80 text-neutral-300 border border-neutral-700">
                  {movie.releaseYear}
                </span>
                <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-neutral-800/80 text-neutral-300 border border-neutral-700">
                  {movie.ageRating}
                </span>
                {movie.videoResolution && (
                  <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-400 text-neutral-950">
                    {movie.videoResolution}
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-4xl font-black text-white font-['Cinzel',serif]">
                {movie.title}
              </h1>

              {movie.tagline && (
                <p className="text-xs sm:text-sm text-amber-300 italic">
                  "{movie.tagline}"
                </p>
              )}
            </div>

            {/* Play & Watchlist Action */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  onClose();
                  onPlay(movie);
                }}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold text-sm shadow-lg shadow-amber-500/25 transition-all transform active:scale-95"
              >
                <Play className="w-5 h-5 fill-neutral-950 text-neutral-950" />
                <span>{language === 'tl' ? 'Panoorin Ngayon' : 'Play Movie'}</span>
              </button>

              <button
                onClick={() => onToggleWatchlist(movie)}
                className="p-3 rounded-xl bg-neutral-800/80 hover:bg-neutral-700 text-white border border-neutral-700 transition-colors"
                title={isInWatchlist ? 'Remove from Watchlist' : 'Add to Watchlist'}
              >
                {isInWatchlist ? (
                  <BookmarkCheck className="w-5 h-5 text-amber-400" />
                ) : (
                  <Bookmark className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Details Content Layout */}
        <div className="p-6 sm:p-8 space-y-8 max-h-[60vh] overflow-y-auto">
          {/* Main Grid: Synopsis & Metadata Specs */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Left 2 Cols: Synopsis, Director's Note */}
            <div className="md:col-span-2 space-y-6">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-2">
                  {language === 'tl' ? 'Buod ng Kwento' : 'Synopsis & Storyline'}
                </h3>
                <p className="text-sm text-neutral-200 leading-relaxed">
                  {movie.synopsis}
                </p>
              </div>

              {movie.directorNote && (
                <div className="p-4 rounded-xl bg-neutral-950/60 border border-neutral-800 space-y-2">
                  <h4 className="text-xs font-bold text-neutral-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    {language === 'tl' ? 'Mensahe ng Direktor (Director’s Note)' : "Director's Note"}
                  </h4>
                  <p className="text-xs text-neutral-400 italic leading-relaxed">
                    "{movie.directorNote}"
                  </p>
                </div>
              )}

              {/* Cast & Crew Section */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">
                  {language === 'tl' ? 'Direksyon at Mga Artista' : 'Director & Cast'}
                </h3>
                <div className="space-y-1.5 text-sm">
                  <p className="text-neutral-300">
                    <strong className="text-white">Direktor:</strong> {movie.director}
                  </p>
                  <p className="text-neutral-300">
                    <strong className="text-white">Cast:</strong> {movie.cast.join(', ')}
                  </p>
                </div>
              </div>
            </div>

            {/* Right 1 Col: Tech Specs Sidebar */}
            <div className="space-y-4 p-5 rounded-xl bg-neutral-950 border border-neutral-800 text-xs">
              <h4 className="font-bold text-neutral-200 uppercase tracking-wider border-b border-neutral-800 pb-2">
                {language === 'tl' ? 'Detalye ng Pelikula' : 'Movie Specs'}
              </h4>

              <div className="space-y-2.5 text-neutral-400">
                <div className="flex justify-between">
                  <span>{language === 'tl' ? 'Haba ng Pelikula:' : 'Runtime:'}</span>
                  <span className="text-white font-semibold flex items-center gap-1">
                    <Clock className="w-3 h-3 text-neutral-400" />
                    {formatDuration(movie.durationMinutes, language)}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span>{language === 'tl' ? 'Genre:' : 'Genres:'}</span>
                  <span className="text-amber-400 font-semibold">{movie.genre.join(', ')}</span>
                </div>

                <div className="flex justify-between">
                  <span>{language === 'tl' ? 'Wika:' : 'Language:'}</span>
                  <span className="text-white">{movie.language}</span>
                </div>

                {movie.subtitles && movie.subtitles.length > 0 && (
                  <div className="flex justify-between">
                    <span>{language === 'tl' ? 'Subtitles:' : 'Subtitles:'}</span>
                    <span className="text-white">{movie.subtitles.join(', ')}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span>{language === 'tl' ? 'Rating ng Manonood:' : 'Audience Score:'}</span>
                  <span className="text-amber-400 font-bold flex items-center gap-1">
                    <Star className="w-3 h-3 fill-amber-400" />
                    {movie.averageRating.toFixed(1)} / 5.0
                  </span>
                </div>

                {movie.fileSizeMB && (
                  <div className="flex justify-between">
                    <span>{language === 'tl' ? 'Laki ng File:' : 'File Size:'}</span>
                    <span className="text-neutral-300">{movie.fileSizeMB} MB</span>
                  </div>
                )}
              </div>

              {/* Creator Options if user uploaded */}
              {movie.isUserUploaded && (
                <div className="pt-3 border-t border-neutral-800 space-y-2">
                  {onEditMovie && (
                    <button
                      onClick={() => {
                        onClose();
                        onEditMovie(movie);
                      }}
                      className="w-full py-2 px-3 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>{language === 'tl' ? 'I-edit ang Pelikula' : 'Edit Movie Details'}</span>
                    </button>
                  )}
                  {onDeleteMovie && (
                    <button
                      onClick={() => {
                        onClose();
                        onDeleteMovie(movie);
                      }}
                      className="w-full py-2 px-3 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-semibold flex items-center justify-center gap-2 border border-rose-500/30 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>{language === 'tl' ? 'Burahin ang Pelikula' : 'Delete Movie'}</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Section: Reviews and Audience Ratings */}
          <div className="pt-6 border-t border-neutral-800 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2 font-['Cinzel',serif]">
                  <MessageSquare className="w-4 h-4 text-amber-400" />
                  {language === 'tl' ? 'Mga Puna at Rating ng Manonood' : 'Audience Reviews & Ratings'}
                </h3>
                <p className="text-xs text-neutral-400">
                  {movieReviews.length} {language === 'tl' ? 'na review' : 'reviews'} • {movie.averageRating.toFixed(1)} ★
                </p>
              </div>
            </div>

            {/* Leave a review form */}
            <form onSubmit={handleSubmitReview} className="p-4 rounded-xl bg-neutral-950/80 border border-neutral-800 space-y-3">
              <h4 className="text-xs font-bold text-neutral-200 uppercase tracking-wider">
                {language === 'tl' ? 'Mag-iwan ng Iyong Rating at Opinyon' : 'Leave Your Review & Rating'}
              </h4>

              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setUserRating(star)}
                      className="p-1 hover:scale-110 transition-transform"
                    >
                      <Star
                        className={`w-5 h-5 ${
                          star <= userRating ? 'fill-amber-400 text-amber-400' : 'text-neutral-600'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-xs font-bold text-amber-400 ml-1">
                    {userRating}.0
                  </span>
                </div>

                <input
                  type="text"
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  placeholder={language === 'tl' ? 'Pangalan mo (Opsyonal)' : 'Your Name (Optional)'}
                  className="bg-neutral-900 text-xs text-neutral-200 px-3 py-1.5 rounded-lg border border-neutral-700/80 focus:border-amber-500 focus:outline-none flex-1"
                />
              </div>

              <div className="flex gap-2">
                <textarea
                  required
                  rows={2}
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder={language === 'tl' ? 'Ano ang masasabi mo sa pelikulang ito?' : 'What did you think of the movie?'}
                  className="flex-1 bg-neutral-900 text-xs text-neutral-200 px-3 py-2 rounded-lg border border-neutral-700/80 focus:border-amber-500 focus:outline-none"
                />
                <button
                  type="submit"
                  className="px-4 bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold text-xs rounded-lg flex items-center gap-1.5 self-end py-2.5 transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{language === 'tl' ? 'Ipasa' : 'Post'}</span>
                </button>
              </div>

              {reviewSubmitted && (
                <p className="text-xs text-emerald-400 font-semibold">
                  {language === 'tl' ? 'Salamat sa iyong review!' : 'Thank you for your review!'}
                </p>
              )}
            </form>

            {/* Existing Reviews List */}
            <div className="space-y-3">
              {movieReviews.length > 0 ? (
                movieReviews.map((rev) => (
                  <div key={rev.id} className="p-3.5 rounded-xl bg-neutral-950/40 border border-neutral-800/80 space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-neutral-200">{rev.author}</span>
                        <div className="flex items-center text-amber-400">
                          {Array.from({ length: rev.rating }).map((_, i) => (
                            <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                          ))}
                        </div>
                      </div>
                      <span className="text-[11px] text-neutral-500">{rev.date}</span>
                    </div>
                    <p className="text-xs text-neutral-300 leading-relaxed">
                      {rev.comment}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-xs text-neutral-500 italic">
                  {language === 'tl' ? 'Wala pang review. Maging unang mag-iwan ng review!' : 'No reviews yet. Be the first to review!'}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
