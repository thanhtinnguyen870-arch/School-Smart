import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 700,
    rollupOptions: {
      output: {
        manualChunks: {
          react: ["react", "react-dom", "react-router-dom", "zustand"],
          charts: ["recharts"],
          face: ["face-api.js"],
          vendor: ["axios", "framer-motion", "lucide-react", "react-toastify", "sweetalert2"]
        }
      }
    }
  }
});
