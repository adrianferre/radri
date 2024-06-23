const withMDX = require("@next/mdx")();

/** @type {import('next').NextConfig} */
module.exports = withMDX({
  reactStrictMode: true,
  transpilePackages: ["@radri/ui"],
  pageExtensions: ["js", "jsx", "md", "mdx", "ts", "tsx"],
  webpack: (config) => {
    // Add raw-loader for raw file imports
    config.module.rules.push({
      test: /\.txt$/, // You can change this to match the file type you want to import
      use: "raw-loader",
    });

    return config;
  },
});
