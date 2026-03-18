import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ['@splinetool/react-spline', '@splinetool/runtime'],
  images: {
    domains: ['randomuser.me', 'prod.spline.design', 'images.unsplash.com'],
  },
};

export default nextConfig;
