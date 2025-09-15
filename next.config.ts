
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
      },
      {
        // Apply these headers to all API routes
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Credentials", value: "true" },
          { key: "Access-Control-Allow-Origin", value: "*" }, // Or you can be more specific here
          { key: "Access-Control-Allow-Methods", value: "GET,OPTIONS,PATCH,DELETE,POST,PUT" },
          { key: "Access-Control-Allow-Headers", value: "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version" },
        ]
      }
    ];
  },
  // Allow cross-origin requests for Replit preview environment
  experimental: {
    serverActions: {
      allowedOrigins: process.env.NODE_ENV === 'development' 
        ? ["*.replit.dev", "*.repl.co", "localhost", "127.0.0.1", "*.cloudworkstations.dev"]
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
      '*.cloudworkstations.dev',
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
