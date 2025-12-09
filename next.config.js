/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    swcMinify: true,
    images: {
        domains: ['static.vecteezy.com', 'cdn.jsdelivr.net', 'fa-cdn.fontawesome.com'],
    },
}

module.exports = nextConfig
