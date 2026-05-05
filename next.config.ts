import type { NextConfig } from "next";

const API_ORIGIN = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://waqty.alemtayaz.shop/public/api';

const nextConfig: NextConfig = {
    images: {
        formats: ['image/avif', 'image/webp'],
        deviceSizes: [640, 750, 828, 1080, 1200, 1920],
        imageSizes: [16, 32, 48, 64, 96, 128, 256],
        minimumCacheTTL: 60 * 60 * 24 * 30,
    },
    async rewrites() {
        return [
            {
                // Proxy /api-proxy/:path* → <API_ORIGIN>/:path*
                // This avoids CORS since the request goes server → server
                source: '/api-proxy/:path*',
                destination: `${API_ORIGIN}/:path*`,
            },
        ];
    },
};

export default nextConfig;
