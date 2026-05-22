import React, { useEffect, useState } from "react";
import { Eye, FileText, Image } from "lucide-react";
import axiosClient from "../../api/axiosClient";
import DataTable from "../../components/DataTable";
import Modal from "../../components/Modal";

const API_ORIGIN = (import.meta.env.VITE_API_URL || "http://localhost:5000/api").replace(/\/api\/?$/, "");

const formatDateTime = (value) =>
  value
    ? new Intl.DateTimeFormat("vi-VN", {
        dateStyle: "short",
        timeStyle: "short",
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
      <h1 className="text-2xl font-black">Thông báo</h1>
      <DataTable
        data={rows}
        searchKey="title"
        columns={[
          { key: "title", label: "Tiêu đề" },
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
            ) : "-",
          },
        ]}
        actions={(row) => (
          <button className="inline-flex items-center gap-1 text-cyan" onClick={() => openNotification(row)}>
            <Eye size={15} /> Xem
          </button>
        )}
      />

      <Modal open={Boolean(selected)} title={selected?.title || "Chi tiết thông báo"} onClose={() => setSelected(null)}>
        {selected && (
          <div className="space-y-4 text-sm text-slate-300">
            <div className="grid gap-2 rounded-lg border border-slate-800 bg-slate-950/50 p-3">
              <p><span className="text-slate-500">Ngày giờ:</span> {formatDateTime(selected.createdAt)}</p>
              <p><span className="text-slate-500">Người đăng:</span> {selected.createdBy?.name || "-"}</p>
            </div>
            <p className="whitespace-pre-line leading-7">{selected.content}</p>
            {selected.attachmentUrl && (
              <div className="rounded-lg border border-slate-800 bg-slate-950/50 p-3">
                {isImageAttachment(selected) ? (
                  <img src={attachmentUrl(selected)} alt={selected.attachmentName || selected.title} className="max-h-[420px] w-full rounded-lg object-contain" />
                ) : (
                  <a className="inline-flex items-center gap-2 text-cyan" href={attachmentUrl(selected)} target="_blank" rel="noreferrer">
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
