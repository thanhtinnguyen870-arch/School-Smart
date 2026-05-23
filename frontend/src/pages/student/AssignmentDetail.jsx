import React, { useEffect, useState } from "react";
import { FileText } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import axiosClient from "../../api/axiosClient";

const API_ORIGIN = (import.meta.env.VITE_API_URL || "http://localhost:5000/api").replace(/\/api\/?$/, "");

const fileHref = (item) => (item?.fileUrl ? `${API_ORIGIN}${item.fileUrl}` : "");
const isImageFile = (item) => item?.fileType?.startsWith("image/");

export default function AssignmentDetail() {
  const { id } = useParams();
  const [item, setItem] = useState(null);

  useEffect(() => {
    axiosClient.get(`/assignments/${id}`).then(setItem);
  }, [id]);

  return (
    <div className="card max-w-3xl space-y-4">
      <div>
        <h1 className="text-2xl font-black text-slate-950">{item?.title || "Bài tập"}</h1>
        <p className="mt-1 text-sm font-bold text-slate-500">
          {item?.subject || "Bài tập"} - {item?.classId?.className || "Lớp của tôi"}
        </p>
      </div>

      <p className="whitespace-pre-line leading-7 text-slate-700">{item?.description || "Chưa có nội dung."}</p>
      <p className="text-sm font-bold text-slate-500">Hạn nộp: {item?.deadline ? new Date(item.deadline).toLocaleString("vi-VN") : "-"}</p>

      {item?.fileUrl && (
        <div className="rounded-2xl border border-slate-200 bg-white p-3">
          {isImageFile(item) ? (
            <img src={fileHref(item)} alt={item.fileName || item.title} className="max-h-[480px] w-full rounded-xl object-contain" />
          ) : (
            <a className="inline-flex items-center gap-2 font-bold text-cyan" href={fileHref(item)} target="_blank" rel="noreferrer">
              <FileText size={18} /> Mở file đính kèm: {item.fileName || "Tệp bài tập"}
            </a>
          )}
        </div>
      )}

      <Link className="btn-primary mt-5" to={`/student/assignments/${id}/submit`}>Nộp bài</Link>
    </div>
  );
}
