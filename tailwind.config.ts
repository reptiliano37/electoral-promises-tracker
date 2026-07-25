import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Estados de cumplimiento (neutrales, no partidistas)
        status: {
          none: "#6b7280",
          progress: "#2563eb",
          partial: "#d97706",
          fulfilled: "#16a34a",
          broken: "#dc2626",
          unverifiable: "#7c3aed",
        },
      },
    },
  },
  plugins: [],
};

export default config;
