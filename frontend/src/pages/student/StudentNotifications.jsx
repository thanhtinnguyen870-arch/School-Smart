import React, { useEffect, useState } from "react";
import { FileText, Image } from "lucide-react";
import axiosClient from "../../api/axiosClient";
import DataTable from "../../components/DataTable";
import Modal from "../../components/Modal";

const API_ORIGIN = (import.meta.env.VITE_API_URL || "http://localhost:5000/api").replace(/\/api\/?$/, "");

const formatDateTime = (value) =>
  value
    ? new Intl.DateTimeFormat("vi-VN", {
        dateStyle: "short",
        timeStyle: "short"
      }).format(new Date(value))
    : "-";

const attachmentUrl = (item) => (item?.attachmentUrl ? `${API_ORIGIN}${item.attachmentUrl}` : "");
const isImageAttachment = (item) => item?.attachmentType?.startsWith("image/");

export default function StudentNotifications() {
  const [rows, setRows] = useState([]);
  const [selected, setSelected] = useState(null);

  const load = () => axiosClient.get("/notifications").then((data) => setRows(data || []));

  useEffect(() => {
    load();
  }, []);

  const openNotification = async (row) => {
    setSelected(row);
    if (!row.isRead) {
      const updated = await axiosClient.put(`/notifications/${row._id}/read`);
      setRows((items) => items.map((item) => item._id === row._id ? updated : item));
      setSelected(updated);
    }
  };

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-black text-slate-950">Thông báo</h1>

      <DataTable
        data={rows}
        searchKey="title"
        columns={[
          {
            key: "title",
            label: "Tiêu đề",
            render: (row) => (
              <button
                type="button"
                className={`text-left font-black underline-offset-4 transition hover:text-ocean hover:underline ${row.isRead ? "text-slate-700" : "text-slate-950"}`}
                onClick={() => openNotification(row)}
              >
                {row.title}
              </button>
            )
          },
          { key: "createdBy", label: "Người đăng", render: (row) => row.createdBy?.name || "-" },
          { key: "createdAt", label: "Ngày giờ", render: (row) => formatDateTime(row.createdAt) },
          {
            key: "attachment",
            label: "Đính kèm",
            render: (row) => row.attachmentUrl ? (
              <span className="inline-flex items-center gap-1 text-cyan">
                {isImageAttachment(row) ? <Image size={15} /> : <FileText size={15} />}
                {isImageAttachment(row) ? "Ảnh" : "Công văn"}
              </span>
            ) : "-"
          }
        ]}
      />

      <Modal open={Boolean(selected)} title={selected?.title || "Chi tiết thông báo"} onClose={() => setSelected(null)}>
        {selected && (
          <div className="space-y-4 text-sm font-medium text-slate-700">
            <div className="grid gap-2 rounded-2xl border border-sky-100 bg-sky-50 p-3">
              <p><span className="font-black text-slate-900">Ngày giờ:</span> {formatDateTime(selected.createdAt)}</p>
              <p><span className="font-black text-slate-900">Người đăng:</span> {selected.createdBy?.name || "-"}</p>
            </div>
            <p className="whitespace-pre-line leading-7 text-slate-800">{selected.content}</p>
            {selected.attachmentUrl && (
              <div className="rounded-2xl border border-slate-200 bg-white p-3">
                {isImageAttachment(selected) ? (
                  <img src={attachmentUrl(selected)} alt={selected.attachmentName || selected.title} className="max-h-[420px] w-full rounded-xl object-contain" />
                ) : (
                  <a className="inline-flex items-center gap-2 font-bold text-cyan" href={attachmentUrl(selected)} target="_blank" rel="noreferrer">
                    <FileText size={18} /> Xem công văn: {selected.attachmentName || "Tệp đính kèm"}
                  </a>
                )}
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
