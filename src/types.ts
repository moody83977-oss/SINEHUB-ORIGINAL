export interface Movie {
  id: string;
  title: string;
  originalTitle?: string;
  director: string;
  cast: string[];
  synopsis: string;
  tagline?: string;
  genre: string[];
  releaseYear: number;
  durationMinutes: number;
  ageRating: 'G' | 'PG' | 'PG-13' | 'R-16' | 'R-18';
  language: string;
  subtitles?: string[];
  posterUrl: string;
  backdropUrl?: string;
  videoUrl: string;
  videoBlobKey?: string;
  posterBlobKey?: string;
  trailerUrl?: string;
  isUserUploaded: boolean;
  uploadedAt: string;
  fileSizeMB?: number;
  videoResolution?: string;
  directorNote?: string;
  averageRating: number;
  totalReviews: number;
  viewsCount: number;
}

export interface Review {
  id: string;
  movieId: string;
  author: string;
  rating: number;
  comment: string;
  date: string;
}

export type SortOption = 'featured' | 'newest' | 'rating' | 'duration' | 'title';

export interface FilterState {
  genre: string;
  sortBy: SortOption;
  searchQuery: string;
  onlyMyUploads: boolean;
}
