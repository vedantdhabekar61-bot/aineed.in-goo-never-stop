/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    // Ensure API_KEY is available server-side
    API_KEY: process.env.API_KEY,
  },
};

export default nextConfig;