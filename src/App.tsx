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
    id: 'enola-holmes-3',
    title: 'Enola Holmes 3',
    tagline: 'Ang pinakabagong misteryo.',
    description: 'Sundan ang pakikipagsapalaran ni Enola Holmes sa paglutas ng bagong kaso at misteryo.',
    director: 'Harry Bradbeer',
    year: 2024,
    genre: 'Misteryo (Mystery)',
    duration: '129 min',
    rating: 4.9,
    quality: '1080p Full HD',
    posterUrl: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=800&q=80',
    videoUrl: 'https://drive.google.com/file/d/YOUR_GOOGLE_DRIVE_ID_HERE/view',
    isOriginal: true,
  },
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
  }
];
