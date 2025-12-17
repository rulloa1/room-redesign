# RoomRevive Codebase Analysis

**Analysis Date:** December 17, 2025
**Branch:** `claude/analyze-codebase-O1atc`
**Repository:** dream-home-art

---

## Executive Summary

**RoomRevive** is an AI-powered interior design SaaS application that allows users to upload photos of rooms and receive AI-generated redesigns in various design styles. The application is built as a modern web application using React, TypeScript, Supabase, and AI image generation through the Lovable AI API.

### Key Features
- AI-powered room redesign with 13+ design styles
- Credit-based freemium subscription model (Free, Basic, Pro tiers)
- User authentication and authorization
- Portfolio management for saved designs
- Custom room design options (wall colors, trim, molding)
- Integration with external designer services

---

## Technology Stack

### Frontend
- **Framework:** React 18.3.1 with TypeScript 5.8.3
- **Build Tool:** Vite 5.4.19
- **Styling:** Tailwind CSS 3.4.17 with custom animations
- **UI Components:** shadcn-ui (Radix UI primitives)
- **State Management:** React Context API + TanStack Query 5.83.0
- **Routing:** React Router DOM 6.30.1
- **Forms:** React Hook Form 7.61.1 with Zod validation
- **Icons:** Lucide React 0.462.0

### Backend
- **Database & Auth:** Supabase (@supabase/supabase-js 2.87.3)
- **Edge Functions:** Deno runtime for serverless functions
- **AI Image Generation:** Google Gemini 2.5 Flash Image Preview (via Lovable AI Gateway)
- **Database:** PostgreSQL (via Supabase)

### Development Tools
- **Linter:** ESLint 9.32.0 with TypeScript support
- **Package Manager:** npm (with bun.lockb present, suggesting Bun compatibility)
- **Platform:** Lovable.dev (no-code/low-code platform integration)

---

## Application Architecture

### Directory Structure
```
/src
  /components          # React components
    /ui                # shadcn-ui component library (30+ components)
    BeforeAfter.tsx    # Image comparison slider
    ImageUpload.tsx    # File upload handler
    StyleSelector.tsx  # Design style picker
    CreditsDisplay.tsx # User credit counter
    RoomCustomizations.tsx # Advanced customization options
  /hooks               # Custom React hooks
    useAuth.tsx        # Authentication context
    useCredits.tsx     # Credit management
  /integrations
    /supabase          # Supabase client & types
  /pages               # Route pages
    Index.tsx          # Landing/main redesign page
    Auth.tsx           # Login/signup
    Dashboard.tsx      # User dashboard
    Portfolio.tsx      # Saved designs
    Project.tsx        # Individual project view
    Pricing.tsx        # Subscription plans
  /lib                 # Utilities
  App.tsx              # Root component
  main.tsx             # Entry point

/supabase
  /functions
    /redesign-room     # Edge function for AI processing
  /migrations          # 10 SQL migration files
  config.toml          # Supabase configuration
```

### Component Architecture

The application follows a typical React SPA architecture with:

1. **Context Providers (App.tsx)**
   - `QueryClientProvider` - React Query for server state
   - `AuthProvider` - User authentication state
   - `CreditsProvider` - Credit/subscription management
   - `TooltipProvider` - UI tooltips

2. **Protected Routes**
   - Portfolio, Dashboard, and Project pages check authentication
   - Redirect to `/auth` for unauthenticated users

3. **Custom Hooks**
   - `useAuth()` - Access user session, sign out
   - `useCredits()` - Check credits, use credits, tier permissions

---

## Core Features Analysis

### 1. AI Room Redesign System

**Workflow:**
1. User uploads room photo → `ImageUpload.tsx`
2. Selects design style → `StyleSelector.tsx`
3. Optionally customizes details → `RoomCustomizations.tsx`
4. Clicks "Generate Redesign" → `Index.tsx:handleRedesign()`
5. Frontend checks auth & credits → `useCredits.tsx`
6. Calls Supabase edge function → `supabase/functions/redesign-room/index.ts`
7. Edge function:
   - Validates user & deducts credit via RPC
   - Sends image + prompt to Lovable AI Gateway
   - Uses Google Gemini 2.5 Flash Image Preview model
   - Returns redesigned image as base64
8. Displays before/after comparison → `BeforeAfter.tsx`
9. Shows affiliate shopping links → `ShopThisLook.tsx`

**Supported Design Styles (13):**
- Standard: Modern, Scandinavian, Industrial, Bohemian, Minimalist, Traditional, Mid-Century, Coastal, Farmhouse
- Premium: Modern Spa, Art Deco, Japanese, Mediterranean (require paid plans)

