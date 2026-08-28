import type { NextConfig } from 'next';
import { createMDX } from 'fumadocs-mdx/next';

const withMDX = createMDX();

const config: NextConfig = {
  reactStrictMode: true,
  output: 'export',
  // Cloudflare Pages is configured to publish the `dist` directory.
  distDir: 'dist',
};

export default withMDX(config);
