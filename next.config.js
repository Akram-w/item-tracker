/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['*.supabase.co'], // Support for Supabase image storage
  },
};

module.exports = nextConfig;