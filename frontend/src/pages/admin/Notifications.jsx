import React, { useEffect, useState } from "react";
import { Eye, FileText, Image, Plus, Trash2 } from "lucide-react";
import { toast } from "react-toastify";
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
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Đã đăng thông báo.");
      setOpen(false);
      await load();
    } catch (error) {
      toast.error(error.message || "Không thể đăng thông báo");
    }
  };

  const remove = async (item) => {
    const ok = window.confirm(`Xóa thông báo "${item.title}"?`);
    if (!ok) return;

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
        <div>
          <h1 className="text-2xl font-black">Thông báo</h1>
          <p className="text-sm text-slate-400">Đăng thông báo cho học sinh, có thể đính kèm ảnh hoặc công văn.</p>
        </div>
        <button className="btn-primary" onClick={() => setOpen(true)}>
          <Plus size={18} /> Đăng thông báo
        </button>
      </div>

      <DataTable
        data={items}
        searchKey="title"
        columns={[
          { key: "title", label: "Tiêu đề" },
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
            ) : "-",
          },
        ]}
        actions={(row) => (
          <div className="flex gap-2">
            <button className="text-cyan" title="Xem thông báo" onClick={() => setPreview(row)}>
              <Eye size={17} />
            </button>
            <button className="text-rose" title="Xóa thông báo" onClick={() => remove(row)}>
              <Trash2 size={17} />
            </button>
          </div>
        )}
      />

      <Modal open={open} title="Đăng thông báo" onClose={() => setOpen(false)}>
        <form onSubmit={save} className="grid gap-3">
          <input type="hidden" name="receiverRole" value="student" />
          <label className="grid gap-2 text-sm font-semibold text-slate-300">
            Tiêu đề
            <input name="title" className="input" placeholder="Tiêu đề thông báo" required />
          </label>
          <label className="grid gap-2 text-sm font-semibold text-slate-300">
            Nội dung
            <textarea name="content" className="input min-h-32" placeholder="Nội dung thông báo" required />
          </label>
          <label className="grid gap-2 text-sm font-semibold text-slate-300">
            Ảnh thông báo / công văn
            <input type="file" name="file" className="input" accept=".png,.jpg,.jpeg,.webp,.pdf,.doc,.docx,.xls,.xlsx" />
          </label>
          <button className="btn-primary">Đăng thông báo</button>
        </form>
      </Modal>

      <Modal open={Boolean(preview)} title={preview?.title || "Chi tiết thông báo"} onClose={() => setPreview(null)}>
        {preview && (
          <div className="space-y-4 text-sm text-slate-300">
            <div className="grid gap-2 rounded-lg border border-slate-800 bg-slate-950/50 p-3">
              <p><span className="text-slate-500">Ngày giờ:</span> {formatDateTime(preview.createdAt)}</p>
              <p><span className="text-slate-500">Người đăng:</span> {preview.createdBy?.name || "-"}</p>
            </div>
            <p className="whitespace-pre-line leading-7">{preview.content}</p>
            {preview.attachmentUrl && (
              <div className="rounded-lg border border-slate-800 bg-slate-950/50 p-3">
                {isImageAttachment(preview) ? (
                  <img src={attachmentUrl(preview)} alt={preview.attachmentName || preview.title} className="max-h-[420px] w-full rounded-lg object-contain" />
                ) : (
                  <a className="inline-flex items-center gap-2 text-cyan" href={attachmentUrl(preview)} target="_blank" rel="noreferrer">
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
