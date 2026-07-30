// Debug script: Trace Bug #4 (Auth freeze) through exact code paths.
// Not running the app — this traces the logical flow from source code analysis.

console.log('=== Bug #4: Auth Freeze — Code Path Trace ===\n');

console.log('*** Flow: Landing → Signup → Sign-in → Onboarding → Dashboard ***\n');

console.log('STEP 1: User clicks "Begin your journey" on landing page');
console.log('  → HeroSection.setShowAuth(true)');
console.log('  → AuthExperience renders with SignUpForm\n');

console.log('STEP 2: User completes multi-step sign-up');
console.log('  → SignUpForm.handleStep3Submit() is called');
console.log('  → registerSchema.parse(formData)');
console.log('  → POST /api/auth/register → user created with onboarded=false');
console.log('  → signIn("credentials", ...) → NextAuth JWT callback fires');
console.log('  → JWT callback: db.user.findUnique({ where: { id: user.id }, select: { onboarded: true } })');
console.log('  → dbUser.onboarded = false → token.onboarded = false');
console.log('  → getSession() is called to refresh');
console.log('  → handleSignUpSuccess() → onSuccess() (from AuthExperience props)\n');

console.log('STEP 3: onSuccess chain');
console.log('  → AuthExperience.onSuccess() → calls HeroSection.onAuthSuccess()');
console.log('  → HeroSection.onAuthSuccess is defined in LandingPage.handleAuthSuccess');
console.log('  → LandingPage.handleAuthSuccess: /* Session refresh is handled by the form components via getSession(). */');
console.log('  → THIS IS A NO-OP. Nothing happens.\n');

console.log('STEP 4: What page.tsx sees after sign-up');
console.log('  → useSession() returns { status: "authenticated", data: session }');
console.log('  → session.user.onboarded is set via session callback from token.onboarded');
console.log('  → sessionOnboarded = false (correct)');
console.log('  → needsOnboarding = true (correct, since sessionOnboarded === false)');
console.log('  → isOnboarding = true → OnboardingFlow renders');
console.log('  → BUT: What if there is a race condition?\n');

console.log('KEY QUESTION: Is there a timing gap where page.tsx renders AppShell/Dashboard');
console.log('before the session callback fires?\n');

console.log('Let me trace the exact page.tsx rendering logic:');
console.log('  const isLanding = status === "unauthenticated";');
console.log('  const isOnboarding = !isLanding && needsOnboarding;');
console.log('  const isFocusMode = !isLanding && !isOnboarding && focusMode === "focus";');
console.log('  const isApp = !isLanding && !isOnboarding && !isFocusMode;\n');

console.log('SCENARIO A: Session has onboarded field (via JWT callback)');
console.log('  status = "authenticated" → isLanding = false');
console.log('  sessionOnboarded = false → needsOnboarding = true');
console.log('  → isOnboarding = true, OnboardingFlow renders ✓\n');

console.log('SCENARIO B: Session loaded but JWT callback has not populated onboarded yet');
console.log('  status = "authenticated" → isLanding = false');
console.log('  sessionOnboarded = undefined');
console.log('  needsOnboarding = false (sessionOnboarded is not false, it is undefined)');
console.log('  → isOnboarding = false, isApp = true');
console.log('  → AppShell + DashboardView renders for un-onboarded user!');
console.log('  → Dashboard fetches API data → user has no sessions/missions → empty dashboard');
console.log('  → Then the session callback fires → sessionOnboarded = false');
console.log('  → useSession triggers re-render → needsOnboarding = true');
console.log('  → OnboardingFlow now renders');
console.log('→ BUT: The user sees a flash of empty dashboard. This is the "freeze".\n');

console.log('SCENARIO C: OnboardingResult API check saves the day (sometimes)');
console.log('  The useEffect in page.tsx calls GET /api/onboarding when sessionOnboarded === undefined');
console.log('  This returns { onboarded: false }');
console.log('  Then needsOnboarding = false (waiting for result)');
console.log('  Then after API: needsOnboarding = true');
console.log('  BUT: This is asynchronous. There is a gap.\n');

console.log('THE FIX: In page.tsx, when sessionOnboarded is undefined and status is authenticated,');
console.log('  assume onboarding is needed. The onboarding API check confirms the actual state.');
console.log('  If onboarded === true in the API response, the user will be redirected to dashboard.');
console.log('  This is safe because:');
console.log('    1. New users: onboarded=false → stays on onboarding → correct');
console.log('    2. Returning users: onboarded=true → API returns true → redirects to dashboard → correct');
console.log('    3. No flash of empty dashboard for un-onboarded users.');