**Advanced Customizations:**
- Wall colors (11 presets + custom)
- Trim/molding styles (8 options: wainscoting, shiplap, coffered, etc.)
- Trim colors (5 options)
- Additional freeform text requests

**Security Validations (redesign-room/index.ts):**
- Image size limit: 10MB
- Allowed styles whitelist
- Image format validation (data URL check)
- User authentication required
- Credit check before AI processing
- Automatic credit refund on AI errors

### 2. Credit & Subscription System

**Database Schema:**
```sql
user_credits
  - user_id (UUID, FK to auth.users)
  - tier (text: 'free' | 'basic' | 'pro')
  - credits_remaining (integer)
  - credits_monthly_limit (integer)
  - total_redesigns (integer)
  - subscription_started_at (timestamp)
  - subscription_ends_at (timestamp)
```

**Tier Comparison:**

| Feature | Free | Basic ($14.99/mo) | Pro ($24.99/mo) |
|---------|------|-------------------|-----------------|
| Redesigns | 3 (one-time) | 20/month | Unlimited |
| Watermark | Yes | No | No |
| Premium Styles | No | Yes | Yes |
| HD Images | No | Yes | Yes |
| Priority Processing | No | No | Yes |
| Save & Compare | No | No | Yes |
| Commercial License | No | No | Yes |

**Credit Flow:**
- New users automatically receive 3 free credits (via DB trigger)
- Credits deducted via `use_credit()` RPC function (src: useCredits.tsx:88)
- Pro tier bypasses credit checks (unlimited)
- Credit refund mechanism for AI failures (src: redesign-room/index.ts:241-255)

**Payment Integration:**
- UI prepared in `Pricing.tsx`
- Stripe integration pending (placeholder modal)
- No actual payment processing currently implemented

### 3. Authentication System

**Implementation:**
- Supabase Auth (email/password, OAuth ready)
- JWT-based sessions
- Context provider pattern (`AuthProvider` in useAuth.tsx)
- Protected routes redirect to `/auth`

**Auth Flow:**
```
Login → Supabase Auth → JWT Token → Session State → Context
                                          ↓
                                    Auto-create credits row
                                    (via DB trigger on auth.users)
```

### 4. Project & Portfolio Management

**Database Schema:**
```sql
projects
  - id, user_id, name, style, created_at, updated_at

project_rooms
  - id, project_id, room_type
  - original_image, redesigned_image
  - created_at
```

**Features:**
- Save redesigns to projects
- Multiple room views per project
- Portfolio gallery view
- Individual project detail pages
- Row-Level Security (RLS) policies ensure users only see their own projects

**RLS Policies:**
- Users can only SELECT/INSERT/UPDATE/DELETE their own projects
- project_rooms inherit security via EXISTS check on projects table

### 5. Admin System

**Database Schema:**
```sql
user_roles
  - user_id, role ('admin', etc.)
  - has_role(user_id, role) function
```

**Security:**
- Admin enumeration protection (migration 20251217005122)
- Role-based access control prepared
- Admins can view all user roles; users see only their own

---

## Database Architecture

### Tables & Relationships

**Core Tables:**
1. **auth.users** (Supabase managed) → stores user accounts
2. **user_credits** → 1:1 with users, tracks subscription tier
3. **projects** → Many:1 with users
4. **project_rooms** → Many:1 with projects
5. **user_roles** → Many:1 with users (admin system)

**Key Features:**
- Row-Level Security (RLS) on all tables
- Automatic timestamp updates (trigger function)
- Auto-initialization of credits on signup (trigger)
- Stored procedures for credit management

### Database Functions

**`use_credit(p_user_id UUID) → boolean`**
- Checks if user has credits or is pro tier
- Atomically deducts 1 credit if available
- Returns true if credit used, false if insufficient

**`has_role(user_id UUID, role TEXT) → boolean`**
- Checks if user has specific role
- Used in RLS policies

**`handle_new_user_credits()`**
- Trigger function on auth.users INSERT
- Auto-creates user_credits row with 3 free credits

### Migrations (10 files)
1. Initial projects/project_rooms tables
2. Credits system setup
3. RPC functions for credit management
4. Admin role system
5. Security fixes (admin enumeration)
6. Trigger setup for auto-credit creation
7. Data fixes for existing users

---

## Security Analysis

### Strengths

1. **Authentication & Authorization**
   - JWT-based Supabase auth
   - RLS policies on all tables
   - User can only access own data
   - Admin role system prepared

