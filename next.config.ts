import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/tiles/:path*",
        destination: `${process.env.TILE_SERVER_URL}/:path*`,
      },
    ]
  },
};

export default withNextIntl(nextConfig);
