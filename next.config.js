/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["mlpgrevfohpiaepnnsch.supabase.co"], // Add your Supabase storage domain here
    remotePatterns: [
      {
        protocol: "https",
        hostname: "mlpgrevfohpiaepnnsch.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
  reactStrictMode: true, // Enable strict mode
};

module.exports = nextConfig;
