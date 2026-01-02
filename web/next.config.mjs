/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  // Ensure environment variables are properly loaded
  env: {
    // Explicitly expose NEXT_PUBLIC_ variables (though they should work automatically)
    // This helps with some edge cases in Next.js
  },
};

export default nextConfig;

