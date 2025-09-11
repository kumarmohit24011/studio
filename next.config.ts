
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  // Allow cross-origin requests for Replit preview environment
  experimental: {
    serverActions: {
      allowedOrigins: process.env.NODE_ENV === 'development' 
        ? ["*.replit.dev", "*.repl.co", "localhost", "127.0.0.1"]
        : [], // Restrict in production - add specific domains as needed
    },
  },
  // Allow dev origins for Replit proxy environment - comprehensive setup
  ...(process.env.NODE_ENV === 'development' && {
    allowedDevOrigins: [
      '*.replit.dev',
      '*.repl.co', 
      '*.kirk.replit.dev',
      '*.riker.replit.dev',
      '*-*.replit.dev',
      'localhost:5000',
      '127.0.0.1:5000',
      'localhost',
      '127.0.0.1'
    ],
  }),
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
