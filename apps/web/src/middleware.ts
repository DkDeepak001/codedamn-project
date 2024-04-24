import { authMiddleware } from "@clerk/nextjs";


export default authMiddleware({
  publicRoutes: ['/', '/api/user', '/api/playground']
});

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
};
