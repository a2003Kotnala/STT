import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/features/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--color-bg)",
        foreground: "var(--color-text)",
        surface: "var(--color-surface)",
        border: "var(--color-border)",
        muted: "var(--color-muted)",
        accent: "var(--color-accent)",
        "accent-strong": "var(--color-accent-strong)",
        "accent-soft": "var(--color-accent-soft)",
        success: "var(--color-success)",
        danger: "var(--color-danger)",
        warning: "var(--color-warning)",
      },
      boxShadow: {
        panel: "0 24px 70px rgba(15, 23, 42, 0.10)",
        float: "0 12px 30px rgba(15, 23, 42, 0.08)",
      },
      borderRadius: {
        "2xl": "1.5rem",
        "3xl": "2rem",
      },
      backgroundImage: {
        "hero-glow":
          "radial-gradient(circle at top left, rgba(24, 174, 167, 0.22), transparent 38%), radial-gradient(circle at top right, rgba(245, 158, 11, 0.14), transparent 24%)",
      },
    },
  },
  plugins: [],
};

export default config;
