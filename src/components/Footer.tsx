import React from 'react';
import { Film, Heart, Shield, Sparkles, Video, Globe } from 'lucide-react';

interface FooterProps {
  onOpenUpload: () => void;
  language: 'tl' | 'en';
}

export const Footer: React.FC<FooterProps> = ({ onOpenUpload, language }) => {
  return (
    <footer className="w-full bg-neutral-950 border-t border-neutral-900 mt-20 text-neutral-400 select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-neutral-800/80">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-red-600 flex items-center justify-center text-white shadow-md">
              <Film className="w-5 h-5" />
            </div>
            <div>
              <span className="text-lg font-extrabold text-white font-['Cinzel',serif]">
                SINE<span className="text-amber-400">HUB</span>
              </span>
              <p className="text-xs text-neutral-400">
                {language === 'tl' ? 'Tahanan ng mga Orihinal at Indie Films' : 'Home of Independent & Original Filmmakers'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <button
              onClick={onOpenUpload}
              className="px-4 py-2 rounded-lg bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold transition-colors"
            >
              {language === 'tl' ? 'Mag-upload ng Pelikula' : 'Upload Movie'}
            </button>
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-neutral-500 gap-4">
          <p>
            &copy; {new Date().getFullYear()} SineHub Cinema. Para sa mga malikhaing direktor at manonood.
          </p>
          <p className="flex items-center gap-1">
            Gawa nang may <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> para sa Pelikulang Orihinal
          </p>
        </div>
      </div>
    </footer>
  );
};
