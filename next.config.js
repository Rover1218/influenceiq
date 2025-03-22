/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    swcMinify: true,
    images: {
        domains: ['static.vecteezy.com', 'cdn.jsdelivr.net', 'fa-cdn.fontawesome.com'],
    },
    // Enable experimental features if needed
    experimental: {
        serverActions: true,
    }
}

module.exports = nextConfig
