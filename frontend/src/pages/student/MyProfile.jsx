import React, { useState } from "react";
import { toast } from "react-toastify";
import axiosClient from "../../api/axiosClient";
import { useAuthStore } from "../../store/authStore";

export default function MyProfile() {
  const user = useAuthStore((state) => state.user);
  const fetchMe = useAuthStore((state) => state.fetchMe);
  const [saving, setSaving] = useState(false);

  const updatePassword = async (event) => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.currentTarget));

    if (data.newPassword !== data.confirmPassword) {
      toast.warning("Mật khẩu xác nhận không khớp.");
      return;
    }

    try {
      setSaving(true);
      await axiosClient.put("/auth/profile", {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword
      });
      await fetchMe();
      event.currentTarget.reset();
      toast.success("Đã cập nhật mật khẩu mới.");
    } catch (error) {
      toast.error(error.message || "Không thể đổi mật khẩu.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="grid gap-5 xl:grid-cols-[.9fr_1.1fr]">
      <div className="card">
        <h1 className="text-2xl font-black text-slate-950">Thông tin cá nhân</h1>
        <div className="mt-5 grid gap-3 font-semibold text-slate-700">
          <p><span className="font-black text-slate-900">Họ tên:</span> {user?.name}</p>
          <p><span className="font-black text-slate-900">Email:</span> {user?.email}</p>
          <p><span className="font-black text-slate-900">Vai trò:</span> Học sinh</p>
        </div>
      </div>

      <form onSubmit={updatePassword} className="card grid gap-3">
        <div>
          <h2 className="text-xl font-black text-slate-950">Đổi mật khẩu</h2>
        </div>

        <label className="grid gap-2 text-sm font-black text-slate-700">
          Mật khẩu hiện tại
          <input name="currentPassword" type="password" className="input" placeholder="Nhập mật khẩu hiện tại" required />
        </label>

        <label className="grid gap-2 text-sm font-black text-slate-700">
          Mật khẩu mới
          <input name="newPassword" type="password" minLength={6} className="input" placeholder="Tối thiểu 6 ký tự" required />
        </label>

        <label className="grid gap-2 text-sm font-black text-slate-700">
          Xác nhận mật khẩu mới
          <input name="confirmPassword" type="password" minLength={6} className="input" placeholder="Nhập lại mật khẩu mới" required />
        </label>

        <button className="btn-primary" disabled={saving}>
          {saving ? "Đang lưu..." : "Cập nhật mật khẩu"}
        </button>
      </form>
    </div>
  );
}
