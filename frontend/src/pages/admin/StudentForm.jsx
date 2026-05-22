import React from "react";
import { Link } from "react-router-dom";

export default function StudentForm() {
  return (
    <div className="card">
      <h1 className="text-2xl font-black">Thêm học sinh</h1>
      <p className="mt-3 text-slate-400">Biểu mẫu thêm và sửa học sinh đã được gom vào modal trong màn Quản lý học sinh để thao tác nhanh hơn.</p>
      <Link to="/admin/students" className="btn-primary mt-5">Mở quản lý học sinh</Link>
    </div>
  );
}
