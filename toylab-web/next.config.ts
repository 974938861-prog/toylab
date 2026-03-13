import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "placehold.co", pathname: "/**" },
    ],
  },
  async redirects() {
    return [{ source: "/", destination: "/discover", permanent: false }];
  },
  async rewrites() {
    // 封面等上传文件由 service 统一提供（与 API 同源）
    const uploadOrigin = process.env.NEXT_PUBLIC_UPLOAD_ORIGIN || "http://localhost:8001";
    return [
      { source: "/api/:path*", destination: "http://localhost:8001/api/:path*" },
      { source: "/uploads/:path*", destination: `${uploadOrigin}/uploads/:path*` },
    ];
  },
};

export default nextConfig;
