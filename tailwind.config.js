/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
        mono: ["JetBrains Mono", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      colors: {
        ink: {
          950: "#07080b",
          900: "#0b0d12",
          800: "#11141b",
          700: "#171b24",
          600: "#1f242f",
          500: "#2a3140",
        },
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(34,211,238,0.18), 0 8px 30px -10px rgba(34,211,238,0.25)",
        card: "0 1px 0 0 rgba(255,255,255,0.04) inset, 0 8px 30px -12px rgba(0,0,0,0.6)",
      },
      backgroundImage: {
        "grid-fade":
          "radial-gradient(circle at 50% 0%, rgba(34,211,238,0.10), transparent 60%), radial-gradient(circle at 100% 100%, rgba(168,85,247,0.08), transparent 60%)",
      },
      keyframes: {
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        pulseSoft: {
          "0%, 100%": { opacity: "0.6" },
          "50%": { opacity: "1" },
        },
      },
      animation: {
        shimmer: "shimmer 2.5s linear infinite",
        pulseSoft: "pulseSoft 2.4s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
