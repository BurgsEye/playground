/** @type {import('next').NextConfig} */
const nextConfig = {
  // Exclude test files from compilation
  webpack: (config) => {
    config.module.rules.push({
      test: /\.(test|spec)\.(ts|tsx|js|jsx)$/,
      loader: 'ignore-loader'
    });
    return config;
  },
  // Exclude test directories
  pageExtensions: ['ts', 'tsx', 'js', 'jsx', 'md', 'mdx'],
  experimental: {
    // Exclude test files from the build
    excludeDefaultMomentLocales: true,
  }
};

export default nextConfig;
