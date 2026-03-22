import type { MetadataRoute } from 'next';

export const dynamic = 'force-static';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'IGNITE - Find Your Spark',
    short_name: 'IGNITE',
    description: 'A dating website for finding your perfect match.',
    start_url: '/',
    display: 'standalone',
    background_color: '#080808',
    theme_color: '#E8192C',
    icons: [
      {
        src: '/next.svg',
        sizes: 'any',
        type: 'image/svg+xml',
      },
    ],
  };
}
