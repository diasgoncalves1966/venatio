import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@venatio/shared'],
  // Allow opening the Next.js dev server from the LAN IP on phones/tablets
  allowedDevOrigins: ['192.168.0.109', '192.168.1.81', '127.0.0.1', 'localhost'],
};

export default nextConfig;
