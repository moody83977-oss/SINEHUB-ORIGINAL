export function formatDuration(minutes: number, lang: 'tl' | 'en' = 'tl'): string {
  if (!minutes || minutes <= 0) return '0 min';
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = Math.round(minutes % 60);

  if (hours > 0) {
    if (remainingMinutes > 0) {
      return `${hours}h ${remainingMinutes}m`;
    }
    return `${hours} oras`;
  }
  return `${remainingMinutes} min`;
}

export function formatFileSize(mb?: number): string {
  if (!mb) return '';
  if (mb >= 1024) {
    return `${(mb / 1024).toFixed(1)} GB`;
  }
  return `${mb.toFixed(1)} MB`;
}

export function generateId(): string {
  return 'movie_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 7);
}
