import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';
import { Movie } from '../types';

interface DeleteConfirmModalProps {
  movie: Movie | null;
  onClose: () => void;
  onConfirmDelete: (movie: Movie) => void;
  language: 'tl' | 'en';
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  movie,
  onClose,
  onConfirmDelete,
  language
}) => {
  if (!movie) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-4 select-none">
      <div className="relative w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center border border-rose-500/30">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white font-['Cinzel',serif]">
              {language === 'tl' ? 'Burahin ang Pelikula?' : 'Delete Movie?'}
            </h3>
            <p className="text-xs text-neutral-400">
              {movie.title}
            </p>
          </div>
        </div>

        <p className="text-xs text-neutral-300 leading-relaxed">
          {language === 'tl'
            ? 'Sigurado ka bang nais mong burahin ang pelikulang ito? Ang naka-imbak na video file at mga detalye nito ay tuluyang mawawala sa database.'
            : 'Are you sure you want to permanently delete this movie? Its video file and records will be deleted from your database.'
          }
        </p>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-semibold transition-colors"
          >
            {language === 'tl' ? 'Kanselahin' : 'Cancel'}
          </button>
          <button
            onClick={() => onConfirmDelete(movie)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-colors shadow-md shadow-rose-600/20"
          >
            <Trash2 className="w-4 h-4" />
            <span>{language === 'tl' ? 'Oo, Burahin' : 'Yes, Delete'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
