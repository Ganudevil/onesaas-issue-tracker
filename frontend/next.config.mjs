/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: false,
    async rewrites() {
        return [
            {
                source: '/api/:path*',
                destination: 'http://localhost:3001/:path*',
            },
        ]
    },
};

export default nextConfig;
