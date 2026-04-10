import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        surface: "#f8fafc",
        ink: "#0f172a",
        muted: "#64748b",
        line: "#e2e8f0",
        accent: "#0f766e",
      },
      boxShadow: {
        card: "0 20px 45px -25px rgba(15, 23, 42, 0.18)",
      },
      backgroundImage: {
        "page-glow":
          "radial-gradient(circle at top left, rgba(15,118,110,0.12), transparent 32%), radial-gradient(circle at top right, rgba(14,165,233,0.12), transparent 28%)",
      },
    },
  },
  plugins: [],
};

export default config;
