import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  experimental: {
    serverActions: false, // Ensure it's disabled (only available in React 19)
  },
  images: {
    domains: ["mlpgrevfohpiaepnnsch.supabase.co"], // Add your Supabase storage domain here
    remotePatterns: [
      {
        protocol: "https",
        hostname: "mlpgrevfohpiaepnnsch.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      // Add more patterns if needed
    ],
  },
};

export default nextConfig;
