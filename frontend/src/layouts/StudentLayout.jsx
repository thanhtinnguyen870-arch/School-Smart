import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";

export default function StudentLayout() {
  return (
    <div className="min-h-screen bg-ink">
      <Sidebar role="student" />
      <main className="lg:pl-72">
        <Topbar />
        <div className="p-4 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
