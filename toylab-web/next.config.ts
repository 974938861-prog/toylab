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
    // API 与上传由 toylab-service 提供，需先启动 service（默认 8001）
    const apiOrigin = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_UPLOAD_ORIGIN || "http://localhost:8001";
    return [
      { source: "/api/:path*", destination: `${apiOrigin}/api/:path*` },
      { source: "/uploads/:path*", destination: `${apiOrigin}/uploads/:path*` },
    ];
  },
};

export default nextConfig;
