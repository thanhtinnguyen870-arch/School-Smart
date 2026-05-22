import React from "react";
export default function Loading() {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="h-32 animate-pulse rounded-[24px] bg-gradient-to-br from-white via-sky-50 to-fuchsia-50 shadow-card" />
      ))}
    </div>
  );
}
