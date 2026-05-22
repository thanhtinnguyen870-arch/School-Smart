import React from "react";
import { motion } from "framer-motion";

export default function StatCard({ title, value, icon: Icon, tone = "cyan", subtitle }) {
  const colors = {
    cyan: "text-cyan bg-cyan/10 ring-cyan/20",
    violet: "text-violet bg-violet/10 ring-violet/20",
    mint: "text-mint bg-mint/10 ring-mint/20",
    amber: "text-amber bg-amber/10 ring-amber/20",
    rose: "text-rose bg-rose/10 ring-rose/20",
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card">
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-400">{title}</p>
          <p className="mt-2 text-3xl font-black text-white">{value}</p>
          {subtitle && <p className="mt-1 text-xs text-slate-500">{subtitle}</p>}
        </div>
        {Icon && (
          <div className={`grid h-12 w-12 shrink-0 place-items-center rounded-lg ring-1 ${colors[tone] || colors.cyan}`}>
            <Icon size={22} />
          </div>
        )}
      </div>
    </motion.div>
  );
}
