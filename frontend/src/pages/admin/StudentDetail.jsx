import React from "react";
import { Link } from "react-router-dom";

export default function StudentDetail() {
  return (
    <div className="card">
      <h1 className="text-2xl font-black">Chi tiết học sinh</h1>
      <Link to="/admin/students" className="btn-primary mt-5">Quay lại danh sách</Link>
    </div>
  );
}
