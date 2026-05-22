import React, { useEffect, useState } from "react";
import { Bell, ShieldCheck } from "lucide-react";
import { useAuthStore } from "../store/authStore";

export default function Topbar() {
  const user = useAuthStore((state) => state.user);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between border-b border-white/10 bg-ink/78 px-4 py-3 backdrop-blur-xl lg:px-8">
      <div>
        <h1 className="text-lg font-black text-white lg:text-xl">SMART SCHOOL AI</h1>
        <p className="text-xs text-slate-400">Bảng điều khiển quản lý học sinh</p>
      </div>

      <div className="hidden rounded-lg border border-cyan/25 bg-cyan/10 px-5 py-2 font-mono text-lg font-bold text-cyan md:block">
        {now.toLocaleTimeString("vi-VN")}
      </div>

      <div className="flex items-center gap-3">
        <button className="grid h-10 w-10 place-items-center rounded-lg border border-white/10 bg-white/[0.045] text-slate-300 transition hover:border-cyan/40 hover:text-cyan">
          <Bell size={18} />
        </button>
        <div className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/[0.045] px-3 py-2">
          <span className="grid h-9 w-9 place-items-center rounded-md bg-mint/10 text-mint">
            <ShieldCheck size={18} />
          </span>
          <div className="text-right">
            <p className="text-sm font-semibold text-white">{user?.name || "Guest"}</p>
            <p className="text-xs capitalize text-slate-400">{user?.role || "offline"}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
