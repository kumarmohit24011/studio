/** @type {import('next').NextConfig} */
const nextConfig = {
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
  // Note: allowedDevOrigins is deprecated and removed as it's no longer supported
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

module.exports = nextConfig;