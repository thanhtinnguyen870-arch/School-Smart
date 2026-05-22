import React from "react";
import { Link } from "react-router-dom";

export default function StudentForm() {
  return (
    <div className="card">
      <h1 className="text-2xl font-black">Học sinh</h1>
      <Link to="/admin/students" className="btn-primary mt-5">Mở quản lý học sinh</Link>
    </div>
  );
}
