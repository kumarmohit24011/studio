# Redbow - E-commerce Jewelry Website

## Overview
This is a Next.js 15 e-commerce application for jewelry sales, built with Firebase backend, Tailwind CSS, and Radix UI components. The project includes a complete admin panel and customer-facing storefront.

## Recent Changes
- **2025-09-17**: COMPLETED deployment configuration with CI/CD pipeline and Firebase rules
- **2025-09-17**: Added category image upload system with Firebase Storage integration
- **2025-09-17**: Fixed Firebase Storage rules to allow authenticated category uploads
- **2025-09-17**: Updated production CORS settings for Firebase Hosting domains
- **2025-09-17**: Created comprehensive deployment scripts and GitHub Actions workflow
- **2025-09-10**: FIXED critical admin panel ERR_BLOCKED_BY_CLIENT error by renaming ad-triggering paths
- **2025-09-10**: RESOLVED Firebase PERMISSION_DENIED errors by removing server-side write-on-read
- **2025-09-10**: Added automatic cache revalidation (60s home/products, 30s admin) for live site
- **2025-09-10**: Created manual cache invalidation API at /api/cache for immediate updates

## Project Architecture

### Frontend
- **Framework**: Next.js 15 with App Router
- **Styling**: Tailwind CSS + Radix UI components
- **State Management**: React hooks + Firebase integration
- **Build Tool**: Turbopack for fast development

### Backend  
- **Database**: Firebase Firestore
- **Authentication**: Firebase Auth
- **Storage**: Firebase Storage
- **AI Integration**: Google AI via Genkit

### Key Features
- Product catalog with categories and filtering
- Shopping cart and wishlist functionality  
- User authentication and profiles
- Admin dashboard for managing products, orders, customers
- Payment integration with Razorpay
- Responsive design for mobile and desktop

### Development Setup
- Dev server runs on port 5000 (configured for Replit)
- Uses 0.0.0.0 binding to work with Replit's proxy
- Hot reload enabled with Turbopack

### Deployment
- **Production Hosting**: Firebase Hosting with Next.js Framework backend
- **Automated CI/CD**: GitHub Actions workflow for continuous deployment
- **Manual Deployment**: `./deploy.sh` script with Firebase CLI
- **Environment Setup**: Copy `.env.example` to `.env.local` and configure secrets
- **Build Commands**: `npm run build` → `npm start`

#### Deployment Options:
1. **GitHub Actions** (Recommended):
   - Push to main branch triggers automatic deployment
   - Requires Firebase service account key in GitHub Secrets
   
2. **Manual Script**:
   ```bash
   ./deploy.sh  # Requires Firebase CLI login or FIREBASE_TOKEN
   ```

3. **Firebase Console**:
   - Deploy storage rules manually via Firebase Console → Storage → Rules

## File Structure
- `src/app/` - Next.js app router pages
- `src/components/` - Reusable UI components
- `src/services/` - Firebase service layer
- `src/lib/` - Utilities and type definitions
- `src/hooks/` - Custom React hooks