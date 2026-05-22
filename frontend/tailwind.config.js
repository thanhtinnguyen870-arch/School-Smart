export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: { sans: ["Inter", "sans-serif"] },
      colors: {
        ink: "#08111F",
        panel: "#101B2D",
        sidebar: "#07101D",
        cyan: "#22D3EE",
        violet: "#A78BFA",
        mint: "#34D399",
        amber: "#FBBF24",
        rose: "#FB7185",
        ocean: "#2563EB",
        leaf: "#10B981",
        orchid: "#C084FC"
      },
      boxShadow: {
        neon: "0 14px 44px rgba(34,211,238,.18)",
        violet: "0 16px 46px rgba(167,139,250,.18)",
        soft: "0 18px 50px rgba(0,0,0,.26)"
      }
    }
  },
  plugins: []
};
