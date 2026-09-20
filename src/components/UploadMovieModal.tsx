import React, { useState, useRef, useEffect } from 'react';
import { 
  X, Upload, Film, Image as ImageIcon, Sparkles, CheckCircle2, 
  AlertCircle, Play, Video, Clock, FileText, User, Tags, Globe, Shield
} from 'lucide-react';
import { Movie } from '../types';
import { saveMediaBlob, saveMovieMetaToDB } from '../utils/db';
import { generateId, formatDuration } from '../utils/formatters';

interface UploadMovieModalProps {
  isOpen: boolean;
  onClose: () => void;
  onMovieUploaded: (newMovie: Movie) => void;
  movieToEdit?: Movie | null;
  language: 'tl' | 'en';
}

const AVAILABLE_GENRES = [
  'Indie Pinoy', 'Drama', 'Sci-Fi', 'Action', 'Horror', 
  'Animation', 'Comedy', 'Documentary', 'Short Film', 'Romance', 'Mystery', 'Thriller'
];

export const UploadMovieModal: React.FC<UploadMovieModalProps> = ({
  isOpen,
  onClose,
  onMovieUploaded,
  movieToEdit,
  language
}) => {
  // Form state
  const [title, setTitle] = useState('');
  const [tagline, setTagline] = useState('');
  const [director, setDirector] = useState('');
  const [castString, setCastString] = useState('');
  const [selectedGenres, setSelectedGenres] = useState<string[]>(['Indie Pinoy']);
  const [releaseYear, setReleaseYear] = useState<number>(new Date().getFullYear());
  const [ageRating, setAgeRating] = useState<'G' | 'PG' | 'PG-13' | 'R-16' | 'R-18'>('PG-13');
  const [synopsis, setSynopsis] = useState('');
  const [directorNote, setDirectorNote] = useState('');
  const [movieLanguage, setMovieLanguage] = useState('Filipino / Tagalog');
  const [subtitles, setSubtitles] = useState('English, Tagalog');

  // Video state
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrlInput, setVideoUrlInput] = useState('');
  const [videoDuration, setVideoDuration] = useState<number>(15);
  const [videoResolution, setVideoResolution] = useState<string>('1080p Full HD');
  const [fileSizeMB, setFileSizeMB] = useState<number>(0);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string>('');

  // Poster state
  const [posterFile, setPosterFile] = useState<File | null>(null);
  const [posterUrlInput, setPosterUrlInput] = useState('');
  const [posterPreview, setPosterPreview] = useState<string>('');

  // Processing state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');

  const videoInputRef = useRef<HTMLInputElement>(null);
  const posterInputRef = useRef<HTMLInputElement>(null);

  // Initialize form when editing or opening
  useEffect(() => {
    if (movieToEdit) {
      setTitle(movieToEdit.title);
      setTagline(movieToEdit.tagline || '');
      setDirector(movieToEdit.director);
      setCastString(movieToEdit.cast.join(', '));
      setSelectedGenres(movieToEdit.genre);
      setReleaseYear(movieToEdit.releaseYear);
      setAgeRating(movieToEdit.ageRating);
      setSynopsis(movieToEdit.synopsis);
      setDirectorNote(movieToEdit.directorNote || '');
      setMovieLanguage(movieToEdit.language);
      setSubtitles(movieToEdit.subtitles ? movieToEdit.subtitles.join(', ') : '');
      setVideoUrlInput(movieToEdit.videoUrl);
      setVideoDuration(movieToEdit.durationMinutes);
      setVideoResolution(movieToEdit.videoResolution || '1080p Full HD');
      setFileSizeMB(movieToEdit.fileSizeMB || 0);
      setPosterUrlInput(movieToEdit.posterUrl);
      setPosterPreview(movieToEdit.posterUrl);
      setVideoPreviewUrl(movieToEdit.videoUrl);
    } else {
      resetForm();
    }
  }, [movieToEdit, isOpen]);

  const resetForm = () => {
    setTitle('');
    setTagline('');
    setDirector('');
    setCastString('');
    setSelectedGenres(['Indie Pinoy']);
    setReleaseYear(new Date().getFullYear());
    setAgeRating('PG-13');
    setSynopsis('');
    setDirectorNote('');
    setMovieLanguage('Filipino / Tagalog');
    setSubtitles('English, Tagalog');
    setVideoFile(null);
    setVideoUrlInput('');
    setVideoDuration(15);
    setVideoResolution('1080p Full HD');
    setFileSizeMB(0);
    setVideoPreviewUrl('');
    setPosterFile(null);
    setPosterUrlInput('');
    setPosterPreview('');
    setErrorMessage('');
    setIsSubmitting(false);
    setUploadProgress(0);
  };

  // Handle Video file selection & auto inspection
  const handleVideoFileSelected = (file: File) => {
    setVideoFile(file);
    const sizeInMB = Math.round((file.size / (1024 * 1024)) * 10) / 10;
    setFileSizeMB(sizeInMB);

    // Create temporary URL to read video duration & dimensions
    const tempUrl = URL.createObjectURL(file);
    setVideoPreviewUrl(tempUrl);

    const tempVideo = document.createElement('video');
    tempVideo.preload = 'metadata';
    tempVideo.src = tempUrl;
    tempVideo.onloadedmetadata = () => {
      if (tempVideo.duration && !isNaN(tempVideo.duration)) {
        const mins = Math.max(1, Math.round(tempVideo.duration / 60));
        setVideoDuration(mins);
      }
      if (tempVideo.videoWidth) {
        if (tempVideo.videoWidth >= 3840) setVideoResolution('4K Ultra HD');
        else if (tempVideo.videoWidth >= 1920) setVideoResolution('1080p Full HD');
        else if (tempVideo.videoWidth >= 1280) setVideoResolution('720p HD');
        else setVideoResolution('Standard Definition');
      }

      // If user hasn't typed a title yet, suggest from filename
      if (!title) {
        const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
        const capitalized = cleanName.charAt(0).toUpperCase() + cleanName.slice(1);
        setTitle(capitalized);
      }
    };
  };

  // Handle Poster file selection
  const handlePosterFileSelected = (file: File) => {
    setPosterFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setPosterPreview(e.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const toggleGenre = (genre: string) => {
    if (selectedGenres.includes(genre)) {
      if (selectedGenres.length > 1) {
        setSelectedGenres(selectedGenres.filter((g) => g !== genre));
      }
    } else {
      setSelectedGenres([...selectedGenres, genre]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!title.trim()) {
      setErrorMessage(language === 'tl' ? 'Mangyaring ilagay ang pamagat ng pelikula.' : 'Please enter movie title.');
      return;
    }

    if (!director.trim()) {
      setErrorMessage(language === 'tl' ? 'Mangyaring ilagay ang pangalan ng direktor.' : 'Please specify the director.');
      return;
    }

    if (!synopsis.trim()) {
      setErrorMessage(language === 'tl' ? 'Mangyaring maglagay ng maikling buod o synopsis.' : 'Please provide a synopsis.');
      return;
    }

    if (!videoFile && !videoUrlInput && !movieToEdit?.videoUrl) {
      setErrorMessage(language === 'tl' ? 'Mangyaring mag-upload ng video file o maglagay ng video stream URL.' : 'Please provide a video file or streaming URL.');
      return;
    }

    setIsSubmitting(true);
    setUploadProgress(15);

    try {
      const movieId = movieToEdit?.id || generateId();
      let finalVideoUrl = videoUrlInput;
      let finalVideoBlobKey = movieToEdit?.videoBlobKey;
      let finalPosterUrl = posterPreview || posterUrlInput || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=800&q=80';
      let finalPosterBlobKey = movieToEdit?.posterBlobKey;

      // 1. Store Video Blob in IndexedDB if user uploaded an actual file
      if (videoFile) {
        setUploadProgress(40);
        const blobKey = `video_${movieId}`;
        await saveMediaBlob(blobKey, videoFile);
        finalVideoBlobKey = blobKey;
        // In-memory preview URL for immediate session playback
        finalVideoUrl = URL.createObjectURL(videoFile);
        setUploadProgress(70);
      }

      // 2. Store Poster Blob in IndexedDB if user uploaded an image file
      if (posterFile) {
        const posterKey = `poster_${movieId}`;
        await saveMediaBlob(posterKey, posterFile);
        finalPosterBlobKey = posterKey;
        finalPosterUrl = posterPreview;
      }

      setUploadProgress(90);

      const castList = castString
        .split(',')
        .map((c) => c.trim())
        .filter(Boolean);

      const subtitleList = subtitles
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      const updatedMovie: Movie = {
        id: movieId,
        title: title.trim(),
        originalTitle: tagline.trim() ? `${title.trim()} (${tagline.trim()})` : title.trim(),
        director: director.trim(),
        cast: castList.length > 0 ? castList : ['Cast TBA'],
        synopsis: synopsis.trim(),
        tagline: tagline.trim() || undefined,
        genre: selectedGenres,
        releaseYear: Number(releaseYear) || new Date().getFullYear(),
        durationMinutes: Number(videoDuration) || 15,
        ageRating,
        language: movieLanguage || 'Filipino',
        subtitles: subtitleList,
        posterUrl: finalPosterUrl,
        backdropUrl: finalPosterUrl,
        videoUrl: finalVideoUrl || movieToEdit?.videoUrl || '',
        videoBlobKey: finalVideoBlobKey,
        posterBlobKey: finalPosterBlobKey,
        isUserUploaded: true,
        uploadedAt: movieToEdit?.uploadedAt || new Date().toISOString(),
        fileSizeMB: fileSizeMB > 0 ? fileSizeMB : movieToEdit?.fileSizeMB,
        videoResolution: videoResolution || '1080p Full HD',
        directorNote: directorNote.trim() || undefined,
        averageRating: movieToEdit?.averageRating || 5.0,
        totalReviews: movieToEdit?.totalReviews || 1,
        viewsCount: movieToEdit?.viewsCount || 0
      };

      // Save to IndexedDB
      await saveMovieMetaToDB(updatedMovie);

      setUploadProgress(100);

      setTimeout(() => {
        onMovieUploaded(updatedMovie);
        onClose();
        resetForm();
      }, 500);

    } catch (err: any) {
      console.error('Error saving movie:', err);
      setErrorMessage(language === 'tl' 
        ? 'Nagkaroon ng problema sa pag-save ng pelikula: ' + (err?.message || 'Subukan muli.') 
        : 'Failed to save movie: ' + (err?.message || 'Try again.')
      );
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6">
      <div className="relative w-full max-w-3xl bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="px-6 py-5 border-b border-neutral-800 flex items-center justify-between bg-neutral-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-extrabold text-white font-['Cinzel',serif]">
                {movieToEdit 
                  ? (language === 'tl' ? 'I-edit ang Pelikula' : 'Edit Original Movie')
                  : (language === 'tl' ? 'Mag-upload ng Orihinal na Pelikula' : 'Upload Original Movie')
                }
              </h2>
              <p className="text-xs text-neutral-400">
                {language === 'tl' 
                  ? 'Ibahagi ang iyong orihinal na pelikula, indie short, o serye sa SineHub' 
                  : 'Publish your original indie films, shorts, or passion projects to SineHub'
                }
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="text-neutral-400 hover:text-white p-2 rounded-lg hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mx-6 mt-4 p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Section 1: Video File & Source */}
          <div className="space-y-3">
            <label className="flex items-center justify-between text-xs font-bold text-neutral-200 uppercase tracking-wider">
              <span className="flex items-center gap-1.5">
                <Video className="w-4 h-4 text-amber-400" />
                {language === 'tl' ? '1. Video File o Stream Link (Pelikula)' : '1. Movie Video File or Stream Link'}
              </span>
              <span className="text-[11px] text-amber-400 font-normal lowercase">
                (MP4, WebM, MKV, MOV)
              </span>
            </label>

            {/* Video Drag and Drop Zone */}
            <div
              onClick={() => videoInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all ${
                videoFile
                  ? 'border-emerald-500/60 bg-emerald-950/20'
                  : 'border-neutral-700/80 hover:border-amber-400/70 bg-neutral-950/40'
              }`}
            >
              <input
                ref={videoInputRef}
                type="file"
                accept="video/mp4,video/webm,video/ogg,video/quicktime,video/x-matroska"
                onChange={(e) => e.target.files?.[0] && handleVideoFileSelected(e.target.files[0])}
                className="hidden"
              />

              {videoFile ? (
                <div className="flex items-center justify-center gap-3 text-emerald-400">
                  <CheckCircle2 className="w-6 h-6 flex-shrink-0" />
                  <div className="text-left">
                    <p className="text-sm font-bold text-white truncate max-w-sm">
                      {videoFile.name}
                    </p>
                    <p className="text-xs text-neutral-400">
                      {fileSizeMB} MB • {videoDuration} min • {videoResolution}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setVideoFile(null);
                      setVideoPreviewUrl('');
                    }}
                    className="text-xs text-neutral-400 hover:text-rose-400 underline ml-2"
                  >
                    {language === 'tl' ? 'Palitan' : 'Change'}
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="w-10 h-10 mx-auto rounded-full bg-neutral-800 flex items-center justify-center text-amber-400">
                    <Upload className="w-5 h-5" />
                  </div>
                  <p className="text-xs font-semibold text-white">
                    {language === 'tl' 
                      ? 'I-click o i-drag dito ang video file ng iyong pelikula' 
                      : 'Click or drag & drop your original movie video file here'
                    }
                  </p>
                  <p className="text-[11px] text-neutral-400">
                    {language === 'tl'
                      ? 'Ligtas na maiimbak sa browser IndexedDB para ma-play anumang oras'
                      : 'Stored securely in your local browser database for offline playback'
                    }
                  </p>
                </div>
              )}
            </div>

            {/* Alternative: Stream URL */}
            <div className="pt-1">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-[11px] text-neutral-400">
                  {language === 'tl' ? 'O kaya ay maglagay ng direktang video link:' : 'Or enter a direct video stream URL:'}
                </span>
              </div>
              <input
                type="url"
                value={videoUrlInput}
                onChange={(e) => {
                  setVideoUrlInput(e.target.value);
                  if (e.target.value) setVideoPreviewUrl(e.target.value);
                }}
                placeholder="https://example.com/my-original-film.mp4"
                className="w-full bg-neutral-950 text-xs text-neutral-200 px-3.5 py-2.5 rounded-lg border border-neutral-700/80 focus:border-amber-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Section 2: Poster Art */}
          <div className="space-y-3">
            <label className="flex items-center justify-between text-xs font-bold text-neutral-200 uppercase tracking-wider">
              <span className="flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-amber-400" />
                {language === 'tl' ? '2. Opisyal na Poster ng Pelikula' : '2. Official Movie Poster'}
              </span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              {/* Poster Preview */}
              <div className="sm:col-span-1 aspect-[2/3] rounded-xl overflow-hidden bg-neutral-950 border border-neutral-800 flex items-center justify-center">
                {posterPreview ? (
                  <img
                    src={posterPreview}
                    alt="Poster Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-center p-3 text-neutral-500">
                    <ImageIcon className="w-8 h-8 mx-auto mb-1 opacity-50" />
                    <span className="text-[10px]">No Poster Yet</span>
                  </div>
                )}
              </div>

              {/* Poster Upload & URL input */}
              <div className="sm:col-span-3 space-y-3">
                <div
                  onClick={() => posterInputRef.current?.click()}
                  className="border border-dashed border-neutral-700 hover:border-amber-400/80 rounded-xl p-4 text-center cursor-pointer bg-neutral-950/40 transition-colors"
                >
                  <input
                    ref={posterInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => e.target.files?.[0] && handlePosterFileSelected(e.target.files[0])}
                    className="hidden"
                  />
                  <p className="text-xs font-semibold text-neutral-200">
                    {language === 'tl' ? 'Mag-upload ng Poster Image (JPG/PNG)' : 'Upload Poster Image file (JPG/PNG)'}
                  </p>
                  <p className="text-[11px] text-neutral-500">
                    Inirerekomenda: 800x1200 o vertical aspect ratio
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="text-[11px] text-neutral-400">
                    {language === 'tl' ? 'O maglagay ng Poster Image URL:' : 'Or enter an Image URL:'}
                  </span>
                  <input
                    type="url"
                    value={posterUrlInput}
                    onChange={(e) => {
                      setPosterUrlInput(e.target.value);
                      setPosterPreview(e.target.value);
                    }}
                    placeholder="https://images.unsplash.com/photo-..."
                    className="w-full bg-neutral-950 text-xs text-neutral-200 px-3.5 py-2 rounded-lg border border-neutral-700/80 focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Movie Details */}
          <div className="space-y-4 pt-2 border-t border-neutral-800">
            <h3 className="text-xs font-bold text-neutral-200 uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-amber-400" />
              {language === 'tl' ? '3. Impormasyon at Kredito' : '3. Movie Information & Credits'}
            </h3>

            {/* Title & Tagline */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs text-neutral-300 font-semibold">
                  {language === 'tl' ? 'Pamagat ng Pelikula *' : 'Movie Title *'}
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={language === 'tl' ? 'Hal. Ang Huling Hantungan' : 'e.g. Echoes of the Valley'}
                  className="w-full bg-neutral-950 text-xs text-neutral-100 px-3.5 py-2.5 rounded-lg border border-neutral-700/80 focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-neutral-300 font-semibold">
                  {language === 'tl' ? 'Tagline o Orihinal na Subtitle' : 'Tagline / Short Hook'}
                </label>
                <input
                  type="text"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  placeholder={language === 'tl' ? 'Hal. Walang sikretong nananatiling nakatago.' : 'e.g. Every choice casts a shadow.'}
                  className="w-full bg-neutral-950 text-xs text-neutral-100 px-3.5 py-2.5 rounded-lg border border-neutral-700/80 focus:border-amber-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Director & Cast */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs text-neutral-300 font-semibold">
                  {language === 'tl' ? 'Pangalan ng Direktor / Filmmaker *' : 'Director / Filmmaker *'}
                </label>
                <input
                  type="text"
                  required
                  value={director}
                  onChange={(e) => setDirector(e.target.value)}
                  placeholder="Hal. Juan Dela Cruz"
                  className="w-full bg-neutral-950 text-xs text-neutral-100 px-3.5 py-2.5 rounded-lg border border-neutral-700/80 focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-neutral-300 font-semibold">
                  {language === 'tl' ? 'Cast / Mga Bida (hiwalay ng kuwit)' : 'Cast / Actors (comma separated)'}
                </label>
                <input
                  type="text"
                  value={castString}
                  onChange={(e) => setCastString(e.target.value)}
                  placeholder="Maria Santos, Jose Perez, Antonio Reyes"
                  className="w-full bg-neutral-950 text-xs text-neutral-100 px-3.5 py-2.5 rounded-lg border border-neutral-700/80 focus:border-amber-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Genres Selection */}
            <div className="space-y-1.5">
              <label className="text-xs text-neutral-300 font-semibold">
                {language === 'tl' ? 'Pumili ng Genre (Maaaring marami):' : 'Select Genres (Multi-select):'}
              </label>
              <div className="flex flex-wrap gap-1.5">
                {AVAILABLE_GENRES.map((genre) => {
                  const isSelected = selectedGenres.includes(genre);
                  return (
                    <button
                      key={genre}
                      type="button"
                      onClick={() => toggleGenre(genre)}
                      className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                        isSelected
                          ? 'bg-amber-400 text-neutral-950 font-bold shadow-xs'
                          : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                      }`}
                    >
                      {genre}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Technical Specs: Duration, Year, Age Rating, Resolution */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="space-y-1">
                <label className="text-xs text-neutral-300 font-semibold flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-neutral-400" />
                  {language === 'tl' ? 'Haba (Minuto)' : 'Duration (Mins)'}
                </label>
                <input
                  type="number"
                  min="1"
                  max="400"
                  value={videoDuration}
                  onChange={(e) => setVideoDuration(Number(e.target.value))}
                  className="w-full bg-neutral-950 text-xs text-neutral-100 px-3 py-2 rounded-lg border border-neutral-700/80 focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-neutral-300 font-semibold">
                  {language === 'tl' ? 'Taon' : 'Year'}
                </label>
                <input
                  type="number"
                  min="1990"
                  max="2030"
                  value={releaseYear}
                  onChange={(e) => setReleaseYear(Number(e.target.value))}
                  className="w-full bg-neutral-950 text-xs text-neutral-100 px-3 py-2 rounded-lg border border-neutral-700/80 focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-neutral-300 font-semibold flex items-center gap-1">
                  <Shield className="w-3.5 h-3.5 text-neutral-400" />
                  {language === 'tl' ? 'Rating' : 'Age Rating'}
                </label>
                <select
                  value={ageRating}
                  onChange={(e) => setAgeRating(e.target.value as any)}
                  className="w-full bg-neutral-950 text-xs text-neutral-100 px-2.5 py-2 rounded-lg border border-neutral-700/80 focus:border-amber-500 focus:outline-none"
                >
                  <option value="G">G (General)</option>
                  <option value="PG">PG (Parental)</option>
                  <option value="PG-13">PG-13</option>
                  <option value="R-16">R-16</option>
                  <option value="R-18">R-18 (Mature)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-neutral-300 font-semibold">
                  {language === 'tl' ? 'Resolusyon' : 'Resolution'}
                </label>
                <select
                  value={videoResolution}
                  onChange={(e) => setVideoResolution(e.target.value)}
                  className="w-full bg-neutral-950 text-xs text-neutral-100 px-2.5 py-2 rounded-lg border border-neutral-700/80 focus:border-amber-500 focus:outline-none"
                >
                  <option value="4K Ultra HD">4K Ultra HD</option>
                  <option value="1080p Full HD">1080p Full HD</option>
                  <option value="720p HD">720p HD</option>
                  <option value="Standard Definition">Standard (SD)</option>
                </select>
              </div>
            </div>

            {/* Synopsis */}
            <div className="space-y-1">
              <label className="text-xs text-neutral-300 font-semibold">
                {language === 'tl' ? 'Buod ng Kwento (Synopsis) *' : 'Movie Synopsis / Storyline *'}
              </label>
              <textarea
                required
                rows={3}
                value={synopsis}
                onChange={(e) => setSynopsis(e.target.value)}
                placeholder={language === 'tl' ? 'Ikwento ang tungkol sa iyong pelikula...' : 'Describe the plot and emotional core of your movie...'}
                className="w-full bg-neutral-950 text-xs text-neutral-100 px-3.5 py-2.5 rounded-lg border border-neutral-700/80 focus:border-amber-500 focus:outline-none leading-relaxed"
              />
            </div>

            {/* Director's Note */}
            <div className="space-y-1">
              <label className="text-xs text-neutral-300 font-semibold">
                {language === 'tl' ? 'Mensahe ng Direktor / Behind the Scenes (Opsyonal)' : "Director's Note / Behind The Scenes (Optional)"}
              </label>
              <textarea
                rows={2}
                value={directorNote}
                onChange={(e) => setDirectorNote(e.target.value)}
                placeholder={language === 'tl' ? 'Bakit mo ginawa ang pelikulang ito? Ano ang naging inspirasyon?' : 'Share your creative process, inspiration, or personal reflection...'}
                className="w-full bg-neutral-950 text-xs text-neutral-100 px-3.5 py-2 rounded-lg border border-neutral-700/80 focus:border-amber-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Progress bar during submit */}
          {isSubmitting && (
            <div className="space-y-2 p-3 bg-neutral-950 rounded-xl border border-neutral-800">
              <div className="flex items-center justify-between text-xs text-neutral-300 font-semibold">
                <span>{language === 'tl' ? 'Ini-imbak ang video sa database...' : 'Saving movie and media to database...'}</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full h-2 bg-neutral-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-amber-400 to-rose-500 transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div className="pt-4 border-t border-neutral-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-semibold transition-colors"
            >
              {language === 'tl' ? 'Kanselahin' : 'Cancel'}
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-neutral-950 text-xs font-extrabold shadow-lg shadow-amber-500/20 transition-all disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>
                {movieToEdit 
                  ? (language === 'tl' ? 'I-save ang Pagbabago' : 'Save Changes')
                  : (language === 'tl' ? 'I-publish ang Pelikula' : 'Publish Movie')
                }
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
