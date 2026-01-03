import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Ensure webpack is used (Turbopack is unstable in this repo)
  experimental: {
    serverActions: {
      // keep default behavior
    },
    // The type definitions for Next 16 don't include a direct toggle,
    // so we rely on env NEXT_DISABLE_TURBOPACK plus dev flags.
  },
};

export default nextConfig;
