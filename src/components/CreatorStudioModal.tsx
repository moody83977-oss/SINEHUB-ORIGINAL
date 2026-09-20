import React from 'react';
import { 
  X, Video, Upload, Film, Trash2, Edit3, Play, 
  Sparkles, HardDrive, Star, Eye, Plus
} from 'lucide-react';
import { Movie } from '../types';
import { formatDuration } from '../utils/formatters';

interface CreatorStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  movies: Movie[];
  onPlay: (movie: Movie) => void;
  onOpenUpload: () => void;
  onEditMovie: (movie: Movie) => void;
  onDeleteMovie: (movie: Movie) => void;
  language: 'tl' | 'en';
}

export const CreatorStudioModal: React.FC<CreatorStudioModalProps> = ({
  isOpen,
  onClose,
  movies,
  onPlay,
  onOpenUpload,
  onEditMovie,
  onDeleteMovie,
  language
}) => {
  if (!isOpen) return null;

  const userMovies = movies.filter((m) => m.isUserUploaded);
  const totalStorageMB = userMovies.reduce((acc, m) => acc + (m.fileSizeMB || 0), 0);
  const totalViews = userMovies.reduce((acc, m) => acc + (m.viewsCount || 0), 0);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6">
      <div className="relative w-full max-w-4xl bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden my-8 select-none">
        {/* Header */}
        <div className="px-6 py-5 border-b border-neutral-800 flex items-center justify-between bg-neutral-950/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center border border-rose-500/30">
              <Video className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-extrabold text-white font-['Cinzel',serif]">
                {language === 'tl' ? 'Studio ng Manlilikha (Creator Studio)' : 'Filmmaker Creator Studio'}
              </h2>
              <p className="text-xs text-neutral-400">
                {language === 'tl'
                  ? 'Pamahalaan ang iyong sariling mga orihinal na pelikula at video'
                  : 'Manage, edit, and organize all your original indie films and videos'
                }
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

        {/* Content Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Creator Metrics Dashboard */}
          <div className="grid grid-cols-3 gap-3 sm:gap-4">
            <div className="p-4 rounded-xl bg-neutral-950/80 border border-neutral-800/80 space-y-1">
              <span className="text-[11px] font-medium text-neutral-400 flex items-center gap-1.5">
                <Film className="w-3.5 h-3.5 text-rose-400" />
                {language === 'tl' ? 'Na-upload na Pelikula' : 'Uploaded Films'}
              </span>
              <p className="text-2xl font-black text-white font-mono">
                {userMovies.length}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-neutral-950/80 border border-neutral-800/80 space-y-1">
              <span className="text-[11px] font-medium text-neutral-400 flex items-center gap-1.5">
                <HardDrive className="w-3.5 h-3.5 text-amber-400" />
                {language === 'tl' ? 'Nagagamit na Storage' : 'Storage Used'}
              </span>
              <p className="text-2xl font-black text-amber-400 font-mono">
                {totalStorageMB > 1024 
                  ? `${(totalStorageMB / 1024).toFixed(1)} GB` 
                  : `${totalStorageMB.toFixed(1)} MB`
                }
              </p>
            </div>

            <div className="p-4 rounded-xl bg-neutral-950/80 border border-neutral-800/80 space-y-1">
              <span className="text-[11px] font-medium text-neutral-400 flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-emerald-400" />
                {language === 'tl' ? 'Kabuuang Manonood' : 'Audience Views'}
              </span>
              <p className="text-2xl font-black text-emerald-400 font-mono">
                {totalViews}
              </p>
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex items-center justify-between pt-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-300">
              {language === 'tl' ? 'Iyong Catalog ng Orihinal na Pelikula' : 'Your Original Film Catalog'}
            </h3>
            <button
              onClick={() => {
                onClose();
                onOpenUpload();
              }}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-neutral-950 text-xs font-bold shadow-md shadow-amber-500/20 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>{language === 'tl' ? 'Mag-upload ng Bago' : 'Upload New Film'}</span>
            </button>
          </div>

          {/* Film List */}
          {userMovies.length > 0 ? (
            <div className="space-y-3">
              {userMovies.map((movie) => (
                <div
                  key={movie.id}
                  className="p-3.5 rounded-xl bg-neutral-950/60 border border-neutral-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-neutral-700 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={movie.posterUrl}
                      alt={movie.title}
                      className="w-12 h-16 object-cover rounded-lg bg-neutral-800 flex-shrink-0"
                    />
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-white font-['Cinzel',serif]">
                          {movie.title}
                        </h4>
                        <span className="px-1.5 py-0.2 rounded text-[10px] bg-neutral-800 text-amber-400 font-semibold">
                          {movie.videoResolution || '1080p'}
                        </span>
                      </div>
                      <p className="text-xs text-neutral-400">
                        {movie.director} • {formatDuration(movie.durationMinutes, language)} • {movie.genre.join(', ')}
                      </p>
                      {movie.fileSizeMB && (
                        <p className="text-[11px] text-neutral-500">
                          {movie.fileSizeMB} MB • In-upload noong {new Date(movie.uploadedAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <button
                      onClick={() => {
                        onClose();
                        onPlay(movie);
                      }}
                      className="p-2 rounded-lg bg-amber-400 hover:bg-amber-300 text-neutral-950 text-xs font-bold flex items-center gap-1 transition-colors"
                      title={language === 'tl' ? 'Panoorin' : 'Play'}
                    >
                      <Play className="w-3.5 h-3.5 fill-neutral-950" />
                      <span className="text-xs">{language === 'tl' ? 'I-play' : 'Play'}</span>
                    </button>

                    <button
                      onClick={() => {
                        onClose();
                        onEditMovie(movie);
                      }}
                      className="p-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs transition-colors"
                      title={language === 'tl' ? 'I-edit ang detalye' : 'Edit details'}
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => onDeleteMovie(movie)}
                      className="p-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs border border-rose-500/20 transition-colors"
                      title={language === 'tl' ? 'Burahin' : 'Delete'}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-neutral-950/40 rounded-xl border border-neutral-800/60 p-6 space-y-3">
              <Film className="w-10 h-10 mx-auto text-neutral-600" />
              <p className="text-sm font-semibold text-neutral-300">
                {language === 'tl' ? 'Wala ka pang na-upload na pelikula' : 'You have not uploaded any original movies yet'}
              </p>
              <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                {language === 'tl'
                  ? 'I-click ang upload button upang mai-save ang iyong video file at simulan ang sarili mong online sinehan.'
                  : 'Click the upload button to store your video files and start streaming your films.'
                }
              </p>
              <button
                onClick={() => {
                  onClose();
                  onOpenUpload();
                }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-400 hover:bg-amber-300 text-neutral-950 text-xs font-bold shadow-md transition-all mt-2"
              >
                <Upload className="w-4 h-4" />
                <span>{language === 'tl' ? 'Mag-upload Na' : 'Upload Now'}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
