# Foop - B2B Automation SaaS

A Next.js application with Clerk authentication for B2B workflow automation.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure Clerk:
   - Create a Clerk account at https://clerk.com
   - Create a new application in the Clerk Dashboard
   - Copy your API keys to `.env.local`:
```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxx
CLERK_SECRET_KEY=sk_test_xxxxx
```

3. Run development server:
```bash
npm run dev
```

## Authentication Features

- Sign up with email/password
- Sign in with email/password
- Password reset via email
- Email verification
- Protected routes via middleware
- User profile management (via Clerk UserButton)

## Project Structure

```
src/
  app/
    page.tsx           # Landing page (public)
    layout.tsx         # Root layout with ClerkProvider
    sign-in/           # Sign in page
    sign-up/           # Sign up page
    dashboard/         # Protected dashboard
  components/
    header.tsx         # Header with UserButton
  hooks/
    use-auth.ts        # Custom auth hooks
  lib/
    auth.ts            # Server-side auth utilities
  middleware.ts        # Route protection middleware
```
