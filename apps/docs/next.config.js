const withMDX = require("@next/mdx")();

/** @type {import('next').NextConfig} */
module.exports = withMDX({
  reactStrictMode: true,
  transpilePackages: ["@radri/ui"],
  pageExtensions: ["js", "jsx", "mdx", "ts", "tsx"],
});
