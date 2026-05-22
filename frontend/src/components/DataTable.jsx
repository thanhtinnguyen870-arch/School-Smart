import React, { useMemo, useState } from "react";

export default function DataTable({ columns, data = [], searchKey, filters, actions }) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 8;

  const filtered = useMemo(() => {
    const query = search.toLowerCase();
    return data.filter((row) => !query || String(row[searchKey] || row.fullName || row.title || "").toLowerCase().includes(query));
  }, [data, search, searchKey]);

  const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const rows = filtered.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="card overflow-hidden">
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <input
          className="input max-w-sm"
          placeholder="Tìm kiếm..."
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            setPage(1);
          }}
        />
        {filters}
      </div>

      <div className="overflow-x-auto rounded-lg border border-white/10">
        <table className="w-full text-left text-sm">
          <thead className="bg-white/[0.035] text-slate-300">
            <tr>
              {columns.map((column) => (
                <th key={column.key} className="border-b border-white/10 px-3 py-3 font-semibold">
                  {column.label}
                </th>
              ))}
              {actions && <th className="border-b border-white/10 px-3 py-3 font-semibold">Thao tác</th>}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row._id || row.id} className="border-b border-white/10 transition last:border-b-0 hover:bg-cyan/5">
                {columns.map((column) => (
                  <td key={column.key} className="px-3 py-3 text-slate-200">
                    {column.render ? column.render(row) : row[column.key]}
                  </td>
                ))}
                {actions && <td className="px-3 py-3">{actions(row)}</td>}
              </tr>
            ))}
            {!rows.length && (
              <tr>
                <td colSpan={columns.length + 1} className="py-12 text-center text-slate-500">
                  Không có dữ liệu
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex items-center justify-between text-sm text-slate-400">
        <span>{filtered.length} bản ghi</span>
        <div className="flex items-center gap-2">
          <button className="rounded-lg border border-white/10 px-3 py-1.5 transition hover:border-cyan/40 hover:text-cyan disabled:opacity-40" disabled={page === 1} onClick={() => setPage(page - 1)}>
            Trước
          </button>
          <span className="rounded-lg bg-white/[0.045] px-3 py-1.5 text-slate-300">{page}/{pages}</span>
          <button className="rounded-lg border border-white/10 px-3 py-1.5 transition hover:border-cyan/40 hover:text-cyan disabled:opacity-40" disabled={page === pages} onClick={() => setPage(page + 1)}>
            Sau
          </button>
        </div>
      </div>
    </div>
  );
}
