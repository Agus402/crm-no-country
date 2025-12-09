import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  reactStrictMode: true,
  // Configuración de Turbopack para Next.js 16
  turbopack: {},
};

export default nextConfig;
