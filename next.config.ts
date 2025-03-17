import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
  /* config options here */
};

export default nextConfig;
// /** @type {import('next').NextConfig} */
// const nextConfig = {
//   images: {
//     domains: ['mlpgrevfohpiaepnnsch.supabase.co'], // Add your Supabase storage domain here
//   },
// }

// module.exports = nextConfig
