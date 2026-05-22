import React from "react";
import { X } from "lucide-react";

export default function Modal({ open, title, children, onClose }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/35 p-4 backdrop-blur-sm">
      <div className="glass w-full max-w-2xl overflow-hidden rounded-[28px]">
        <div className="flex items-center justify-between border-b border-slate-200/70 bg-gradient-to-r from-sky-50 via-white to-fuchsia-50 p-5">
          <h2 className="text-lg font-black text-slate-950">{title}</h2>
          <button onClick={onClose} className="grid h-10 w-10 place-items-center rounded-2xl bg-white text-slate-500 shadow-sm transition hover:bg-rose-500 hover:text-white"><X size={18} /></button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}
