import React from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { Camera, CheckCircle2, LockKeyhole, Sparkles } from "lucide-react";
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
    <div className="relative grid min-h-screen place-items-center overflow-hidden p-4">
      <div className="absolute left-[-8%] top-[-12%] h-80 w-80 rounded-full bg-sky-300/30 blur-3xl" />
      <div className="absolute bottom-[-12%] right-[-8%] h-96 w-96 rounded-full bg-fuchsia-300/30 blur-3xl" />

      <div className="relative z-10 grid w-full max-w-5xl overflow-hidden rounded-[34px] border border-white/80 bg-white/70 shadow-card backdrop-blur-2xl lg:grid-cols-[1.05fr_.95fr]">
        <section className="hidden bg-gradient-to-br from-sky-400 via-blue-600 to-violet-700 p-9 text-white lg:block">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/18 px-4 py-2 text-sm font-bold">
            <Sparkles size={17} /> EdTech SaaS Dashboard
          </div>
          <h1 className="mt-8 text-5xl font-black leading-tight text-white">SMART SCHOOL AI</h1>
          <div className="mt-10 grid gap-3">
            {["Điểm danh AI theo lớp", "Bảng điểm theo môn", "Bài tập, kiểm tra và thông báo"].map((item) => (
              <div key={item} className="flex items-center gap-3 rounded-2xl bg-white/16 p-3 font-bold">
                <CheckCircle2 size={20} /> {item}
              </div>
            ))}
          </div>
        </section>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 sm:p-9">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-3xl bg-gradient-to-br from-sky-400 via-blue-600 to-emerald-400 text-white shadow-neon">
              <Camera />
            </div>
            <h2 className="text-3xl font-black text-slate-950">Đăng nhập</h2>
          </div>

          <label className="mb-4 block text-sm font-black text-slate-700">
            Email
            <input className="input mt-2" {...register("email", { required: true })} />
          </label>
          <label className="mb-6 block text-sm font-black text-slate-700">
            Mật khẩu
            <input type="password" className="input mt-2" {...register("password", { required: true })} />
          </label>

          <button className="btn-primary w-full py-3">
            <LockKeyhole size={18} /> Đăng nhập
          </button>

          <div className="mt-5 flex justify-between text-sm font-bold text-slate-500">
            <Link to="/register" className="transition hover:text-ocean">Tạo tài khoản</Link>
            <Link to="/forgot-password" className="transition hover:text-ocean">Quên mật khẩu</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
