import React from "react";
export default function Loading() {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-32 animate-pulse rounded-xl bg-slate-800/70" />)}
    </div>
  );
}
