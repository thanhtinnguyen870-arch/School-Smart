import React from "react";
import { motion } from "framer-motion";

const tones = {
  cyan: "from-sky-400 via-blue-500 to-indigo-600",
  violet: "from-violet-500 via-fuchsia-500 to-pink-500",
  mint: "from-emerald-400 via-teal-500 to-cyan-500",
  amber: "from-orange-400 via-amber-400 to-yellow-300",
  rose: "from-pink-500 via-rose-500 to-orange-400"
};

export default function StatCard({ title, value, icon: Icon, tone = "cyan" }) {
  const gradient = tones[tone] || tones.cyan;

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -6, scale: 1.01 }}
      className={`relative overflow-hidden rounded-[26px] bg-gradient-to-br ${gradient} p-5 text-white shadow-neon`}
    >
      <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-white/18" />
      <div className="absolute -bottom-10 right-10 h-24 w-24 rounded-full bg-white/10" />
      {Icon && <Icon className="absolute bottom-4 right-4 text-white/18" size={74} />}

      <div className="relative z-10 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-bold text-white/86">{title}</p>
          <p className="mt-3 text-4xl font-black tracking-normal text-white">{value}</p>
        </div>
        {Icon && (
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-white/20 shadow-lg backdrop-blur">
            <Icon size={23} />
          </div>
        )}
      </div>
    </motion.div>
  );
}
