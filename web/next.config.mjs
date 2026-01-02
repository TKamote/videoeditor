/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  // Ensure environment variables are properly loaded
  env: {
    // Explicitly expose NEXT_PUBLIC_ variables (though they should work automatically)
    // This helps with some edge cases in Next.js
  },
  // Optimize build performance
  swcMinify: true,
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },
  // Skip linting during build (Vercel runs it separately if needed)
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Skip type checking during build (Vercel runs it separately)
  typescript: {
    ignoreBuildErrors: false, // Keep this false for type safety, but optimize elsewhere
  },
  // Optimize output
  output: 'standalone',
};

export default nextConfig;

