import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  reactStrictMode: false,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "api.damakaryamakmur.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "damakarya.hakimasrori.site",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "damakarya.hakimasrori.site",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "encrypted-tbn0.gstatic.com",
        port: "",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
