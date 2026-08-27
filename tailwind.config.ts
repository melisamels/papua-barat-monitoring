import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        papua: {
          navy: {
            DEFAULT: "#0B2545",
            50: "#EEF4FC",
            100: "#D5E3F8",
            200: "#ACC7F2",
            500: "#134074",
            600: "#0F325C",
            700: "#0B2545",
            800: "#081A32",
            900: "#051121",
          },
          green: {
            DEFAULT: "#1E5E3A",
            50: "#EDF8F2",
            100: "#D3EFE0",
            500: "#2D7A4D",
            600: "#1E5E3A",
            700: "#16472C",
            800: "#0F311F",
          },
          earth: {
            DEFAULT: "#C05621",
            50: "#FEF7EE",
            100: "#FDEED7",
            500: "#D97706",
            600: "#C05621",
            700: "#9C4215",
          },
          status: {
            planning: "#64748B",
            ready: "#2563EB",
            ongoing: "#D97706",
            completed: "#16A34A",
            danger: "#DC2626",
          }
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
