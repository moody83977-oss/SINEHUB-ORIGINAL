import React, { useState, useEffect } from 'react';
import { X, Film, AlertCircle } from 'lucide-react';
import { Movie } from '../types';
import { GENRES } from '../data/defaultMovies';

interface UploadMovieModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveMovie: (movie: Movie) => void;
  editingMovie?: Movie | null;
}

export const UploadMovieModal: React.FC<UploadMovieModalProps> = ({
  isOpen,
  onClose,
  onSaveMovie,
  editingMovie,
}) => {
  const [title, setTitle] = useState('');
  const [tagline, setTagline] = useState('');
  const [description, setDescription] = useState('');
  const [director, setDirector] = useState('');
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [genre, setGenre] = useState(GENRES[1]);
  const [duration, setDuration] = useState('108 min');
  const [rating] = useState(5);
  const [posterUrl, setPosterUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (editingMovie) {
      setTitle(editingMovie.title);
      setTagline(editingMovie.tagline || '');
      setDescription(editingMovie.description);
      setDirector(editingMovie.director);
      setYear(editingMovie.year);
      setGenre(editingMovie.genre);
      setDuration(editingMovie.duration);
      setPosterUrl(editingMovie.posterUrl || '');
      setVideoUrl(editingMovie.videoUrl || '');
    } else {
      setTitle('');
      setTagline('');
      setDescription('');
      setDirector('');
      setYear(new Date().getFullYear());
      setGenre(GENRES[1]);
      setDuration('108 min');
      setPosterUrl('');
      setVideoUrl('');
    }
    setError(null);
  }, [editingMovie, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      setError('Mangyaring ilagay ang pamagat ng pelikula.');
      return;
    }
    if (!videoUrl.trim()) {
      setError('Mangyaring i-paste ang Video Link (Google Drive o YouTube).');
      return;
    }

    try {
      setIsSaving(true);
      setError(null);

      const movieData: Movie = {
        id: editingMovie ? editingMovie.id : `movie_${Date.now()}`,
        title: title.trim(),
        tagline: tagline.trim() || undefined,
        description: description.trim() || 'Walang buod na ibinigay.',
        director: director.trim() || 'Direktor',
        year: Number(year) || new Date().getFullYear(),
        genre,
        duration: duration.trim() || '108 min',
        rating,
        quality: '1080p Full HD',
        posterUrl: posterUrl.trim() || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=800&q=80',
        videoUrl: videoUrl.trim(),
        isOriginal: true,
        isUserUploaded: true,
        createdAt: editingMovie?.createdAt || new Date().toISOString(),
      };

      onSaveMovie(movieData);
      onClose();
    } catch (err) {
      console.error(err);
      setError('Nagka-problema sa pag-save.');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-neutral-900/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/10 text-amber-500 rounded-lg">
              <Film className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white font-cinzel">
                {editingMovie ? 'I-edit ang Pelikula' : 'Mag-upload ng Bagong Pelikula'}
              </h3>
              <p className="text-xs text-neutral-400">
                I-paste ang Google Drive o YouTube link ng iyong pelikula
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl text-sm flex items-center gap-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Title & Tagline */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-2">
                Pamagat (Title) *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Hal. Enola Holmes 3"
                required
                className="w-full bg-neutral-800/80 border border-neutral-700 rounded-xl px-4 py-2.5 text-white text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-2">
                Tagline (Opsiyonal)
              </label>
              <input
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                placeholder="Misteryo at Pakikipagsapalaran"
                className="w-full bg-neutral-800/80 border border-neutral-700 rounded-xl px-4 py-2.5 text-white text-sm"
              />
            </div>
          </div>

          {/* Video URL (Google Drive / YouTube) */}
          <div>
            <label className="block text-xs font-semibold text-amber-400 uppercase tracking-wider mb-2">
              Video URL (I-paste ang Google Drive o YouTube Link) *
            </label>
            <input
              type="url"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="https://drive.google.com/file/d/... o YouTube link"
              required
              className="w-full bg-neutral-800/80 border border-amber-500/50 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Poster Image URL */}
          <div>
            <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-2">
              Poster Image URL (Opsiyonal)
            </label>
            <input
              type="url"
              value={posterUrl}
              onChange={(e) => setPosterUrl(e.target.value)}
              placeholder="https://images.unsplash.com/... o image link"
              className="w-full bg-neutral-800/80 border border-neutral-700 rounded-xl px-4 py-2.5 text-white text-sm"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-2">
              Buod ng Pelikula (Description)
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ikwento ang buod ng pelikula..."
              className="w-full bg-neutral-800/80 border border-neutral-700 rounded-xl px-4 py-2.5 text-white text-sm"
            />
          </div>

          {/* Buttons */}
          <div className="pt-4 border-t border-neutral-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-neutral-400 hover:text-white rounded-xl hover:bg-neutral-800"
            >
              Kanselahin
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2.5 text-sm font-bold bg-amber-500 hover:bg-amber-400 text-neutral-950 rounded-xl shadow-lg transition-all"
            >
              {isSaving ? 'Sinisave...' : 'I-save ang Pelikula'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
