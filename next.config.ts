
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Permissions-Policy',
            value: "camera=(), microphone=(), geolocation=(), payment=*, publickey-credentials-create=(), publickey-credentials-get=(), clipboard-write=(), web-share=(), otp-credentials=()",
          },
        ],
      }
    ];
  },
  // Allow cross-origin requests for Replit preview environment
  experimental: {
    serverActions: {
      allowedOrigins: process.env.NODE_ENV === 'development' 
        ? ["*.replit.dev", "*.repl.co", "localhost", "127.0.0.1", "*.cloudworkstations.dev"]
        : (process.env.ALLOWED_ORIGINS?.split(',') || ["redbow-24723.web.app", "redbow-24723.firebaseapp.com"]), // Environment-driven allowed origins
    },
  },
  // Add allowedDevOrigins to fix cross-origin warnings in development
  ...(process.env.NODE_ENV === 'development' && {
    allowedDevOrigins: [
      "*.replit.dev", 
      "*.repl.co",
      "*.kirk.repl.co", 
      "localhost",
      "127.0.0.1"
    ]
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
