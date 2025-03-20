/** @type {import('next').NextConfig} */
const nextConfig = {
  // output: 'export',

  // Optional: Change links `/me` -> `/me/` and emit `/me.html` -> `/me/index.html`
  // trailingSlash: true,

  // Optional: Prevent automatic `/me` -> `/me/`, instead preserve `href`
  // skipTrailingSlashRedirect: true,

  // Optional: Change the output directory `out` -> `dist`
  // distDir: 'dist',
  images: {
    domains: [
      "20250329-aws-educate-taylor-swift-workshop.s3.ap-northeast-1.amazonaws.com",
      "example.com"
    ],
  },
};

module.exports = nextConfig;
