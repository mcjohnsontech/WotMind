import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep Node.js-only packages out of the browser bundle.
  // twilio uses several Node.js built-ins (crypto, https, etc.) that don't
  // exist in the edge/browser environment Next.js may try to bundle for.
  serverExternalPackages: ['twilio'],
};

export default nextConfig;
