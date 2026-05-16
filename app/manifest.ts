import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Wotmind — AI Business Brain',
    short_name: 'Wotmind',
    description:
      'AI-powered business orchestration platform for Nigerian MSMEs. Built on Squad.',
    start_url: '/dashboard',
    display: 'standalone',
    background_color: '#0a0a0b',
    theme_color: '#ff6d5a',
    orientation: 'portrait-primary',
    categories: ['business', 'finance', 'productivity'],
    icons: [
      {
        src: '/favicon.ico',
        sizes: '256x256',
        type: 'image/x-icon',
      },
    ],
  };
}
