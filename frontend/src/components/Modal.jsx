import React from "react";
import { X } from "lucide-react";

export default function Modal({ open, title, children, onClose }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4">
      <div className="glass w-full max-w-2xl rounded-xl">
        <div className="flex items-center justify-between border-b border-slate-800 p-4">
          <h2 className="font-bold">{title}</h2>
          <button onClick={onClose} className="grid h-9 w-9 place-items-center rounded-lg hover:bg-slate-800"><X size={18} /></button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
}
