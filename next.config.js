const { randomUUID } = require("node:crypto");
const { execFileSync } = require("node:child_process");
const buildId = randomUUID();
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  generateBuildId: async () => buildId,
  compiler: {
    runAfterProductionCompile: async ({ projectDir }) => {
      // Vercel packages outputs before npm postbuild. Generate the public worker
      // from this compilation, with the same ID returned to Next, before packaging.
      execFileSync(process.execPath, ["scripts/build-offline.cjs", buildId], {
        cwd: projectDir,
        stdio: "inherit",
      });
    },
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value:
              "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self'; connect-src 'self'; worker-src 'self' blob:; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'",
          },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
      {
        source: "/sw.js",
        headers: [{ key: "Cache-Control", value: "no-cache" }],
      },
    ];
  },
};

module.exports = nextConfig;
