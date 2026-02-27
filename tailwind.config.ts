import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "neon-blue": "#00f3ff",
        "deep-space": "#030508",
        "glass-panel": "rgba(10, 15, 20, 0.70)",
      },
    },
  },
  plugins: [],
};

export default config;
