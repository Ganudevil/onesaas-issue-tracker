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
    async headers() {
        return [
            {
                source: '/:path*',
                headers: [
                    {
                        key: 'Content-Security-Policy',
                        value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://*.novu.co; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: https://*.novu.co https://avatars.githubusercontent.com; connect-src 'self' https://api.novu.co https://ws.novu.co wss://ws.novu.co https://*.novu.co;"
                    }
                ],
            },
        ];
    },
};

export default nextConfig;
