import React, { useEffect, useState } from "react";
import { FileText, Image, Plus, Trash2 } from "lucide-react";
import { toast } from "react-toastify";
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

export default function Notifications() {
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);
  const [preview, setPreview] = useState(null);

  const load = () => axiosClient.get("/notifications").then((rows) => setItems(rows || []));

  useEffect(() => {
    load();
  }, []);

  const save = async (event) => {
    event.preventDefault();
    try {
      await axiosClient.post("/notifications", new FormData(event.currentTarget), {
        headers: { "Content-Type": "multipart/form-data" }
      });
      toast.success("Đã đăng thông báo.");
      setOpen(false);
      await load();
    } catch (error) {
      toast.error(error.message || "Không thể đăng thông báo");
    }
  };

  const remove = async (item) => {
    if (!window.confirm(`Xóa thông báo "${item.title}"?`)) return;

    try {
      await axiosClient.delete(`/notifications/${item._id}`);
      toast.success("Đã xóa thông báo.");
      await load();
    } catch (error) {
      toast.error(error.message || "Không thể xóa thông báo");
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-black text-slate-950">Thông báo</h1>
        <button className="btn-primary" onClick={() => setOpen(true)}>
          <Plus size={18} /> Đăng thông báo
        </button>
      </div>

      <DataTable
        data={items}
        searchKey="title"
        columns={[
          {
            key: "title",
            label: "Tiêu đề",
            render: (row) => (
              <button
                type="button"
                className="text-left font-black text-slate-900 underline-offset-4 transition hover:text-ocean hover:underline"
                onClick={() => setPreview(row)}
              >
                {row.title}
              </button>
            )
          },
          { key: "receiverRole", label: "Người nhận", render: (row) => row.receiverRole === "student" ? "Học sinh" : row.receiverRole || "Tất cả" },
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
        actions={(row) => (
          <button className="inline-flex items-center gap-1 text-rose" title="Xóa thông báo" onClick={() => remove(row)}>
            <Trash2 size={17} /> Xóa
          </button>
        )}
      />

      <Modal open={open} title="Đăng thông báo" onClose={() => setOpen(false)}>
        <form onSubmit={save} className="grid gap-3">
          <input type="hidden" name="receiverRole" value="student" />
          <label className="grid gap-2 text-sm font-black text-slate-700">
            Tiêu đề
            <input name="title" className="input" placeholder="Tiêu đề thông báo" required />
          </label>
          <label className="grid gap-2 text-sm font-black text-slate-700">
            Nội dung
            <textarea name="content" className="input min-h-32" placeholder="Nội dung thông báo" required />
          </label>
          <label className="grid gap-2 text-sm font-black text-slate-700">
            Ảnh thông báo / công văn
            <input type="file" name="file" className="input" accept=".png,.jpg,.jpeg,.webp,.pdf,.doc,.docx,.xls,.xlsx" />
          </label>
          <button className="btn-primary">Đăng thông báo</button>
        </form>
      </Modal>

      <Modal open={Boolean(preview)} title={preview?.title || "Chi tiết thông báo"} onClose={() => setPreview(null)}>
        {preview && (
          <div className="space-y-4 text-sm font-medium text-slate-700">
            <div className="grid gap-2 rounded-2xl border border-sky-100 bg-sky-50 p-3">
              <p><span className="font-black text-slate-900">Ngày giờ:</span> {formatDateTime(preview.createdAt)}</p>
              <p><span className="font-black text-slate-900">Người đăng:</span> {preview.createdBy?.name || "-"}</p>
            </div>
            <p className="whitespace-pre-line leading-7 text-slate-800">{preview.content}</p>
            {preview.attachmentUrl && (
              <div className="rounded-2xl border border-slate-200 bg-white p-3">
                {isImageAttachment(preview) ? (
                  <img src={attachmentUrl(preview)} alt={preview.attachmentName || preview.title} className="max-h-[420px] w-full rounded-xl object-contain" />
                ) : (
                  <a className="inline-flex items-center gap-2 font-bold text-cyan" href={attachmentUrl(preview)} target="_blank" rel="noreferrer">
                    <FileText size={18} /> Xem công văn: {preview.attachmentName || "Tệp đính kèm"}
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
