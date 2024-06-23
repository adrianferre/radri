import type { Config } from "tailwindcss";
import sharedConfig from "@radri/tailwind-config";

const config: Pick<Config, "prefix" | "presets" | "content"> = {
  content: ["./src/**/*.tsx"],
  prefix: "ui-",
  presets: [sharedConfig],
};

// eslint-disable-next-line import/no-default-export -- This is required in Tailwind Config to work
export default config;