2. **Input Validation**
   - Image size limits (10MB)
   - Image format validation (data URL)
   - Style whitelist (prevents injection)
   - Server-side validation in edge function

3. **Credit Protection**
   - Server-side credit checks
   - Atomic credit deduction via RPC
   - Transaction safety in database
   - Credit refund on errors

4. **CORS Configuration**
   - Proper CORS headers in edge function
   - OPTIONS preflight support

### Potential Concerns & Recommendations

1. **API Key Exposure**
   - ✅ Lovable API key in environment variables (secure)
   - ✅ No hardcoded secrets detected

2. **Rate Limiting**
   - ⚠️ No client-side rate limiting visible
   - ⚠️ Edge function handles 429 from AI gateway
   - **Recommendation:** Add Supabase rate limiting on edge function

3. **Image Upload Security**
   - ✅ Size validation present
   - ✅ Format validation present
   - ⚠️ No malware/NSFW scanning detected
   - **Recommendation:** Consider image content moderation

4. **XSS Protection**
   - ✅ React automatically escapes JSX
   - ✅ No `dangerouslySetInnerHTML` detected
   - ✅ Proper input sanitization

5. **CSRF Protection**
   - ✅ Supabase handles CSRF for auth
   - ✅ JWT tokens in Authorization header

6. **Admin Enumeration**
   - ✅ Fixed in migration 20251217005122
   - Users can no longer enumerate admin list

7. **Error Messages**
   - ⚠️ Some detailed error messages returned to client
   - **Recommendation:** Sanitize error details in production

---

## Business Model Analysis

### Revenue Streams

1. **Subscription Plans**
   - Basic: $14.99/month (20 redesigns)
   - Pro: $24.99/month (unlimited)
   - Target: Home enthusiasts, realtors, interior designers

2. **Affiliate Revenue**
   - "Shop This Look" feature (ShopThisLook.tsx)
   - External designer partnership (mcdesign.bio)
   - Monetization of redesign results

### User Acquisition Strategy

**Freemium Funnel:**
1. New user → 3 free credits
2. User tries redesigns
3. Runs out of credits
4. `UpgradeModal` triggered
5. Directs to `/pricing`
6. Conversion to paid plan

**Premium Style Gating:**
- 4 styles locked behind paid plans
- Clicking triggers upgrade modal with feature-specific messaging

### Growth Potential

**Target Markets:**
- Homeowners considering renovations
- Real estate agents staging properties
- Interior designers creating mood boards
- E-commerce (furniture retailers)

---

## Code Quality Assessment

### Strengths

1. **Type Safety**
   - TypeScript throughout
   - Proper type definitions for Supabase tables
   - Zod validation for forms

2. **Component Architecture**
   - Good separation of concerns
   - Reusable UI components via shadcn-ui
   - Custom hooks for logic extraction

3. **State Management**
   - Context API for global state (auth, credits)
   - React Query for server state
   - Proper loading states

4. **Error Handling**
   - Try-catch blocks in async operations
   - User-friendly error messages via toast
   - Credit refunds on failures

5. **Accessibility**
   - ARIA labels present (e.g., Index.tsx:147-148)
   - Semantic HTML
   - Keyboard navigation via Radix UI

### Areas for Improvement

1. **Code Duplication**
   - Style mappings duplicated (Index.tsx:18, redesign-room/index.ts:123)
   - **Recommendation:** Extract to shared constants

2. **Magic Numbers**
   - Image size limit (10MB) hardcoded
   - Credit amounts hardcoded
   - **Recommendation:** Move to configuration file

3. **Testing**
   - No test files detected
   - **Recommendation:** Add Jest/Vitest + React Testing Library

4. **Documentation**
   - Limited inline comments
   - No JSDoc annotations
   - README is generic Lovable template
   - **Recommendation:** Add API documentation

5. **Error Monitoring**
   - Console.log for errors (redesign-room/index.ts)
   - **Recommendation:** Add Sentry or similar

6. **Environment Variables**
   - `.env` file present in repo (should be .gitignored)
   - **Recommendation:** Verify .gitignore coverage

---

## Performance Considerations

### Current Optimizations

1. **React Query Caching**
   - Server state cached by TanStack Query
   - Reduces redundant API calls

2. **Image Handling**
   - Base64 encoding for transfer
   - Direct upload to AI without storage

3. **Bundle Size**
   - Vite for tree-shaking
   - Code splitting via React Router

### Potential Bottlenecks

1. **Large Image Uploads**
   - 10MB limit allows large files
   - Base64 increases size by ~33%
   - **Recommendation:** Consider direct file upload to storage

