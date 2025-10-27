export const getImageSrc = (imageUrl: string | null | undefined): string | null => {
  if (!imageUrl) return null;
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://bptap.health.go.ke';  
  if (imageUrl.startsWith('http://localhost')) {
    return imageUrl.replace('http://localhost', baseUrl);
  }
  if (imageUrl.startsWith('/media/')) {
    return `${baseUrl}${imageUrl}`;
  }
  return imageUrl;
};