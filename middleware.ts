import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher([
  "/feed(.*)",
  "/network(.*)",
  "/messages(.*)",
  "/notifications(.*)",
  "/matches(.*)",
  "/fundraising(.*)",
  "/jobs(.*)",
  "/settings(.*)",
  "/startup(.*)",
  "/investor/dashboard(.*)",
  "/investor/watchlist(.*)",
  "/investor/dealflow(.*)",
  "/admin(.*)"
]);

export default clerkMiddleware(async (auth, request) => {
  if (!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
    return;
  }

  if (isProtectedRoute(request)) {
    await auth.protect();
  }
});

export const config = {
  matcher: ["/((?!_next|[^?]*\\.(?:html?|css|js|jpe?g|webp|png|gif|svg|ico|ttf|woff2?|csv|docx?|xlsx?|zip|webmanifest)).*)", "/(api|trpc)(.*)"]
};
