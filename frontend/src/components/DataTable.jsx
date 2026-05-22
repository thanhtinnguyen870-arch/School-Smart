import React, { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";

const valueByPath = (row, key) => {
  if (!key) return "";
  return key.split(".").reduce((value, part) => value?.[part], row) ?? "";
};

export default function DataTable({ columns, data = [], searchKey, filters, actions, searchPlaceholder = "Tìm kiếm..." }) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 8;

  const filtered = useMemo(() => {
    const query = search.toLowerCase();
    return data.filter((row) => {
      const primary = valueByPath(row, searchKey);
      const fallback = row.fullName || row.title || row.subject || row.studentId?.fullName || "";
      return !query || String(primary || fallback).toLowerCase().includes(query);
    });
  }, [data, search, searchKey]);

  const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const rows = filtered.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="soft-panel overflow-hidden p-4">
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <label className="relative w-full max-w-sm">
          <Search className="pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2 text-slate-400" size={18} />
          <input
            className="input"
            style={{ paddingLeft: 46 }}
            placeholder={searchPlaceholder}
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
          />
        </label>
        {filters && <div className="flex flex-wrap gap-2">{filters}</div>}
      </div>

      <div className="overflow-x-auto rounded-[20px] border border-slate-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-gradient-to-r from-sky-50 via-indigo-50 to-fuchsia-50 text-slate-700">
            <tr>
              {columns.map((column) => (
                <th key={column.key} className="border-b border-slate-200 px-4 py-3.5 font-black">
                  {column.label}
                </th>
              ))}
              {actions && <th className="border-b border-slate-200 px-4 py-3.5 font-black">Thao tác</th>}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row._id || row.id} className="border-b border-slate-100 transition duration-200 last:border-b-0 hover:bg-sky-50/80">
                {columns.map((column) => (
                  <td key={column.key} className="px-4 py-3.5 font-medium text-slate-700">
                    {column.render ? column.render(row) : valueByPath(row, column.key)}
                  </td>
                ))}
                {actions && <td className="px-4 py-3.5">{actions(row)}</td>}
              </tr>
            ))}
            {!rows.length && (
              <tr>
                <td colSpan={columns.length + (actions ? 1 : 0)} className="py-12 text-center text-sm font-bold text-slate-500">
                  Chưa có dữ liệu
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex flex-col gap-3 text-sm font-semibold text-slate-500 sm:flex-row sm:items-center sm:justify-between">
        <span>{filtered.length} bản ghi</span>
        <div className="flex items-center gap-2">
          <button className="action-button px-3 py-2 disabled:opacity-40" disabled={page === 1} onClick={() => setPage(page - 1)}>
            <ChevronLeft size={16} /> Trước
          </button>
          <span className="rounded-2xl bg-gradient-to-br from-sky-100 to-indigo-100 px-4 py-2 font-black text-ocean">{page}/{pages}</span>
          <button className="action-button px-3 py-2 disabled:opacity-40" disabled={page === pages} onClick={() => setPage(page + 1)}>
            Sau <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
