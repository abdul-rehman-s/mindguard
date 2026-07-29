---
Task ID: 1
Agent: main
Task: Fix authentication flow bug, premium auth experience, and navigation animation

Work Log:
- Investigated the complete auth flow: Landing → Sign Up → API → Session → Zustand → NextAuth → Router → Success Overlay → Navigation → Onboarding
- Identified ROOT CAUSE of the "stuck forever after success screen" bug: THREE interlocking bugs
  1. `handleAuthSuccess` in landing-page.tsx was a NO-OP (empty function)
  2. `useSession()` never detected the new session after `signIn('credentials', { redirect: false })` because SessionProvider had no `refetchInterval`
  3. The success overlay was a visual dead end with no timeout, navigation, or session refresh
- ADDITIONAL BUG FOUND: `isLanding` condition in page.tsx was `currentView === 'landing' || status === 'unauthenticated'` — this meant even authenticated users with `currentView === 'landing'` still saw the landing page
- Fixed sign-up-form.tsx: Import `getSession` from next-auth/react, call `await getSession()` after 1.2s delay to force session refresh
- Fixed sign-in-form.tsx: Same fix — import `getSession`, call after 1.2s delay
- Fixed auth-provider.tsx: Added `refetchInterval={5 * 60}` and `refetchOnWindowFocus={true}` as safety net
- Fixed page.tsx: Changed `isLanding` condition from `currentView === 'landing' || status === 'unauthenticated'` to `status === 'unauthenticated'` only — authenticated users always see onboarding or dashboard
- Added premium AnimatePresence transitions between landing, onboarding, and dashboard views
- Upgraded AuthCard from 420px to 560px with larger padding, better glass effect, richer shadows
- Upgraded AuthSuccessOverlay with larger checkmark icon, more confetti particles, bigger text
- Upgraded AuthHeader with larger typography (2rem), better spacing
- Upgraded StepIndicator with larger dots and wider active state
- Upgraded AuthField with larger inputs (h-[60px] vs h-14), larger floating labels
- Upgraded AuthButton and StepButton with taller buttons (h-[56px] vs h-[52px])
- Upgraded OAuth buttons with more padding (py-3.5 vs py-2.5)
- Updated forgot-password-form.tsx and email-verification.tsx to match new 560px width
- Fixed TypeScript errors with `ease` type by adding `as [number, number, number, number]` assertions
- Verified all auth flows in browser: new user signup, existing user signin, invalid password

Stage Summary:
- Root cause: Three interlocking bugs (empty handleAuthSuccess, no session refresh, isLanding condition)
- Fix: Added getSession() call after auth success, fixed isLanding condition, added refetchInterval
- Premium auth experience: 560px card, larger inputs/buttons/typography, better spacing
- Navigation animation: AnimatePresence with scale+fade transitions between views
- All auth paths verified: new user, existing user, invalid password
- Lint: 0 errors, 1 pre-existing warning
- TypeScript: 0 errors in changed files
