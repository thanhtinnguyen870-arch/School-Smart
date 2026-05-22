import React from "react";
import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./routes/AppRoutes.jsx";

export default function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AppRoutes />
    </BrowserRouter>
  );
}
