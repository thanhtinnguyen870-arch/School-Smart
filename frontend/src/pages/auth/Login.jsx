import React from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { Camera, LockKeyhole } from "lucide-react";
import { toast } from "react-toastify";
import { useAuthStore } from "../../store/authStore";

export default function Login() {
  const { register, handleSubmit } = useForm({ defaultValues: { email: "admin@gmail.com", password: "123456" } });
  const login = useAuthStore((state) => state.login);
  const navigate = useNavigate();

  const onSubmit = async (values) => {
    try {
      const user = await login(values);
      toast.success("Đăng nhập thành công");
      navigate(user.role === "student" ? "/student/dashboard" : "/admin/dashboard");
    } catch (error) {
      toast.error(error.message || "Đăng nhập thất bại");
    }
  };

  return (
    <div className="grid min-h-screen place-items-center bg-ink p-4">
      <form onSubmit={handleSubmit(onSubmit)} className="glass w-full max-w-md rounded-lg p-8">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-lg bg-gradient-to-br from-blue-600 via-cyan-500 to-emerald-500 shadow-neon">
            <Camera />
          </div>
          <h1 className="text-2xl font-black text-white">SMART SCHOOL AI</h1>
          <p className="mt-2 text-sm text-slate-400">Student Face Attendance Management System</p>
        </div>

        <label className="mb-4 block text-sm font-semibold text-slate-300">
          Email
          <input className="input mt-2" {...register("email", { required: true })} />
        </label>
        <label className="mb-6 block text-sm font-semibold text-slate-300">
          Mật khẩu
          <input type="password" className="input mt-2" {...register("password", { required: true })} />
        </label>

        <button className="btn-primary w-full">
          <LockKeyhole size={18} /> Đăng nhập
        </button>

        <div className="mt-4 flex justify-between text-sm text-slate-400">
          <Link to="/register" className="transition hover:text-cyan">Tạo tài khoản</Link>
          <Link to="/forgot-password" className="transition hover:text-cyan">Quên mật khẩu</Link>
        </div>
      </form>
    </div>
  );
}
