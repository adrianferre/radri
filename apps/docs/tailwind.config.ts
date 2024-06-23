import type { Config } from "tailwindcss";
import sharedConfig from "@radri/tailwind-config";

const config: Pick<Config, "content" | "presets" | "theme"> = {
  content: ["./mdx-components.tsx", "./src/app/**/*.{tsx,mdx}"],
  presets: [sharedConfig],
  theme: {
    extend: {
      fontFamily: {
        inter: ["var(--font-inter)"],
        "fira-code": ["var(--font-fira-code)"],
      },
    },
  },
};

export default config;
