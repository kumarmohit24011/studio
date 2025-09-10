
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  // Allow cross-origin requests for Replit preview environment
  experimental: {
    serverActions: {
      allowedOrigins: ["*.google.com", "*.firebase.app", "*.cloud.run", "*.cloudworkstations.dev", "*.replit.dev", "*.repl.co"],
    },
  },
  // Allow dev origins for Replit proxy environment
  allowedDevOrigins: [
    '*.replit.dev',
    '*.repl.co',
    '*.kirk.replit.dev',
    'localhost:5000',
    '127.0.0.1:5000'
  ],
  // Enable trust proxy for Replit environment
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
        ],
      },
    ]
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
        port: '',
        pathname: '/**',
      }
    ],
  },
};

export default nextConfig;
