const withMDX = require("@next/mdx")();

/** @type {import('next').NextConfig} */
module.exports = withMDX({
  reactStrictMode: true,
  transpilePackages: ["@radri/ui"],
  pageExtensions: ["js", "jsx", "md", "mdx", "ts", "tsx"],
  webpack: (config) => {
    // Add raw-loader for raw file imports
    config.module.rules.push({
      test: /\.tsx$/, // Matches any file with 'example' in its name
      resourceQuery: /inline/,
      use: "raw-loader",
    });

    return config;
  },
});
