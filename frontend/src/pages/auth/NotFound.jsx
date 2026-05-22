import React from "react";
import { Link } from "react-router-dom";
export default function NotFound() {
  return <div className="grid min-h-screen place-items-center bg-ink text-center"><div><h1 className="text-6xl font-black text-cyan">404</h1><p className="mt-3 text-slate-400">Không tìm thấy trang</p><Link className="mt-6 inline-block text-cyan" to="/login">Về đăng nhập</Link></div></div>;
}
