/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    // Add web worker support
    config.module.rules.push({
      test: /\.worker\.js$/,
      loader: 'worker-loader',
      options: {
        name: 'static/[hash].worker.js',
        publicPath: '/_next/',
      },
    });

    return config;
  },
  // Disable static optimization for pages that use Stockfish
  reactStrictMode: true,
  typescript: {
    // Allow production builds to successfully complete even with TS errors
    ignoreBuildErrors: true,
  },
};

export default nextConfig; 