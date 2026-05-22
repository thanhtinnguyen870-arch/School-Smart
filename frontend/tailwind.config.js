export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: { sans: ["Inter", "Be Vietnam Pro", "Poppins", "sans-serif"] },
      colors: {
        ink: "#0F172A",
        panel: "#FFFFFF",
        sidebar: "#F8FAFC",
        cyan: { DEFAULT: "#38BDF8", 50: "#F0F9FF", 100: "#E0F2FE", 300: "#7DD3FC", 400: "#38BDF8", 500: "#0EA5E9", 600: "#0284C7", 700: "#0369A1" },
        violet: { DEFAULT: "#7C3AED", 50: "#F5F3FF", 100: "#EDE9FE", 300: "#C4B5FD", 400: "#A78BFA", 500: "#8B5CF6", 600: "#7C3AED", 700: "#6D28D9" },
        mint: { DEFAULT: "#22C55E", 50: "#F0FDF4", 100: "#DCFCE7", 300: "#86EFAC", 400: "#4ADE80", 500: "#22C55E", 600: "#16A34A", 700: "#15803D" },
        amber: { DEFAULT: "#FACC15", 50: "#FFFBEB", 100: "#FEF3C7", 300: "#FDE68A", 400: "#FBBF24", 500: "#F59E0B", 600: "#D97706", 700: "#B45309" },
        rose: { DEFAULT: "#EC4899", 50: "#FFF1F2", 100: "#FFE4E6", 300: "#FDA4AF", 400: "#FB7185", 500: "#F43F5E", 600: "#E11D48", 700: "#BE123C" },
        ocean: "#2563EB",
        leaf: "#14B8A6",
        orchid: "#A855F7",
        muted: "#64748B",
        canvas: "#F8FAFC",
        lavender: "#EEF2FF",
        blush: "#FDF4FF"
      },
      boxShadow: {
        neon: "0 18px 46px rgba(37, 99, 235, .22)",
        violet: "0 18px 48px rgba(124, 58, 237, .2)",
        soft: "0 18px 50px rgba(15, 23, 42, .10)",
        glow: "0 22px 60px rgba(56, 189, 248, .24)",
        card: "0 16px 42px rgba(15, 23, 42, .08)"
      }
    }
  },
  plugins: []
};