2. **AI Processing Time**
   - Loading overlay present (good UX)
   - No timeout handling visible
   - **Recommendation:** Add timeout + retry logic

3. **Unlimited Pro Users**
   - No rate limiting on AI calls
   - Could lead to abuse
   - **Recommendation:** Add soft limits or monitoring

---

## Deployment & Infrastructure

### Platform: Lovable.dev

- Automated deployments from Git
- Supabase for backend
- Likely hosted on Vercel or similar
- Edge functions on Supabase infrastructure

### Environment Variables Required

```
SUPABASE_URL
SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
LOVABLE_API_KEY
```

### Database Hosting

- Supabase PostgreSQL
- Auto-backups via Supabase
- Connection pooling handled by Supabase

---

## Competitive Analysis

### Unique Selling Points

1. **Customization Options**
   - Wall color, trim, molding customization
   - Most competitors offer basic style selection only

2. **Designer Partnership**
   - Direct link to professional designer (mcdesign.bio)
   - Bridges AI → real implementation

3. **Portfolio Management**
   - Save and compare designs
   - Build a project library

### Competitors

- Reimagine Home AI
- RoomGPT
- InteriorAI
- Virtually Staging AI

### Differentiation Strategy

- More detailed customization controls
- Professional designer integration
- Project-based organization (not just one-off generations)

---

## Roadmap Recommendations

### Short-term (1-2 months)

1. **Payment Integration**
   - Connect Stripe API
   - Implement subscription webhooks
   - Handle subscription lifecycle

2. **Testing Suite**
   - Unit tests for hooks
   - Integration tests for auth flow
   - E2E tests for redesign workflow

3. **Error Monitoring**
   - Add Sentry or LogRocket
   - Track AI failure rates
   - Monitor credit system bugs

4. **SEO Optimization**
   - Add meta tags
   - Implement OpenGraph tags
   - Create sitemap.xml

### Medium-term (3-6 months)

1. **Advanced Features**
   - Multiple room redesigns in single project
   - Side-by-side style comparison
   - Export to PDF/presentation

2. **Social Features**
   - Share redesigns publicly
   - Portfolio public URLs
   - Social media sharing

3. **Mobile App**
   - React Native version
   - Camera integration
   - Push notifications

4. **Analytics Dashboard**
   - User engagement metrics
   - Popular styles tracking
   - Conversion funnel analysis

### Long-term (6-12 months)

1. **Advanced AI Features**
   - Multi-angle room redesigns
   - Furniture object detection + swapping
   - Virtual staging for empty rooms

2. **B2B Features**
   - Team accounts
   - White-label solution
   - API access for partners

3. **Marketplace**
   - Connect users with contractors
   - Product recommendations (affiliate)
   - Designer marketplace

---

## Risk Assessment

### Technical Risks

1. **AI Service Dependency**
   - Single provider (Lovable AI Gateway)
   - **Mitigation:** Add fallback provider

2. **Supabase Vendor Lock-in**
   - Heavy reliance on Supabase features
   - **Mitigation:** Abstract database layer

3. **Image Storage Costs**
   - Currently no persistent storage
   - Scale could require significant storage
   - **Mitigation:** Implement CDN + compression

### Business Risks

1. **Credit Abuse**
   - Users could game free tier
   - **Mitigation:** Add email verification, device tracking

2. **Payment Disputes**
   - Subscription refunds/chargebacks
   - **Mitigation:** Clear ToS, quality guarantees

3. **Competition**
   - Low barrier to entry in AI SaaS
   - **Mitigation:** Focus on UX and customization depth

---

## Conclusion

**RoomRevive** is a well-architected, modern AI SaaS application with strong foundations in:
- Secure authentication and authorization
- Scalable credit/subscription system
- Quality frontend architecture with TypeScript + React
- Clean separation of concerns

**Key Strengths:**
- Advanced customization options beyond competitors
- Professional designer partnership for real implementation
- Solid security practices with RLS and input validation

**Priority Improvements:**
1. Payment integration (Stripe)
2. Testing suite
3. Error monitoring
4. Rate limiting on AI calls
5. Shared constants for duplicated data

The codebase is production-ready but would benefit from the testing, monitoring, and payment systems before scaling. The business model is sound with clear freemium funnel and multiple revenue streams.

---

**Analyzed by:** Claude (Sonnet 4.5)
**Lines of Code:** ~5,000+ (excluding node_modules)
**Files Analyzed:** 70+ TypeScript/JavaScript files, 10 SQL migrations
**Confidence:** High - comprehensive analysis with direct code review
