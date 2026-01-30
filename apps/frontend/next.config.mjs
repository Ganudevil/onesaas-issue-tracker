/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: false,
    eslint: {
        ignoreDuringBuilds: true,
    },
    typescript: {
        ignoreBuildErrors: true,
    },
    optimizeFonts: false,
    env: {
        NEXT_PUBLIC_NOVU_APP_ID: process.env.NEXT_PUBLIC_NOVU_APP_ID,
    },
    async rewrites() {
        // Only apply rewrites in development to avoid localhost URLs in production
        if (process.env.NODE_ENV === 'development') {
            return [
                {
                    source: '/api/:path*',
                    destination: 'http://localhost:3002/:path*',
                },
            ]
        }
        return []
    },
};

export default nextConfig;
