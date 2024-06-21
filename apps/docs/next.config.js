const withMDX = require("@next/mdx")();

/** @type {import('next').NextConfig} */
module.exports = withMDX({
  reactStrictMode: true,
  transpilePackages: ["@repo/ui"],
  pageExtensions: ["js", "jsx", "mdx", "ts", "tsx"],
});
