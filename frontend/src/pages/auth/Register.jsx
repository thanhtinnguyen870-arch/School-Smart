import React from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuthStore } from "../../store/authStore";

export default function Register() {
  const { register, handleSubmit } = useForm({ defaultValues: { role: "student" } });
  const signup = useAuthStore((s) => s.register);
  const navigate = useNavigate();
  const onSubmit = async (values) => {
    try {
      const user = await signup(values);
      toast.success("Tạo tài khoản thành công");
      navigate(user.role === "student" ? "/student/dashboard" : "/admin/dashboard");
    } catch (error) {
      toast.error(error.message || "Đăng ký thất bại");
    }
  };
  return (
    <div className="grid min-h-screen place-items-center bg-ink p-4">
      <form onSubmit={handleSubmit(onSubmit)} className="glass w-full max-w-lg rounded-2xl p-8">
        <h1 className="mb-6 text-2xl font-bold">Đăng ký</h1>
        <div className="grid gap-4">
          <input className="input" placeholder="Họ tên" {...register("name", { required: true })} />
          <input className="input" placeholder="Email" {...register("email", { required: true })} />
          <input type="password" className="input" placeholder="Mật khẩu" {...register("password", { required: true })} />
          <select className="input" {...register("role")}><option value="student">Student</option><option value="parent">Parent</option><option value="teacher">Teacher</option></select>
          <button className="btn-primary">Tạo tài khoản</button>
        </div>
      </form>
    </div>
  );
}
